# Crops the explode frames to one shared box, writes WebPs, and projects the callout anchors.
# usage: python3 -I specs_post.py <framesDir> <outDir> <outWidth> <dpr>
import json, sys, os
import numpy as np
from PIL import Image, ImageDraw

src, out, out_w, dpr = sys.argv[1], sys.argv[2], int(sys.argv[3]), float(sys.argv[4])
os.makedirs(out, exist_ok=True)
meta = json.load(open(f'{src}/meta.json'))

from scipy.ndimage import gaussian_filter
rng = np.random.default_rng(7)

def smooth_shadow(im, sigma=5.0):
    """The contact shadow bands where it fades out under lifted parts; blur only the shadow, then dither."""
    a = np.asarray(im).astype(np.float32) / 255.0
    rgb, al = a[..., :3], a[..., 3]
    sh = (al <= 0.66) & (rgb.max(axis=2) < 0.16)  # shadow and empty pixels; the car stays untouched
    m = sh.astype(np.float32)
    den = gaussian_filter(m, sigma)
    sm = gaussian_filter(al * m, sigma) / np.maximum(den, 1e-3)
    sm = np.where(sm > 0.004, sm + (rng.random(al.shape, dtype=np.float32) - 0.5) / 255.0, 0.0)
    out = a.copy()
    out[..., 3] = np.where(sh, sm, al)
    out[..., :3] = np.where(sh[..., None], np.array([14, 15, 17], np.float32) / 255.0, rgb)
    return Image.fromarray(np.clip(out * 255.0 + 0.5, 0, 255).astype(np.uint8), 'RGBA')

frames = [smooth_shadow(Image.open(f'{src}/f{m["i"]:02d}.png').convert('RGBA')) for m in meta]

boxes = [im.getchannel('A').point(lambda a: 255 if a > 6 else 0).getbbox() for im in frames]
pad = int(18 * dpr)
W, H = frames[0].size
box = (max(0, min(b[0] for b in boxes) - pad), max(0, min(b[1] for b in boxes) - pad),
       min(W, max(b[2] for b in boxes) + pad), min(H, max(b[3] for b in boxes) + pad))
cw, ch = box[2] - box[0], box[3] - box[1]
out_h = round(out_w * ch / cw)
scale = out_w / cw
print('crop', box, 'size', cw, ch, '->', out_w, out_h)

sizes = []
for m, im in zip(meta, frames):
    c = im.crop(box).resize((out_w, out_h), Image.LANCZOS)
    p = f'{out}/hm27-specs-{m["i"]:02d}.webp'
    c.save(p, 'WEBP', quality=82, method=6, alpha_quality=100)
    sizes.append(os.path.getsize(p))
print('webp total', sum(sizes) // 1024, 'KB, max', max(sizes) // 1024, 'KB')

def project(m, pt):
    V = np.array(m['view']).reshape(4, 4).T
    P = np.array(m['proj']).reshape(4, 4).T
    c = P @ V @ np.array([*pt, 1.0])
    n = c[:3] / c[3]
    x, y = (n[0] + 1) / 2 * m['w'], (1 - n[1]) / 2 * m['h']
    # css px of the render -> px of the cropped, resized image
    return [round((x * dpr - box[0]) * scale, 1), round((y * dpr - box[1]) * scale, 1)]

def part(m, k):
    p = m['parts'][k]
    return np.array(p['min']), np.array(p['max'])

def anchors(m):
    a = {}
    lo, hi = part(m, 'FrontWing'); a['frontWing'] = [hi[0] - 0.06, lo[1] + 0.55 * (hi[1] - lo[1]), hi[2] - 0.32]
    lo, hi = part(m, 'RearWing'); a['rearWing'] = [hi[0] - 0.04, hi[1] - 0.1, (lo[2] + hi[2]) / 2]
    lo, hi = part(m, 'Halo'); a['halo'] = [(lo[0] + hi[0]) / 2, hi[1], (lo[2] + hi[2]) / 2 + 0.12]
    o = np.array(m['parts']['Wheel_FL']['origin']); a['wheel'] = [o[0] + 0.2, o[1], o[2]]
    lo, hi = part(m, 'Floor'); a['floor'] = [hi[0] - 0.12, hi[1], (lo[2] + hi[2]) / 2 - 0.35]
    lo, hi = part(m, 'Body'); a['power'] = [0.2, hi[1] - 0.12, -0.55 + (lo[2] - part(meta[0], 'Body')[0][2])]
    a['wbFront'] = [1.08, 0.0, 1.7]; a['wbRear'] = [1.08, 0.0, -1.7]
    return {k: project(m, v) for k, v in a.items()}

result = {'size': [out_w, out_h], 'frames': len(meta), 'anchors': {m['i']: anchors(m) for m in meta},
          'camera': {m['i']: [round(v, 3) for v in m['pos']] for m in meta}}
json.dump(result, open(f'{out}/specs-layout.json', 'w'), indent=1)

# check sheet: chapter frames with their anchors drawn
show = {0: ['wbFront', 'wbRear', 'power'], 6: ['frontWing', 'rearWing'], 12: ['halo'], 18: ['wheel', 'floor']}
sheet = Image.new('RGB', (out_w, out_h * 4), (232, 234, 238))
for row, (i, keys) in enumerate(show.items()):
    im = Image.open(f'{out}/hm27-specs-{i:02d}.webp')
    sheet.paste(im, (0, row * out_h), im)
    d = ImageDraw.Draw(sheet)
    for k in keys:
        x, y = result['anchors'][i][k]
        d.ellipse([x - 7, row * out_h + y - 7, x + 7, row * out_h + y + 7], outline=(213, 18, 30), width=3)
        d.text((x + 10, row * out_h + y - 6), k, fill=(14, 15, 17))
sheet.save(f'{out}/anchors-check.png')
