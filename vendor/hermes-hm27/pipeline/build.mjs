// Restructure the Sketchfab "2026 F1 CAR" (Abu Saif, CC BY 4.0) into the Hermes HM-27 master GLB.
// node build.mjs <source.glb> <master.glb> <report.json>
// Output space: metres, +Y up, nose toward +Z (glTF front), ground at y=0, origin at wheelbase centre.
// Scaled so the wheelbase is exactly 3,400 mm (2026 rule max, matches the site's spec copy).
import { writeFileSync } from 'node:fs';
import { Document, NodeIO } from '@gltf-transform/core';
import { KHRMaterialsClearcoat, KHRMaterialsEmissiveStrength } from '@gltf-transform/extensions';
import { loadWorld, components, normalize, fmt } from './lib.mjs';

const [, , inPath, outPath, reportPath] = process.argv;
const { parts, asset } = await loadWorld(inPath);

// ---------- 1. hubs, ground, scale ----------
const quadOf = (x, z) => (z > -3.3 ? 'F' : 'R') + (x > 0 ? 'L' : 'R'); // +X is the car's LEFT (glTF front = +Z)
const tq = {};
for (const p of parts.filter(p => p.mat.startsWith('Rubber'))) {
  const { comps } = components(p.P, p.idx);
  for (const c of comps) {
    if (c.tris < 100) continue;
    const q = quadOf((c.min[0] + c.max[0]) / 2, (c.min[2] + c.max[2]) / 2);
    const Q = tq[q] ||= { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] };
    for (let k = 0; k < 3; k++) { Q.min[k] = Math.min(Q.min[k], c.min[k]); Q.max[k] = Math.max(Q.max[k], c.max[k]); }
  }
}
const hubSrc = q => tq[q].min.map((v, k) => (v + tq[q].max[k]) / 2);
const zf = (hubSrc('FL')[2] + hubSrc('FR')[2]) / 2, zr = (hubSrc('RL')[2] + hubSrc('RR')[2]) / 2;
const yg = Math.min(...Object.values(tq).map(Q => Q.min[1]));
const xc = ['FL', 'FR', 'RL', 'RR'].reduce((a, q) => a + hubSrc(q)[0], 0) / 4;
const S = 3.4 / (zf - zr), O = [xc, yg, (zf + zr) / 2];
normalize(parts, O, S);
const hub = {}; for (const q of ['FL', 'FR', 'RL', 'RR']) { const h = hubSrc(q); hub[q] = [S * (h[0] - O[0]), S * (h[1] - O[1]), S * (h[2] - O[2])]; }
const tyreR = S * (tq.FL.max[1] - tq.FL.min[1]) / 2;
console.log('scale', S.toFixed(5), 'hub FL', fmt(hub.FL), 'RL', fmt(hub.RL), 'tyre r', tyreR.toFixed(4));

