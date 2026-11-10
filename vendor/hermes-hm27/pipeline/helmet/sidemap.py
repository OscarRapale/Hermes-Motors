"""Plot the helmet's side in the bake's coordinates (s = -z front to the right, t = y, source units) with the
feathers over it: the visor, the spoiler and the hardware show where they can go.
usage: python3 -I sidemap.py <source scene.gltf> <out.png>   (feather numbers: FEATHERS in bake.py; keep both in step)"""
import sys, os, math
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gl import GLTF
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from matplotlib.patches import Polygon

TAN14 = math.tan(math.radians(14))
def feather(s_front, t_front, length, thick=0.105, back_cut=0.065, front_cut=0.03):
    sb = s_front - length
    return [(s_front + front_cut, t_front + thick), (sb + back_cut, t_front + thick + length * TAN14), (sb, t_front + length * TAN14), (s_front, t_front)]
FEATHERS = [feather(-0.115, 0.200, 0.44), feather(-0.145, 0.005, 0.36), feather(-0.175, -0.190, 0.28)]

g = GLTF(sys.argv[1])
P = lambda name: g.mesh(name)['POSITION'] * 0.01
fig, ax = plt.subplots(figsize=(11, 8.4), dpi=110)
sh = P('Helmet_main_Helmet_main_0'); ax.scatter(-sh[:, 2], sh[:, 1], s=0.2, c='#c4c7cc', label='shell')
gv = P('Helmet_glass_Helmet_glass_0'); v = gv[(gv[:, 1] > -0.22) & (gv[:, 1] < 0.55) & (gv[:, 2] < 0.05)]
ax.scatter(-v[:, 2], v[:, 1], s=0.2, c='#333333', label='visor')
co = P('Helmet_Component_Helmet_Component_0'); spoiler = (co[:, 2] > 0.55) & (co[:, 1] > 0.1)
ax.scatter(-co[spoiler & (co[:, 0] > 0.5), 2], co[spoiler & (co[:, 0] > 0.5), 1], s=0.4, c='#2b7de0', label='spoiler (side)')
ax.scatter(-co[~spoiler & (co[:, 0] > 0.5), 2], co[~spoiler & (co[:, 0] > 0.5), 1], s=0.4, c='#e0b02b', label='hardware (side)')
for f in FEATHERS: ax.add_patch(Polygon(f, closed=True, fc='#D5121E', ec='#D5121E', alpha=0.6))
ax.set_aspect('equal'); ax.set_xlim(-1.5, 1.55); ax.set_ylim(-0.95, 1.35); ax.grid(True, lw=0.3)
ax.set_xlabel('s = -z (front ->)'); ax.set_ylabel('t = y'); ax.legend(loc='upper left', markerscale=20)
plt.tight_layout(); plt.savefig(sys.argv[2]); print('wrote', sys.argv[2])
