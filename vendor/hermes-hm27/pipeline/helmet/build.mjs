// Build the Hermes helmet from the source model (Miopass, CC BY 4.0):
//   drop every original texture (the paint, roughness and normal maps all carry the original design),
//   split the parts by connectivity, name and re-material them, bake transforms to real-world metres
//   (facing +z, origin at the bottom centre), embed the livery mask, simplify, compress.
// node build.mjs <scene.gltf> <livery-mask.png> <out.glb>   (run bake.py first; see README.md)
import fs from 'node:fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRMaterialsClearcoat, EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { prune, dedup, compactPrimitive, meshopt, transformMesh, getBounds, weld } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';

const [, , inPath, maskPath, outPath] = process.argv;

/** area-weighted smooth normals from the triangles themselves */
function smoothNormals(doc, prim) {
  const I = prim.getIndices().getArray(); const P = prim.getAttribute('POSITION').getArray(); const N = new Float32Array(P.length);
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const v of [a, b, c]) { N[v] += nx; N[v + 1] += ny; N[v + 2] += nz; }
  }
  for (let v = 0; v < N.length; v += 3) { const l = Math.hypot(N[v], N[v + 1], N[v + 2]) || 1; N[v] /= l; N[v + 1] /= l; N[v + 2] /= l; }
  prim.setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(N).setBuffer(doc.getRoot().listBuffers()[0]));
}
/** Lock every vertex on a crease sharper than `deg` (vent recesses, eye-port flange, spoiler edges) so the
 *  simplifier only thins out the smooth surfaces between them. */
function featureLock(prim, deg = 35) {
  const I = prim.getIndices().getArray(); const P = prim.getAttribute('POSITION').getArray(); const nv = P.length / 3;
  const ids = new Map(); const wid = new Int32Array(nv);
  for (let v = 0; v < nv; v++) { const k = `${Math.round(P[v * 3] * 1e5)},${Math.round(P[v * 3 + 1] * 1e5)},${Math.round(P[v * 3 + 2] * 1e5)}`; if (!ids.has(k)) ids.set(k, ids.size); wid[v] = ids.get(k); }
  const fn = new Float32Array(I.length);
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1;
    fn[t] = nx / l; fn[t + 1] = ny / l; fn[t + 2] = nz / l;
  }
  const edges = new Map();
  for (let t = 0; t < I.length; t += 3) for (let k = 0; k < 3; k++) {
    const wa = wid[I[t + k]], wb = wid[I[t + (k + 1) % 3]]; const key = wa < wb ? wa * 4194304 + wb : wb * 4194304 + wa;
    const list = edges.get(key); if (list) list.push(t); else edges.set(key, [t]);
  }
  const cos = Math.cos((deg * Math.PI) / 180); const lockW = new Uint8Array(ids.size); let n = 0;
  for (const [key, list] of edges) {
    let sharp = false;
    for (let i = 0; i < list.length && !sharp; i++) for (let j = i + 1; j < list.length; j++) { const a = list[i], b = list[j]; if (fn[a] * fn[b] + fn[a + 1] * fn[b + 1] + fn[a + 2] * fn[b + 2] < cos) { sharp = true; break; } }
    if (sharp) { const wa = Math.floor(key / 4194304), wb = key % 4194304; lockW[wa] = lockW[wb] = 1; }
  }
  const lock = new Uint8Array(nv); for (let v = 0; v < nv; v++) { lock[v] = lockW[wid[v]]; n += lock[v]; }
  return [lock, n];
}
/** The source visor is a thin closed shield (outer face, inner face, rounded edge). Simplifying it makes the inner
 *  face and the edge's normals bleed through the outer face, so only the outward-facing sheet is kept. */