// ---------- 2. classification ----------
// group / role per welded component. Ids are the source node numbers (Object_N); c = component index from components().
const R = (group, role, extra = {}) => ({ group, role, ...extra });
const explicit = {
  2: { '*': R('Floor', 'Carbon') },                                   // plank
  3: { '*': R('Body', 'Metal') },                                     // nose antenna
  4: { '*': R('Body', 'Light') },                                     // rain light
  5: { '*': R('RearWing', 'Metal') },                                 // wing actuator hardware
  6: { 0: R('FrontWing', 'Metal'), 1: R('FrontWing', 'Metal'), 2: R('FrontWing', 'Metal'), 3: R('FrontWing', 'Metal'), 4: R('FrontWing', 'Metal'), 5: R('Body', 'Metal'), '*': R('Body', 'Metal') },
  7: { 0: R('Floor', 'Carbon'), 1: R('Floor', 'Carbon'), 4: R('Floor', 'Carbon', { fences: true }), '*': R('Floor', 'Carbon') },
  8: { '*': R('Floor', 'Carbon', { fences: true }) }, 9: { '*': R('Floor', 'Carbon', { fences: true }) },
  10: { '*': R('Floor', 'Carbon', { fences: true }) }, 11: { '*': R('Floor', 'Carbon', { fences: true }) }, 12: { '*': R('Floor', 'Carbon', { fences: true }) },
  13: { 3: R('Floor', 'Carbon', { fences: true }), 1: R('Suspension', 'Carbon'), 2: R('Suspension', 'Carbon'), '*': R('Suspension', 'Carbon') },
  14: { '*': R('FrontWing', 'Accent') },                              // left outer section + endplate
  15: { '*': R('FrontWing', 'Accent') },                              // right outer section + endplate
  16: { '*': R('Suspension', 'Carbon') },
  17: { 2: R('Wheel_FL', 'Rim'), 3: R('Wheel_FR', 'Rim'), 0: R('RearWing', 'Carbon'), '*': R('Suspension', 'Carbon') },
  18: { 0: R('Body', 'Carbon'), 1: R('Body', 'Carbon'), 2: R('Body', 'Carbon'), 5: R('RearWing', 'Carbon'), '*': R('Body', 'Carbon') },
  19: { '*': R('Body', 'Carbon') },                                   // right mirror
  20: { '*': R('RearWing', 'Carbon') },                               // swan-neck pylon
  21: { '*': R('Body', 'Paint') },                                    // monocoque, nose, sidepods, engine cover (+ halo, split below)
  22: { '*': R('Suspension', 'Carbon') },
  23: { '*': R('Floor', 'Carbon') }, 24: { '*': R('Floor', 'Carbon') }, 25: { '*': R('Floor', 'Carbon') },
  26: { 5: R('Body', 'Carbon'), 6: R('Body', 'Carbon'), 7: R('Body', 'Carbon'), '*': R('Suspension', 'Carbon') },
  27: { 0: R('Body', 'Carbon'), 1: R('Body', 'Carbon'), 5: R('Body', 'Carbon'), 4: R('Suspension', 'Carbon'), '*': R('Body', 'Carbon') },
  28: { '*': R('RearWing', 'Carbon') },
  29: { '*': R('Suspension', 'Carbon') },
  30: { 0: R('Floor', 'Carbon'), 6: R('Suspension', 'Carbon'), 7: R('FrontWing', 'Carbon'), 8: R('FrontWing', 'Carbon'), '*': R('FrontWing', 'Carbon') },
  31: { 2: R('RearWing', 'Accent'), 0: R('FrontWing', 'Carbon'), '*': R('Suspension', 'Carbon') },
  32: { 0: R('Floor', 'Carbon'), 1: R('RearWing', 'Carbon'), '*': R('Floor', 'Carbon') },
  33: { '*': R('Body', 'Carbon') },                                   // nose camera pods
  34: { 0: R('FrontWing', 'Carbon'), 1: R('FrontWing', 'Carbon'), '*': R('Suspension', 'Carbon') },
  35: { '*': R('Suspension', 'Carbon') }, 36: { '*': R('Suspension', 'Carbon') }, // front brake ducts
  37: { '*': R('FrontWing', 'Carbon') },                              // front wing flaps
  38: { 4: R('Body', 'Paint'), 5: R('RearWing', 'Carbon'), '*': R('Body', 'Carbon') }, // fin / main plane / cockpit + airbox internals
  39: { '*': R('RearWing', 'Accent') },                               // rear wing endplates
};
// normalised space: front axle at z=+1.7, rear at z=-1.7
const wheelOf = (c) => 'Wheel_' + (c.c[2] > 0 ? 'F' : 'R') + (c.c[0] > 0 ? 'L' : 'R');
function classify(id, mat, ci, c) {
  if (mat.startsWith('Rubber')) return R(wheelOf(c), 'Tyre');
  if (id === 40 || id === 41) return R(wheelOf(c), 'Rim');
  const e = explicit[id];
  if (e && e[ci]) return e[ci];
  // small leftovers: region first, then the object's default
  if (c.tris < 200) {
    if (c.c[2] > 2.05 && c.c[1] < 0.35) return R('FrontWing', 'Carbon');
    if (c.c[2] < -1.95 && c.c[1] > 0.6) return R('RearWing', 'Carbon');
  }
  return (e && e['*']) || R('Body', 'Carbon');
}

