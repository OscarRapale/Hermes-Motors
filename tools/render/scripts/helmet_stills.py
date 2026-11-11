"""Crop the harness's helmet renders (1440 x 1100, scene=helmet, fov 15) to one shared frame, fade the edges so the
ground shadow's faint penumbra never ends in a line, and write a PNG source plus an 800 px WebP for each.
usage: python3 -I helmet_stills.py <render.png> <out stem>   ->  <stem>.png (1140 x 940) and <stem>.webp (800 x 660)"""
import sys
import numpy as np
from PIL import Image

BOX = (150, 120, 1290, 1060)   # centred on the camera axis, so the left- and right-facing stills mirror
FADE = 80                      # px of edge fade at source size
src, stem = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGBA').crop(BOX)).astype(float)
def ramp(n):
    t = np.clip(np.minimum(np.arange(n), np.arange(n)[::-1]) / FADE, 0, 1)
    return t * t * (3 - 2 * t)
im[..., 3] *= np.outer(ramp(im.shape[0]), ramp(im.shape[1]))
out = Image.fromarray(im.round().clip(0, 255).astype(np.uint8), 'RGBA')
out.save(stem + '.png', optimize=True)
out.resize((800, round(800 * out.height / out.width)), Image.LANCZOS).save(stem + '.webp', quality=90, method=6, exact=True)
print('wrote', stem + '.png', stem + '.webp')
