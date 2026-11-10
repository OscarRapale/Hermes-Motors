# Test drive shot: dawn sky + track layer (with a zoom blur for speed) + car layer, plus projected HUD anchors.
# usage: python3 -I drive_composite.py <bgDir> <carsDir> <out.webp> <outWidth> <dpr>
import json, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

bg_dir, cars_dir, out_path, out_w, dpr = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), float(sys.argv[5])
bg = Image.open(f'{bg_dir}/f00.png').convert('RGBA')
cars = Image.open(f'{cars_dir}/f00.png').convert('RGBA')
meta = json.load(open(f'{cars_dir}/meta.json'))[0]
W, H = bg.size

V = np.array(meta['view']).reshape(4, 4).T
P = np.array(meta['proj']).reshape(4, 4).T
def project(pt):
    c = P @ V @ np.array([*pt, 1.0])
    n = c[:3] / c[3]
    return ((n[0] + 1) / 2 * meta['w'] * dpr, (1 - n[1]) / 2 * meta['h'] * dpr)

cam = meta['pos']
_, horizon_y = project([cam[0], cam[1], cam[2] + 1e5])
vx, vy = project([0, 0.0, 400.0])  # where the straight runs to
print('horizon y', round(horizon_y), 'vanishing', round(vx), round(vy))

# sky: cool overhead into a warm dawn horizon, with the sun's glow over the corner
def rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255
y = np.arange(H, dtype=np.float32)[:, None]
t = np.clip(y / max(horizon_y, 1), 0, 1) ** 1.6
sky = rgb('#C3C9D2') * (1 - t[..., None]) + rgb('#ECEAE6') * t[..., None]
sky = np.broadcast_to(sky, (H, W, 3)).copy()
xx, yy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
gx, gy = W * 0.74, horizon_y
glow = np.exp(-(((xx - gx) / (W * 0.34)) ** 2 + ((yy - gy) / (H * 0.2)) ** 2))
sky = sky * (1 - 0.55 * glow[..., None]) + rgb('#FFF0DF') * (0.55 * glow[..., None])

b = np.asarray(bg).astype(np.float32) / 255
a = b[..., 3:4]
scene = sky * (1 - a) + b[..., :3] * a

# zoom blur away from the vanishing point: sharp in the distance, streaking toward the edges
img = Image.fromarray(np.clip(scene * 255 + 0.5, 0, 255).astype(np.uint8))
acc = np.zeros((H, W, 3), np.float32)
N = 12
for k in range(N):
    s = 1 + 0.055 * k / (N - 1)
    # scale about (vx, vy): output pixel p samples input at c + (p - c) / s
    m = (1 / s, 0, vx - vx / s, 0, 1 / s, vy - vy / s)
    acc += np.asarray(img.transform((W, H), Image.AFFINE, m, resample=Image.BILINEAR)).astype(np.float32)
blurred = acc / N / 255
r = np.sqrt(((xx - vx) / W) ** 2 + ((yy - vy) / H) ** 2)
mask = np.clip((r - 0.12) / 0.35, 0, 1)[..., None] ** 1.2
scene = scene * (1 - mask) + blurred * mask

# the car layer, with its contact shadow smoothed like the specs frames
c = np.asarray(cars).astype(np.float32) / 255
rgbc, al = c[..., :3], c[..., 3]
sh = (al <= 0.85) & (rgbc.max(axis=2) < 0.16)
mk = sh.astype(np.float32)
sm = gaussian_filter(al * mk, 4) / np.maximum(gaussian_filter(mk, 4), 1e-3)
al2 = np.where(sh, sm, al)[..., None]
col = np.where(sh[..., None], rgb('#0E0F11'), rgbc)
scene = scene * (1 - al2) + col * al2

# a light vignette so the glass panels in the corners read
vig = 1 - 0.16 * np.clip((np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) - 0.55) / 0.75, 0, 1) ** 1.5
scene = scene * vig[..., None]

out = Image.fromarray(np.clip(scene * 255 + 0.5, 0, 255).astype(np.uint8))
out_h = round(out_w * H / W)
out.resize((out_w, out_h), Image.LANCZOS).save(out_path, 'WEBP', quality=84, method=6)
bw = int(sys.argv[7]) if len(sys.argv) > 7 else 1440  # board width in CSS pixels
out.resize((bw, round(bw * H / W)), Image.LANCZOS).save(out_path.replace('.webp', '-check.png'))

# HUD anchors in board pixels: the messenger's tag, the player car
scale = bw / W
ghost = [float(v) for v in sys.argv[6].split(',')] if len(sys.argv) > 6 else [2.0, 0, 21]
gx, gy = project([ghost[0], 1.25, ghost[2]])
px, py = project([0, 1.2, 0])
anchors = {'ghostTag': [round(gx * scale, 1), round(gy * scale, 1)], 'player': [round(px * scale, 1), round(py * scale, 1)], 'horizon': round(horizon_y * scale, 1), 'vanish': [round(vx * scale, 1), round(vy * scale, 1)]}
json.dump(anchors, open(out_path.replace('.webp', '-anchors.json'), 'w'))
print('anchors', anchors, 'size', out_w, out_h)