function outerSheet(prim, centre) {
  const I = prim.getIndices().getArray(); const P = prim.getAttribute('POSITION').getArray(); const keep = [];
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const nl = Math.hypot(nx, ny, nz) || 1;
    const rx = (P[a] + P[b] + P[c]) / 3 - centre[0], ry = ((P[a + 1] + P[b + 1] + P[c + 1]) / 3 - centre[1]) * 0.3, rz = (P[a + 2] + P[b + 2] + P[c + 2]) / 3 - centre[2];
    if ((nx * rx + ny * ry + nz * rz) / nl / (Math.hypot(rx, ry, rz) || 1) > 0.35) keep.push(I[t], I[t + 1], I[t + 2]);
  }
  prim.getIndices().setArray(Uint32Array.from(keep));
  return compactPrimitive(prim);
}
await Promise.all([MeshoptSimplifier.ready, MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(inPath);
const root = doc.getRoot();
const scene = root.listScenes()[0];
const SCALE = 0.13; // source units -> metres: about 274 mm wide, 280 mm tall

// 0. clean the source: no textures, no stray nodes, no tangents
for (const m of root.listMaterials()) { m.setBaseColorTexture(null); m.setNormalTexture(null); m.setMetallicRoughnessTexture(null); }
for (const t of root.listTextures()) t.dispose();
for (const n of root.listNodes()) if (n.getName().startsWith('Cinema_4D')) { for (const c of n.listChildren()) c.dispose(); n.dispose(); }

// 1. bake node transforms into the meshes
const meshNodes = root.listNodes().filter((n) => n.getMesh());
for (const n of meshNodes) transformMesh(n.getMesh(), n.getWorldMatrix());

// 2. split a source mesh into named groups of connected parts
function parts(prim) {
  const P = prim.getAttribute('POSITION').getArray(); const I = prim.getIndices().getArray();
  const key = new Map(); const weldId = new Int32Array(P.length / 3);
  for (let v = 0; v < P.length / 3; v++) { const k = `${Math.round(P[v * 3] * 1e4)},${Math.round(P[v * 3 + 1] * 1e4)},${Math.round(P[v * 3 + 2] * 1e4)}`; if (!key.has(k)) key.set(k, key.size); weldId[v] = key.get(k); }
  const parent = Int32Array.from({ length: key.size }, (_, i) => i);
  const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  for (let t = 0; t < I.length; t += 3) { const a = find(weldId[I[t]]), b = find(weldId[I[t + 1]]), c = find(weldId[I[t + 2]]); parent[b] = a; parent[find(c)] = a; }
  const groups = new Map();
  for (let t = 0; t < I.length; t += 3) { const r = find(weldId[I[t]]); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(t); }
  return [...groups.values()].map((tris) => {
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (const t of tris) for (let k = 0; k < 3; k++) { const v = I[t + k]; for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], P[v * 3 + a]); hi[a] = Math.max(hi[a], P[v * 3 + a]); } }
    return { tris, lo, hi, n: tris.length };
  }).sort((a, b) => b.n - a.n);
}
function subPrim(prim, tris) {
  const I = prim.getIndices().getArray(); const out = new Uint32Array(tris.length * 3);
  tris.forEach((t, i) => { out[i * 3] = I[t]; out[i * 3 + 1] = I[t + 1]; out[i * 3 + 2] = I[t + 2]; });
  const p = prim.clone(); p.setIndices(doc.createAccessor().setType('SCALAR').setArray(out).setBuffer(root.listBuffers()[0]));
  return compactPrimitive(p);
}

// 3. materials (glTF colours are linear); the component re-tints all of them from livery tokens
const lin = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); return [...c.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)), 1]; };
const clearcoat = doc.createExtension(KHRMaterialsClearcoat);
const mat = (name, hex, rough, metal, cc = 0) => { const m = doc.createMaterial(name).setBaseColorFactor(lin(hex)).setRoughnessFactor(rough).setMetallicFactor(metal).setDoubleSided(true); if (cc) m.setExtension('KHR_materials_clearcoat', clearcoat.createClearcoat().setClearcoatFactor(cc).setClearcoatRoughnessFactor(0.05)); return m; };
const M = {
  Shell: mat('Shell', '#FFFFFF', 0.32, 0, 1),
  Visor: mat('Visor', '#16171A', 0.06, 0.25, 1),
  Trim: mat('Trim', '#0E0F11', 0.3, 0, 1),
  Hardware: mat('Hardware', '#0E0F11', 0.5, 0.15),
  Lining: mat('Lining', '#1A1B1F', 0.92, 0),
};
const maskTex = doc.createTexture('HelmetLivery').setImage(fs.readFileSync(maskPath)).setMimeType('image/png').setURI('helmet-livery.png');
M.Shell.setBaseColorTexture(maskTex);

// 4. regroup: Shell | Visor | Trim (rear spoiler + chin spoiler) | Hardware (vents, pivots, posts) | Lining
const src = Object.fromEntries(meshNodes.map((n) => [n.getMesh().getName(), n]));
const groups = { Shell: [], Visor: [], Trim: [], Hardware: [], Lining: [] };
const take = (name) => src[name].getMesh().listPrimitives()[0];
groups.Shell.push(take('Helmet_main_Helmet_main_0'));
groups.Lining.push(take('Helmet_inside_Helmet_inside_0'));
{ const p = take('Helmet_Component_Helmet_Component_0'); const ps = parts(p); console.log('component parts', ps.map((q) => q.n).join(' '));
  groups.Trim.push(subPrim(p, ps[0].tris)); groups.Hardware.push(subPrim(p, ps.slice(1).flatMap((q) => q.tris))); }
{ const p = take('Helmet_glass_Helmet_glass_0'); const ps = parts(p); console.log('glass parts', ps.map((q) => q.n).join(' '));
  const shield = outerSheet(subPrim(p, ps[0].tris), [0, 0.2, -0.03]); shield.setAttribute('NORMAL', null);
  groups.Visor.push(shield);                         // the shield's outer sheet (normals rebuilt after welding)
  groups.Trim.push(subPrim(p, ps[1].tris));         // the chin spoiler under the visor
  groups.Hardware.push(subPrim(p, ps.slice(2).flatMap((q) => q.tris))); }  // four vent scoops

