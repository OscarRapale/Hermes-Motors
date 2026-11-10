// Shared geometry helpers for the Hermes car pipeline (gltf-transform, no Blender needed).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

export const io = () => new NodeIO().registerExtensions(ALL_EXTENSIONS);

const mul3 = (m, x, y, z, w) => [m[0] * x + m[4] * y + m[8] * z + m[12] * w, m[1] * x + m[5] * y + m[9] * z + m[13] * w, m[2] * x + m[6] * y + m[10] * z + m[14] * w];

// inverse-transpose of the upper 3x3 (column-major 4x4 input)
function normalMatrix(m) {
  const a = m[0], b = m[1], c = m[2], d = m[4], e = m[5], f = m[6], g = m[8], h = m[9], i = m[10];
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  // inverse = adj / det ; transpose(inverse) rows = cofactors
  const inv = [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map(v => v / det);
  // inv is row-major inverse; normal matrix = transpose(inv) -> column-major of inverse rows
  return [inv[0], inv[3], inv[6], inv[1], inv[4], inv[7], inv[2], inv[5], inv[8]];
}

// Load every mesh primitive as world-space triangle soup (indexed).
export async function loadWorld(path) {
  const doc = await io().read(path);
  const asset = doc.getRoot().getAsset();
  const parts = [];
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh(); if (!mesh) continue;
    const M = node.getWorldMatrix();
    const NM = normalMatrix(M);
    for (const prim of mesh.listPrimitives()) {
      const pa = prim.getAttribute('POSITION'), na = prim.getAttribute('NORMAL');
      const nv = pa.getCount();
      const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3);
      const t = [0, 0, 0], n = [0, 0, 0];
      for (let v = 0; v < nv; v++) {
        pa.getElement(v, t);
        const w = mul3(M, t[0], t[1], t[2], 1); P[v * 3] = w[0]; P[v * 3 + 1] = w[1]; P[v * 3 + 2] = w[2];
        if (na) {
          na.getElement(v, n);
          let x = NM[0] * n[0] + NM[3] * n[1] + NM[6] * n[2], y = NM[1] * n[0] + NM[4] * n[1] + NM[7] * n[2], z = NM[2] * n[0] + NM[5] * n[1] + NM[8] * n[2];
          const l = Math.hypot(x, y, z) || 1; N[v * 3] = x / l; N[v * 3 + 1] = y / l; N[v * 3 + 2] = z / l;
        }
      }
      const ia = prim.getIndices();
      const idx = ia ? Uint32Array.from(ia.getArray()) : Uint32Array.from({ length: nv }, (_, i) => i);
      parts.push({ name: node.getName(), id: +(node.getName().split('_')[1]), mat: prim.getMaterial()?.getName() || '', P, N, idx });
    }
  }
  return { parts, asset };
}

// Connected components with positions welded at 10 µm (split-normal seams don't break a part apart).
export function components(P, idx) {
  const nv = P.length / 3;
  const key = new Map(); const canon = new Int32Array(nv);
  for (let v = 0; v < nv; v++) {
    const k = Math.round(P[v * 3] * 1e5) + ',' + Math.round(P[v * 3 + 1] * 1e5) + ',' + Math.round(P[v * 3 + 2] * 1e5);
    let c = key.get(k); if (c === undefined) { c = v; key.set(k, v); } canon[v] = c;
  }
  const parent = new Int32Array(nv); for (let i = 0; i < nv; i++) parent[i] = i;
  const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  for (let t = 0; t < idx.length; t += 3) {
    const a = find(canon[idx[t]]), b = find(canon[idx[t + 1]]), c = find(canon[idx[t + 2]]);
    if (a !== b) parent[b] = a; const a2 = find(a); if (a2 !== find(c)) parent[find(c)] = a2;
  }
  const nt = idx.length / 3; const triComp = new Int32Array(nt); const ids = new Map();
  for (let t = 0; t < nt; t++) { const r = find(canon[idx[t * 3]]); let id = ids.get(r); if (id === undefined) { id = ids.size; ids.set(r, id); } triComp[t] = id; }
  const comps = Array.from({ length: ids.size }, () => ({ tris: 0, min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9], area: 0, c: [0, 0, 0] }));
  for (let t = 0; t < nt; t++) {
    const cp = comps[triComp[t]]; cp.tris++;
    const i0 = idx[t * 3] * 3, i1 = idx[t * 3 + 1] * 3, i2 = idx[t * 3 + 2] * 3;
    for (const i of [i0, i1, i2]) for (let k = 0; k < 3; k++) { const v = P[i + k]; if (v < cp.min[k]) cp.min[k] = v; if (v > cp.max[k]) cp.max[k] = v; }
    const ux = P[i1] - P[i0], uy = P[i1 + 1] - P[i0 + 1], uz = P[i1 + 2] - P[i0 + 2];
    const vx = P[i2] - P[i0], vy = P[i2 + 1] - P[i0 + 1], vz = P[i2 + 2] - P[i0 + 2];
    const ar = 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
    cp.area += ar; for (let k = 0; k < 3; k++) cp.c[k] += ar * (P[i0 + k] + P[i1 + k] + P[i2 + k]) / 3;
  }
  for (const cp of comps) { for (let k = 0; k < 3; k++) cp.c[k] = cp.area > 0 ? cp.c[k] / cp.area : (cp.min[k] + cp.max[k]) / 2; }
  return { triComp, comps };
}

// Apply p' = s * (p - o) in place (normals unchanged under uniform scale + translation).
export function normalize(parts, o, s) {
  for (const p of parts) for (let i = 0; i < p.P.length; i += 3) { p.P[i] = s * (p.P[i] - o[0]); p.P[i + 1] = s * (p.P[i + 1] - o[1]); p.P[i + 2] = s * (p.P[i + 2] - o[2]); }
}

export const fmt = (a, d = 3) => '[' + a.map(v => v.toFixed(d)).join(',') + ']';
