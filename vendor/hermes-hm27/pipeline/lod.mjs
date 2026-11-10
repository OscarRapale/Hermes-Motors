// Build a compressed LOD from the master: error-bounded simplification to a triangle budget,
// seams between split parts locked (no cracks), then quantization + EXT_meshopt_compression.
// node lod.mjs <master.glb> <out.glb> <budgetTris> [drop=Floor_Fences,...] [posBits=16]
import { NodeIO } from '@gltf-transform/core';
import { KHRMaterialsClearcoat, KHRMaterialsEmissiveStrength, EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { weld, prune, dedup, compactPrimitive, meshopt } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';

const [, , inPath, outPath, budgetArg, dropArg = '', bitsArg = '16'] = process.argv;
const BUDGET = +budgetArg; const DROP = dropArg.split(',').filter(Boolean); const POS_BITS = +bitsArg;
await Promise.all([MeshoptSimplifier.ready, MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO()
  .registerExtensions([KHRMaterialsClearcoat, KHRMaterialsEmissiveStrength, EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(inPath);

// 1. drop nodes not wanted in this LOD
for (const n of doc.getRoot().listNodes()) if (DROP.includes(n.getName())) { n.getMesh()?.dispose(); n.dispose(); }
await doc.transform(weld(), prune());

// 2. importance per node: >1 = allowed to be coarser
const WK = +(process.env.WHEEL_K || 1);
const IMPORTANCE = { Wheel_FL_Tyre: WK, Wheel_FR_Tyre: WK, Wheel_RL_Tyre: WK, Wheel_RR_Tyre: WK, Wheel_FL_Rim: WK, Wheel_FR_Rim: WK, Wheel_RL_Rim: WK, Wheel_RR_Rim: WK, Floor_Fences: 4, Floor_Carbon: 1.6, Suspension_Carbon: 1.4, RearWing_Metal: 2, FrontWing_Metal: 1.5, Body_Metal: 1.2 };
const items = [];
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue;
  for (const prim of mesh.listPrimitives()) {
    const P = prim.getAttribute('POSITION').getArray();
    const I = Uint32Array.from(prim.getIndices().getArray());
    items.push({ name: node.getName(), prim, P, I, k: IMPORTANCE[node.getName()] || 1 });
  }
}

// 3. lock vertices that sit on a seam shared with another primitive (body/halo cut, carbon band)
const key = (P, v) => Math.round(P[v * 3] * 2e4) + ',' + Math.round(P[v * 3 + 1] * 2e4) + ',' + Math.round(P[v * 3 + 2] * 2e4);
const owners = new Map();
items.forEach((it, i) => { if (it.name.startsWith('Wheel_')) return; const nv = it.P.length / 3; for (let v = 0; v < nv; v++) { const k = key(it.P, v); const o = owners.get(k); if (o === undefined) owners.set(k, i); else if (o !== i) owners.set(k, -1); } });
for (const [i, it] of items.entries()) {
  const nv = it.P.length / 3; it.lock = new Uint8Array(nv); let n = 0;
  if (!it.name.startsWith('Wheel_')) for (let v = 0; v < nv; v++) if (owners.get(key(it.P, v)) === -1) { it.lock[v] = 1; n++; }
  it.locked = n;
}

// 4. binary-search one absolute error (metres) so the whole car lands on the budget
const run = (err, commit = false) => {
  let total = 0;
  for (const it of items) {
    const [idx] = MeshoptSimplifier.simplifyWithAttributes(it.I, it.P, 3, new Float32Array(0), 0, [], it.lock, 0, err * it.k, ['ErrorAbsolute', 'Prune']);
    total += idx.length / 3;
    if (commit) it.out = idx;
  }
  return total;
};
const orig = items.reduce((a, it) => a + it.I.length / 3, 0);
let lo = 1e-5, hi = 0.05, best = hi;
if (run(lo) <= BUDGET) best = lo;
else for (let i = 0; i < 26; i++) { const mid = Math.sqrt(lo * hi); const t = run(mid); if (t > BUDGET) lo = mid; else { hi = mid; best = mid; } if (hi / lo < 1.01) break; }
const total = run(best, true);
console.log(`budget ${BUDGET}  source ${orig}  -> ${total} tris at error ${(best * 1000).toFixed(3)} mm`);

// 5. write back, compact, compress
for (const it of items) {
  const acc = it.prim.getIndices();
  acc.setArray(it.out);
  compactPrimitive(it.prim);
}
await doc.transform(prune(), dedup());
const report = {};
for (const node of doc.getRoot().listNodes()) { const m = node.getMesh(); if (m) report[node.getName()] = m.listPrimitives().reduce((a, p) => a + p.getIndices().getCount() / 3, 0); }
await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'high', quantizePosition: POS_BITS, quantizeNormal: 10 }));
doc.getRoot().listNodes().find(n => n.getName() === 'HermesCar')?.setExtras({ ...doc.getRoot().listNodes().find(n => n.getName() === 'HermesCar').getExtras(), lod: { triangles: total, errorMm: +(best * 1000).toFixed(3) } });
await io.write(outPath, doc);
for (const [k, v] of Object.entries(report)) console.log('  ', k.padEnd(20), v);
console.log('locked seam vertices', items.reduce((a, it) => a + it.locked, 0));