// ---------- 3. bucket triangles ----------
const buckets = new Map(); // key group|role|fences -> { group, role, fences, list: [part, tri, part, tri, ...] }
const bucket = (g, r, f) => { const k = g + '|' + r + '|' + (f ? 1 : 0); let b = buckets.get(k); if (!b) { b = { group: g, role: r, fences: !!f, list: [] }; buckets.set(k, b); } return b; };
for (const p of parts) {
  const { triComp, comps } = components(p.P, p.idx);
  const cls = comps.map((c, i) => classify(p.id, p.mat, i, c));
  for (let t = 0; t < triComp.length; t++) {
    const k = cls[triComp[t]];
    bucket(k.group, k.role, k.fences).list.push(p, t);
  }
}

// ---------- 4. new document ----------
const doc = new Document();
doc.getRoot().getAsset().generator = 'Hermes Motors car pipeline (glTF-Transform)';
const buf = doc.createBuffer();
const cc = doc.createExtension(KHRMaterialsClearcoat);
const es = doc.createExtension(KHRMaterialsEmissiveStrength);
const lin = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); };
const MAT = {
  Paint: { color: '#F4F4F5', metal: 0, rough: 0.32, coat: 1, coatRough: 0.06 },
  Carbon: { color: '#0E0F11', metal: 0.15, rough: 0.38, coat: 0.6, coatRough: 0.14 },
  Accent: { color: '#D5121E', metal: 0, rough: 0.3, coat: 1, coatRough: 0.06 },
  Tyre: { color: '#151517', metal: 0, rough: 0.86 },
  Rim: { color: '#16171A', metal: 0.75, rough: 0.32 },
  Metal: { color: '#4B4F57', metal: 1, rough: 0.35 },
  Light: { color: '#D5121E', metal: 0, rough: 0.4, emissive: '#FF2A35', strength: 2 },
};
const mats = {};
for (const [name, m] of Object.entries(MAT)) {
  const mat = doc.createMaterial(name).setBaseColorFactor([...lin(m.color), 1]).setMetallicFactor(m.metal).setRoughnessFactor(m.rough).setDoubleSided(true);
  if (m.coat) mat.setExtension('KHR_materials_clearcoat', cc.createClearcoat().setClearcoatFactor(m.coat).setClearcoatRoughnessFactor(m.coatRough));
  if (m.emissive) { mat.setEmissiveFactor(lin(m.emissive)); mat.setExtension('KHR_materials_emissive_strength', es.createEmissiveStrength().setEmissiveStrength(m.strength)); }
  mats[name] = mat;
}

function buildPrimitive(list, offset) {
  const remap = new Map(); const P = [], N = [], I = [];
  for (let i = 0; i < list.length; i += 2) {
    const p = list[i], t = list[i + 1];
    for (let j = 0; j < 3; j++) {
      const v = p.idx[t * 3 + j]; const key = p.id * 1e7 + v;
      let n = remap.get(key);
      if (n === undefined) { n = P.length / 3; remap.set(key, n); P.push(p.P[v * 3] - offset[0], p.P[v * 3 + 1] - offset[1], p.P[v * 3 + 2] - offset[2]); N.push(p.N[v * 3], p.N[v * 3 + 1], p.N[v * 3 + 2]); }
      I.push(n);
    }
  }
  return { P: new Float32Array(P), N: new Float32Array(N), I: new Uint32Array(I) };
}

