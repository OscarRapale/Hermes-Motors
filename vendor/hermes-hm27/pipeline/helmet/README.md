# Helmet pipeline

Rebuilds `public/models/hermes-helmet.glb` from the source model. You only need this to change the livery's
geometry (feathers, trim band) or the mesh; colours and the race number are set in code (`HermesHelmet`).

## Source

"F1 Helmet ZhouGuanyu 24" by Miopass, CC BY 4.0: <https://sketchfab.com/3d-models/f1-helmet-zhouguanyu-24-1124fa1f754645d7b9d54de84009d463>.
Download the **glTF** version (about 58 MB) and unzip it into its own folder. It isn't included here: its textures
carry a real driver's helmet design, which the build removes entirely and which this project never ships.

## Steps

```bash
cd pipeline && npm install                      # glTF-Transform + meshoptimizer (shared with the car)
pip install -r helmet/requirements.txt
python3 -I helmet/bake.py  /path/to/source/scene.gltf  out/            # -> out/helmet-livery-2048.png
node helmet/build.mjs      /path/to/source/scene.gltf  out/helmet-livery-2048.png  ../public/models/hermes-helmet.glb
```

`sidemap.py` plots the helmet's side in the bake's coordinates with the feathers over it: use it to move them.

## What the build does

1. Removes all twelve source textures (paint, roughness and normal maps all carry the original design).
2. Splits the parts by connectivity and regroups them: **Shell** (painted through the mask), **Visor** (the
   shield's outer sheet only, with rebuilt normals: the source shield is a thin closed solid whose inner face
   bleeds through when simplified), **Trim** (rear spoiler + chin spoiler), **Hardware** (vent scoops, visor
   pivots, HANS posts), **Lining**.
3. Bakes the transforms: metres (×0.13 → 274 × 280 × 374 mm), visor toward +z, origin on the ground under the centre.
4. Simplifies within an absolute error (0.26–1 mm by part), locking every crease sharper than 8° on the shell so
   the chin vents and eye-port flange keep their shape; even triangles (`Regularize`) on the glossy visor and trim.
5. Embeds the mask as the Shell's base-colour texture, then meshopt-compresses: 98,724 → 37,991 triangles, 330 KB.

The source has a small dimple under the chin spoiler (its mount); it's in the original mesh and left as is.
