"""Minimal glTF 2.0 reader (JSON + one .bin) and a UV-space rasterizer."""
import json, os, numpy as np
CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}

class GLTF:
    def __init__(self, path):
        self.dir = os.path.dirname(path)
        self.j = json.load(open(path))
        self.bufs = [open(os.path.join(self.dir, b['uri']), 'rb').read() for b in self.j['buffers']]
    def accessor(self, i):
        a = self.j['accessors'][i]; bv = self.j['bufferViews'][a['bufferView']]
        dt = np.dtype(CT[a['componentType']]); n = NC[a['type']]
        off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        stride = bv.get('byteStride', dt.itemsize * n)
        raw = np.frombuffer(self.bufs[bv['buffer']], dtype=np.uint8, count=stride * (a['count'] - 1) + dt.itemsize * n, offset=off)
        if stride == dt.itemsize * n:
            arr = raw.view(dt).reshape(a['count'], n)
        else:
            arr = np.lib.stride_tricks.as_strided(raw, shape=(a['count'], dt.itemsize * n), strides=(stride, 1)).copy().view(dt).reshape(a['count'], n)
        return arr.astype(np.float64) if dt == np.float32 else arr.astype(np.int64)
    def mesh(self, name):
        for m in self.j['meshes']:
            if m['name'] == name:
                p = m['primitives'][0]; at = p['attributes']
                d = {k: self.accessor(v) for k, v in at.items()}
                d['indices'] = self.accessor(p['indices']).reshape(-1, 3)
                d['material'] = self.j['materials'][p['material']]['name']
                return d
        raise KeyError(name)

def rasterize_uv(uv, idx, attrs, res):
    """uv: (V,2) glTF UVs (v down). idx: (T,3). attrs: dict name->(V,k). Returns per-pixel attrs, tri id, coverage count."""
    H = W = res
    out = {k: np.zeros((H, W, a.shape[1]), np.float32) for k, a in attrs.items()}
    tri = np.full((H, W), -1, np.int32); cnt = np.zeros((H, W), np.uint8)
    P = uv * res  # pixel space, x right, y down
    for t, (a, b, c) in enumerate(idx):
        pa, pb, pc = P[a], P[b], P[c]
        x0 = int(max(0, np.floor(min(pa[0], pb[0], pc[0])))); x1 = int(min(W - 1, np.ceil(max(pa[0], pb[0], pc[0]))))
        y0 = int(max(0, np.floor(min(pa[1], pb[1], pc[1])))); y1 = int(min(H - 1, np.ceil(max(pa[1], pb[1], pc[1]))))
        if x1 < x0 or y1 < y0: continue
        xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        d = (pb[1] - pc[1]) * (pa[0] - pc[0]) + (pc[0] - pb[0]) * (pa[1] - pc[1])
        if abs(d) < 1e-12: continue
        l1 = ((pb[1] - pc[1]) * (xs - pc[0]) + (pc[0] - pb[0]) * (ys - pc[1])) / d
        l2 = ((pc[1] - pa[1]) * (xs - pc[0]) + (pa[0] - pc[0]) * (ys - pc[1])) / d
        l3 = 1 - l1 - l2
        e = -1e-4
        m = (l1 >= e) & (l2 >= e) & (l3 >= e)
        if not m.any(): continue
        yy = (ys[m] - 0.5).astype(int); xx = (xs[m] - 0.5).astype(int)
        for k, A in attrs.items():
            out[k][yy, xx] = (l1[m, None] * A[a] + l2[m, None] * A[b] + l3[m, None] * A[c]).astype(np.float32)
        tri[yy, xx] = t; cnt[yy, xx] = np.minimum(cnt[yy, xx].astype(int) + 1, 255)
    return out, tri, cnt