// ---------- 3b. two-tone: the carbon lower band is cut into the geometry (crisp edge in any viewer) ----------
// Carbon below BAND.h, behind a front edge that leans forward at the brand's 14 degrees.
const BAND = { h: +(process.env.BAND_H || 0.30), z0: +(process.env.BAND_Z0 || 0.85), slant: Math.tan(14 * Math.PI / 180) };
function cutMesh(g, f) {
  const nv = g.P.length / 3; const fv = new Float64Array(nv);
  for (let v = 0; v < nv; v++) fv[v] = f(g.P[v * 3], g.P[v * 3 + 1], g.P[v * 3 + 2]);
  const sides = [{ P: [], N: [], I: [], map: new Map() }, { P: [], N: [], I: [], map: new Map() }]; // 0: f<0, 1: f>=0
  const vert = (s, key, make) => { let n = s.map.get(key); if (n === undefined) { n = s.P.length / 3; s.map.set(key, n); const [p, nn] = make(); s.P.push(p[0], p[1], p[2]); s.N.push(nn[0], nn[1], nn[2]); } return n; };
  const orig = v => () => [[g.P[v * 3], g.P[v * 3 + 1], g.P[v * 3 + 2]], [g.N[v * 3], g.N[v * 3 + 1], g.N[v * 3 + 2]]];
  const inter = (a, b) => () => {
    const t = fv[a] / (fv[a] - fv[b]);
    const p = [0, 1, 2].map(k => g.P[a * 3 + k] + t * (g.P[b * 3 + k] - g.P[a * 3 + k]));
    const n = [0, 1, 2].map(k => g.N[a * 3 + k] + t * (g.N[b * 3 + k] - g.N[a * 3 + k])); const l = Math.hypot(...n) || 1;
    return [p, n.map(x => x / l)];
  };
  const ek = (a, b) => 'e' + Math.min(a, b) + '_' + Math.max(a, b);
  for (let t = 0; t < g.I.length; t += 3) {
    const v = [g.I[t], g.I[t + 1], g.I[t + 2]]; const s = v.map(x => (fv[x] < 0 ? 0 : 1));
    if (s[0] === s[1] && s[1] === s[2]) { const Sd = sides[s[0]]; for (const x of v) Sd.I.push(vert(Sd, 'v' + x, orig(x))); continue; }
    const li = s[0] === s[1] ? 2 : s[0] === s[2] ? 1 : 0;
    const L = v[li], M1 = v[(li + 1) % 3], M2 = v[(li + 2) % 3];
    const SL = sides[s[li]], SM = sides[1 - s[li]];
    SL.I.push(vert(SL, 'v' + L, orig(L)), vert(SL, ek(L, M1), inter(L, M1)), vert(SL, ek(L, M2), inter(L, M2)));
    const x1 = vert(SM, ek(L, M1), inter(L, M1)), x2 = vert(SM, ek(L, M2), inter(L, M2)), m1 = vert(SM, 'v' + M1, orig(M1)), m2 = vert(SM, 'v' + M2, orig(M2));
    SM.I.push(x1, m1, m2, x1, m2, x2);
  }
  const fin = Sd => ({ P: new Float32Array(Sd.P), N: new Float32Array(Sd.N), I: new Uint32Array(Sd.I) });
  return [fin(sides[0]), fin(sides[1])];
}
const concat = (a, b) => {
  const nv = a.P.length / 3; const I = new Uint32Array(a.I.length + b.I.length); I.set(a.I); for (let i = 0; i < b.I.length; i++) I[a.I.length + i] = b.I[i] + nv;
  const P = new Float32Array(a.P.length + b.P.length); P.set(a.P); P.set(b.P, a.P.length);
  const N = new Float32Array(a.N.length + b.N.length); N.set(a.N); N.set(b.N, a.N.length);
  return { P, N, I };
};
const keyOf = (g, r, f) => g + '|' + r + '|' + (f ? 1 : 0);
const geomFor = new Map();
{
  const paint0 = buildPrimitive(buckets.get(keyOf('Body', 'Paint', false)).list, [0, 0, 0]);
  // Halo: its outer faces blend smoothly into the shell, so it is cut out with planes, not picked by patch.
  // Region: above the cockpit rim, between the rear mounts and the front pillar.
  const HB = { y: +(process.env.HALO_Y || 0.68), zr: +(process.env.HALO_ZR || -0.04), zf: 0.85, x: 0.40 };
  const [low, up] = cutMesh(paint0, (x, y, z) => y - HB.y);
  const [behind, ahead] = cutMesh(up, (x, y, z) => z - HB.zr);
  const [inZ, front0] = cutMesh(ahead, (x, y, z) => z - HB.zf);
  const [inX, outL] = cutMesh(inZ, (x, y, z) => x - HB.x);
  const [halo, outR] = cutMesh(inX, (x, y, z) => -x - HB.x);
  const shell = [behind, front0, outL, outR].reduce(concat, low);
  geomFor.set(keyOf('Halo', 'Carbon', false), halo);
  // Two-tone band on what is left of the shell.
  const [below, above] = cutMesh(shell, (x, y, z) => y - BAND.h);
  const [band, front] = cutMesh(below, (x, y, z) => z - y * BAND.slant - BAND.z0);
  geomFor.set(keyOf('Body', 'Paint', false), concat(above, front));
  geomFor.set(keyOf('Body', 'Carbon', false), concat(buildPrimitive(buckets.get(keyOf('Body', 'Carbon', false)).list, [0, 0, 0]), band));
  console.log('halo', JSON.stringify(HB), 'tris', halo.I.length / 3, '| band', JSON.stringify(BAND), 'tris', band.I.length / 3);
}

