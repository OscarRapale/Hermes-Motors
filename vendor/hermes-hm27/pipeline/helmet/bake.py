"""Bake the Hermes helmet livery into a mask texture in the shell's UV space.

usage: python3 -I bake.py <source scene.gltf> <out dir> [resolution=2048]  ->  <out dir>/helmet-livery-<res>.png

Every texel of the shell is rasterised with its 3D position and normal, and the livery is evaluated in 3D:
  R  the three feathers: parallelograms in the side view (s = -z, t = y, source units), projected along x so
     both sides carry them, only where the shell faces sideways; longest on top like the mark, rising at 14 deg
  G  the trim band: the two bottom-rim islands plus the shell within RIM_W of them
  B  the octagonal vent wells (always dark)
The mask is dilated past every island edge so mipmaps never pull in black.
"""
import sys, os, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gl import GLTF, rasterize_uv
from scipy import ndimage
from PIL import Image

src, out, RES = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 2048
g = GLTF(src)
m = g.mesh('Helmet_main_Helmet_main_0')
pos = m['POSITION'] * 0.01; nrm = m['NORMAL']; uv = m['TEXCOORD_0']
o, tri, cnt = rasterize_uv(uv, m['indices'], {'p': pos, 'n': nrm}, RES)
cov = cnt > 0
P = o['p']; N = o['n'] / np.maximum(np.linalg.norm(o['n'], axis=2, keepdims=True), 1e-6)

# --- islands: the big shell, the two bottom-rim bands, the octagonal vent wells
lab, n = ndimage.label(cov)
sizes = ndimage.sum(cov, lab, index=np.arange(1, n + 1))
meanp = np.array([P[lab == i].mean(0) if sizes[i - 1] else np.zeros(3) for i in range(1, n + 1)])
big = 1 + int(np.argmax(sizes))
rim = [i + 1 for i in range(n) if sizes[i] > 0.02 * cov.sum() and i + 1 != big and meanp[i][1] < -0.5]
vents = [i + 1 for i in range(n) if i + 1 != big and i + 1 not in rim and sizes[i] > 50]
print('islands', n, 'shell', big, 'rim', rim, 'vents', vents)

# --- side projection: s = -z (front positive), t = y; drawing coords -> (s, t)
X0, X1, Y0, Y1 = 30.0, 288.0, 22.0, 216.0           # the drawing's shell extents
S0, S1, T0, T1 = -1.40, 1.41, -0.88, 1.26            # the model's side extents
def svg(x, y): return (S0 + (x - X0) / (X1 - X0) * (S1 - S0), T1 - (y - Y0) / (Y1 - Y0) * (T1 - T0))
import math
TAN14 = math.tan(math.radians(14))     # the brand's angle
def feather(s_front, t_front, length, thick=0.105, back_cut=0.065, front_cut=0.03):
    """a parallelogram that rises toward the back; both ends lean like the drawing's"""
    sb = s_front - length
    return [(s_front + front_cut, t_front + thick), (sb + back_cut, t_front + thick + length * TAN14), (sb, t_front + length * TAN14), (s_front, t_front)]
# The board's feathers (M141,112 L64,88 ...) run back under this helmet's spoiler, so they are refitted to the
# space between the visor's rear edge (s ~ -0.03) and the spoiler's front edge (s ~ -0.60): top one longest,
# each lower one starting a step further back and ending a step further forward, as in the mark.
FEATHERS = [feather(-0.115, 0.200, 0.44), feather(-0.145, 0.005, 0.36), feather(-0.175, -0.190, 0.28)]
s = -P[..., 2]; t = P[..., 1]
def poly_sd(pts, s, t):
    """signed distance (positive inside) to a convex polygon given in (s, t)"""
    # orientation
    area = sum(pts[i][0] * pts[(i + 1) % 4][1] - pts[(i + 1) % 4][0] * pts[i][1] for i in range(4))
    sign = 1 if area > 0 else -1
    d = np.full(s.shape, np.inf)
    for i in range(4):
        (a0, a1), (b0, b1) = pts[i], pts[(i + 1) % 4]
        ex, ey = b0 - a0, b1 - a1; L = np.hypot(ex, ey)
        # left normal for CCW polygons points inside
        nx, ny = -ey / L * sign, ex / L * sign
        d = np.minimum(d, (s - a0) * nx + (t - a1) * ny)
    return d
AA = 0.0045 * 2048 / RES        # about one texel in model units
side = np.clip((np.abs(N[..., 0]) - 0.30) / 0.15, 0, 1)   # only where the shell faces sideways
fe = np.zeros(s.shape)
for f in FEATHERS:
    fe = np.maximum(fe, np.clip(poly_sd(f, s, t) / AA + 0.5, 0, 1))
R = fe * side * (lab == big)
rimpx = np.isin(lab, rim)
from scipy.spatial import cKDTree
RIM_W = 0.07
tree = cKDTree(P[rimpx][::7])
shellpx = (lab == big)
dd, _ = tree.query(P[shellpx], k=1)
G = rimpx.astype(float)
G[shellpx] = np.clip((RIM_W - dd) / AA + 0.5, 0, 1)
G = np.maximum(G, rimpx)
B = np.isin(lab, vents).astype(float)
mask = np.stack([R, G, B], -1)
mask[~cov] = 0

# --- dilate past island edges so mipmaps and bilinear filtering never pull in black
dist, (iy, ix) = ndimage.distance_transform_edt(~cov, return_indices=True)
fill = mask[iy, ix]; grow = (~cov) & (dist <= 12)
mask[grow] = fill[grow]
img = (mask * 255 + 0.5).clip(0, 255).astype(np.uint8)
os.makedirs(out, exist_ok=True)
Image.fromarray(img, 'RGB').save(os.path.join(out, f'helmet-livery-{RES}.png'), optimize=True)
prev = img.copy(); prev[~(cov | grow)] = (40, 40, 40)
Image.fromarray(prev).resize((1024, 1024)).save(os.path.join(out, 'mask-preview.png'))
print('feather px', int((R > 0.5).sum()), 'rim px', int(G.sum()), 'vent px', int(B.sum()))
print('wrote', os.path.join(out, f'helmet-livery-{RES}.png'), os.path.getsize(os.path.join(out, f'helmet-livery-{RES}.png')), 'bytes')