const helmet = doc.createNode('Helmet');
scene.listChildren().forEach((c) => scene.removeChild(c));
scene.addChild(helmet);
// error-bounded: stop at the error (metres) even if the count isn't reached; the visor shield is ~2.6 mm thick
const TARGET = { Shell: [+(process.env.SHELL_RATIO || 0.3), +(process.env.SHELL_ERR || 0.0005)], Visor: [0.35, 0.00026], Trim: [0.15, 0.0004], Hardware: [0.12, 0.0003], Lining: [0.3, 0.001] };
// even triangles only where the paint is glossy and dark enough to show reflection seams
const REGULAR = { Visor: ['ErrorAbsolute', 'Regularize', 'LockBorder'], Trim: ['ErrorAbsolute', 'Regularize'] };
for (const [name, prims] of Object.entries(groups)) {
  const mesh = doc.createMesh(name);
  for (const p of prims) {
    p.setMaterial(M[name]);
    p.setAttribute('TANGENT', null);
    if (name !== 'Shell') p.setAttribute('TEXCOORD_0', null);
    mesh.addPrimitive(p);
  }
  helmet.addChild(doc.createNode(name).setMesh(mesh));
}
for (const n of meshNodes) { n.getMesh()?.dispose(); n.dispose(); }
await doc.transform(prune(), dedup(), weld());
for (const p of root.listMeshes().find((m) => m.getName() === 'Visor').listPrimitives()) smoothNormals(doc, p);

// 5. real-world size, facing +z, origin at the bottom centre
{ const b = getBounds(scene); const zc = (b.min[2] + b.max[2]) / 2; const s = SCALE;
  const m = [-s, 0, 0, 0, 0, s, 0, 0, 0, 0, -s, 0, 0, -s * b.min[1], s * zc, 1];
  for (const mesh of root.listMeshes()) transformMesh(mesh, m); }

// 6. simplify each group (UV-aware on the shell so the livery edges stay put)
let before = 0, after = 0;
for (const mesh of root.listMeshes()) for (const p of mesh.listPrimitives()) {
  const name = mesh.getName(); const I = Uint32Array.from(p.getIndices().getArray()); const P = p.getAttribute('POSITION').getArray();
  const [ratio, err] = TARGET[name]; const target = Math.floor((I.length / 3) * ratio) * 3; before += I.length / 3;
  let out;
  if (name === 'Shell') {
    // UV-aware so the livery edges stay where they were baked (1 UV unit is roughly 0.3 m of shell); creases locked
    const UV = p.getAttribute('TEXCOORD_0').getArray(); const [lock, nl] = featureLock(p, +(process.env.SHELL_CREASE || 8));
    [out] = MeshoptSimplifier.simplifyWithAttributes(I, P, 3, Float32Array.from(UV), 2, [0.3, 0.3], lock, target, err, ['ErrorAbsolute', 'Regularize']);
    console.log('  shell crease vertices locked', nl);
  } else if (name === 'Trim' || name === 'Hardware') {
    const [lock] = featureLock(p, 35);
    [out] = MeshoptSimplifier.simplifyWithAttributes(I, P, 3, new Float32Array(0), 0, [], lock, target, err, REGULAR[name] ?? ['ErrorAbsolute']);
  } else {
    // Regularize keeps the triangles even, which glossy reflections need; the visor sheet's outline stays locked
    [out] = MeshoptSimplifier.simplify(I, P, 3, target, err, REGULAR[name] ?? ['ErrorAbsolute']);
  }
  console.log(' ', name, I.length / 3, '->', out.length / 3);
  after += out.length / 3;
  p.getIndices().setArray(out); compactPrimitive(p);
  if (name === 'Visor') smoothNormals(doc, p);
}
console.log('triangles', before, '->', after);
await doc.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
root.getAsset().extras = { title: 'Hermes HM-27 driver helmet', source: 'https://sketchfab.com/3d-models/f1-helmet-zhouguanyu-24-1124fa1f754645d7b9d54de84009d463', author: 'Miopass (https://sketchfab.com/miopass)', license: 'CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)', modifications: 'all original textures removed; repainted with the Hermes livery mask; parts regrouped; simplified; rescaled to metres' };
await io.write(outPath, doc);
const b = getBounds(scene);
console.log('bounds min', b.min.map((v) => v.toFixed(3)).join(','), 'max', b.max.map((v) => v.toFixed(3)).join(','));
console.log('wrote', outPath, fs.statSync(outPath).size, 'bytes');