const ORDER = ['Body', 'Halo', 'FrontWing', 'RearWing', 'Floor', 'Suspension', 'Wheel_FL', 'Wheel_FR', 'Wheel_RL', 'Wheel_RR'];
const ROLE_ORDER = ['Paint', 'Carbon', 'Accent', 'Metal', 'Light', 'Tyre', 'Rim'];
const rootNode = doc.createNode('HermesCar');
const report = { scale: S, origin: O, hubs: hub, tyreRadius: tyreR, nodes: {} };
let total = 0;
for (const g of ORDER) {
  const isWheel = g.startsWith('Wheel_');
  const q = isWheel ? g.slice(6) : null;
  const offset = isWheel ? hub[q] : [0, 0, 0];
  const groupNode = doc.createNode(g);
  let holder = groupNode;
  if (isWheel) { groupNode.setTranslation(offset); holder = doc.createNode(g + '_Spin'); groupNode.addChild(holder); }
  for (const role of ROLE_ORDER) for (const fences of [false, true]) {
    const b = buckets.get(g + '|' + role + '|' + (fences ? 1 : 0)); if ((!b || !b.list.length) && !geomFor.has(keyOf(g, role, fences))) continue;
    const { P, N, I } = geomFor.get(keyOf(g, role, fences)) || buildPrimitive(b.list, offset);
    const name = isWheel ? `${g}_${role}` : (fences ? `${g}_Fences` : `${g}_${role}`);
    const prim = doc.createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(P).setBuffer(buf))
      .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(N).setBuffer(buf))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(I).setBuffer(buf))
      .setMaterial(mats[role]);
    holder.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)));
    report.nodes[name] = I.length / 3; total += I.length / 3;
  }
  rootNode.addChild(groupNode);
}
const r3 = v => v.map(x => +x.toFixed(4));
rootNode.setExtras({
  name: 'Hermes Motors HM-27', units: 'metres', up: '+Y', forward: '+Z', origin: 'ground plane, centre of wheelbase',
  wheelbase: 3.4, wheelRadius: +tyreR.toFixed(4),
  hubs: { FL: r3(hub.FL), FR: r3(hub.FR), RL: r3(hub.RL), RR: r3(hub.RR) },
  credit: '"2026 F1 CAR" by Abu Saif (https://sketchfab.com/abuhossain844), CC BY 4.0, https://sketchfab.com/3d-models/2026-f1-car-2ab508a1dc614e9d9c82e29a7c05dfe2. Modified: re-scaled, split into parts, re-materialled in the Hermes livery, re-meshed.',
});
const scene = doc.createScene('Scene').addChild(rootNode);
doc.getRoot().setDefaultScene(scene);
doc.getRoot().getAsset().extras = { ...(asset.extras || {}), modifiedBy: 'Hermes Motors concept project' };
report.total = total;
await new NodeIO().registerExtensions([KHRMaterialsClearcoat, KHRMaterialsEmissiveStrength]).write(outPath, doc);
writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log('total tris', total);
for (const [k, v] of Object.entries(report.nodes)) console.log(' ', k.padEnd(22), v);
