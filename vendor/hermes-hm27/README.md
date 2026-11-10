# Hermes Motors · HM-27 car and driver helmet (v2.2)

The HM-27 for the Hermes Motors site: the Sketchfab car cleaned, rescaled to the 2026 rules, split into named parts, cut for the livery and compressed into two weights. React Three Fiber components paint it in the brand book livery, take it apart for the specs section and put it on the Proving Ground for the test drive. Since v2.2 the package also carries the drivers' helmet: one repainted model that `HermesHelmet` dresses in each driver's livery, the dark pre-launch look or the messenger's see-through one.

## Credit (required by the licence)

The car is based on **"2026 F1 CAR" by Abu Saif** ([sketchfab.com/abuhossain844](https://sketchfab.com/abuhossain844)), licensed under **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**.
Source: <https://sketchfab.com/3d-models/2026-f1-car-2ab508a1dc614e9d9c82e29a7c05dfe2>
Changes: rescaled, split into parts, re-meshed into two levels of detail, re-materialled, Hermes livery added.

Put this line somewhere visible on every page that shows the car (the site footer does this) and in the case study credits:

> 3D model based on "2026 F1 CAR" by Abu Saif, CC BY 4.0, modified.

The **helmet** is based on a model by **Miopass** ([sketchfab.com/miopass](https://sketchfab.com/miopass)), also **CC BY 4.0**.
Source: <https://sketchfab.com/3d-models/f1-helmet-zhouguanyu-24-1124fa1f754645d7b9d54de84009d463>
Changes: every original texture removed (the source replicates a real driver's 2024 helmet; none of that design, nor any logo, remains), repainted with the Hermes livery, parts regrouped, simplified, rescaled. CC BY 4.0 doesn't require the source's title, so the credit names the author and links the source:

> Driver helmet based on a model by Miopass, CC BY 4.0, modified.

## What's inside

| Path | What it is |
| --- | --- |
| `public/models/hermes-hm27.glb` | Landing version: 279,590 triangles, 1.17 MB, max deviation from the original 0.10 mm |
| `public/models/hermes-hm27-game.glb` | Test-drive and phone version: 49,521 triangles, 281 KB, max deviation 0.76 mm |
| `public/models/hermes-helmet.glb` | The drivers' helmet: 37,991 triangles, 330 KB, livery mask embedded (R feathers · G trim band · B vent wells) |
| `public/livery/*.png` | Livery artwork as white masks (the component tints them) |
| `public/track/*.png` | Proving Ground textures: asphalt, kerb, the gantry sign |
| `src/hermes/HermesCar.tsx` | The car: livery, wheels, explode (with per-part timing) |
| `src/hermes/HermesStudio.tsx` | Studio lighting, day and night, with or without the room |
| `src/hermes/HermesEffects.tsx` | Optional ambient occlusion and tone mapping (the only file that needs postprocessing) |
| `src/hermes/ProvingGround.tsx` | The test-drive world: track builder, gantry, outdoor reflections, the messenger's ghost car |
| `src/hermes/livery.ts` | Colour tokens and the two liveries |
| `src/hermes/HermesHelmet.tsx` | The helmet: livery from tokens (`HELMET_LIVERIES`), race number on the chin, its own ground shadow |
| `src/examples/Exhibition.tsx` | Drag to turn, scroll to take it apart, Before Dawn livery until First Light |
| `src/examples/SpecsApart.tsx` | The specs section (canvas board 11) with the live car: five chapters, fixed camera |
| `src/examples/TestDriveScene.tsx` | The test drive's 3D layer: track, player, ghost, chase camera, all driven by refs |
| `src/examples/DriverHelmet.tsx` | A helmet on a Drivers card: transparent canvas, slow sway, drag to turn, reduced motion, stops off screen |
| `renders/` | The renders on the brand canvas, 2400 × 1500 PNG |
| `pipeline/` | The scripts that built the GLBs, if the model ever changes (`pipeline/helmet/` for the helmet) |
| `tools/render/` | The render harness and scripts that made every car image on the design canvas |

The original has 714,306 triangles in 42 meshes and 11 materials, 20.9 MB. About 78k of those triangles were floor fences hidden under the car; the test-drive version drops them.

## Install (Next.js 16, React 19)

```bash
npm i three @react-three/fiber @react-three/drei
npm i @react-three/postprocessing postprocessing   # only if you use HermesEffects.tsx
```

Copy `public/models` (car and helmet), `public/livery` and `public/track` into your project's `public/`, and `src/hermes` into your components folder (for example `components/hermes`). Pinned and tested together: three 0.187, R3F 9.8, drei 10.7, React 19.3, TypeScript 5 (strict, no unused locals). v2 was type-checked, production-built with Next.js 16.4.5 and run in the browser: the specs example through all five chapters and the test-drive scene with the ghost car, with no console errors.

R3F scenes don't render on the server, so load scene components client-side:

```tsx
const SpecsApart = dynamic(() => import('@/components/examples/SpecsApart'), { ssr: false })
```

## Use

```tsx
<Canvas camera={{ position: [5.3, 1.25, 6.1], fov: 24 }}>
  <Suspense fallback={null}>
    <HermesStudio mode="day" />
    <HermesCar lod="hero" />
  </Suspense>
  <HermesEffects />
</Canvas>
```

**Specs section.** The parts come off one group at a time: the wings in the first third of `explode`, the halo in the second, then the body, suspension and wheels lift off the floor. Pass a ref and drive it from your own timeline; keep the stagger windows linear when the timeline already eases.

```tsx
const explode = useRef(0)
<HermesStudio mode="day" background={false} />   {/* transparent canvas over the section's CSS */}
<HermesCar explode={explode} explodeDamping={0} stagger={HERMES_SPEC_STAGGER} staggerEase={(u) => u} />
```

`SpecsApart.tsx` does all of this with the board's numbers: chapter targets `[0, 1/3, 2/3, 1, 0]`, a fixed camera (look at `-0.62, 0.42, 0.42`, direction `8.65, 2.8, 9.4`, distance 11.2, fov 24), zoom 1.28 while assembled easing to 1.0 as it opens, and the board's timing (ease-out cubic, `min(1500, 380 + 120 × frames moved)` ms, 600 ms to close).

**Test drive.** Your physics owns the numbers and the scene only reads them, so nothing re-renders:

```tsx
const player = useRef<CarPose>({ x: 0, z: 0, heading: 0 })   // metres, radians; heading 0 = +Z
const ghost = useRef<CarPose | null>(null)                     // the messenger at the same lap time
const speed = useRef(0)                                        // m/s, spins the wheels
const steer = useRef(0)                                        // radians, positive turns left
<TestDriveScene player={player} ghost={ghost} speed={speed} steer={steer} layout={CIRCUIT} />
```

The canvas is transparent and the dawn sky is CSS behind it: `linear-gradient(#C3C9D2, #ECEAE6)` down to the horizon with a warm `#FFF0DF` glow at 74 % across. The fog fades the far track into `HORIZON` (`#ECEAE6`), the sky's colour at the horizon.

### `<HermesCar />` props

| Prop | Default | |
| --- | --- | --- |
| `lod` | `'hero'` | `'hero'` for the landing, `'game'` for the test drive and phones |
| `livery` | `FIRST_LIGHT` | A preset from `livery.ts`, or any partial override such as `{ accent: '#FF5A63' }` |
| `decals` | `true` | The projected marks and lettering |
| `layout` | `HERMES_DECAL_LAYOUT` | Where each decal goes (see Livery) |
| `speed` | | Ref, m/s. Spins the wheels |
| `steer` | | Ref, radians. Turns the front wheels |
| `explode` | `0` | `0` assembled, `1` exploded. A number or a ref (scroll, GSAP) |
| `explodeDamping` | `6` | How fast parts ease toward `explode`; `0` jumps (use `0` when a timeline drives it) |
| `stagger` | | Per-part `[start, end]` windows inside `0..1`, e.g. `HERMES_SPEC_STAGGER`. Parts without a window move with `explode` |
| `staggerEase` | ease-out cubic | Easing inside each window; pass `(u) => u` when your timeline eases |
| `onReady` | | Receives the part groups for your own animations (wrap it in `useCallback`) |
| ...group props | | `position`, `rotation`, `scale`, `ref` and so on |

Also exported: `PART_NAMES`, `EXPLODE_OFFSETS` (how far each part travels, metres), `HERMES_SPEC_STAGGER`, `partExplode(e, span, ease)` (a part's own progress, for syncing labels to parts), `HERMES_MODELS`, `WHEEL_RADIUS`, `preloadHermesCar(lod)`.

### `<HermesStudio />`

`mode="day" | "night"` builds the room without downloading an HDR: the reflections come from light panels rendered once into an environment map. `background={false}` leaves the canvas transparent (no room colour, no floor), so only the car and its contact shadow are drawn over the page. `floor={false}` keeps the room colour but drops the floor. `<HermesEffects />` adds ambient occlusion and Neutral tone mapping, which keeps Redline and Gallery White true to the brand book.

`shadow` sets the contact shadow (defaults fit the car; `false` for none). Use `shadow={false}` under the helmet, which draws its own.

### `<HermesHelmet />`

```tsx
const michroma = Michroma({ weight: '400', subsets: ['latin'] })   // next/font
<Canvas camera={{ position: [-1.22, 0.36, 0.92], fov: 12 }} gl={{ alpha: true }}>
  <Suspense fallback={null}>
    <HermesStudio background={false} shadow={false} />
    <HermesHelmet livery={HELMET_LIVERIES.gallery} number="9" fontFamily={michroma.style.fontFamily} />
  </Suspense>
</Canvas>
```

| Prop | Default | |
| --- | --- | --- |
| `livery` | `HELMET_LIVERIES.gallery` | `gallery` (Gallery White, Carbon trim), `graphite` (Graphite, Gallery White trim), `beforeDawn` (dark, grey feathers, no number), `messenger` (see-through Redline edge, like `GhostCar`), or your own `{ shell, feather, trim, visor, number, ghost? }` |
| `number` | `''` | Race number on both sides of the chin, drawn at runtime, so it comes from content and never from the file |
| `fontFamily` | `'Michroma, sans-serif'` | Pass next/font's `michroma.style.fontFamily`; the number waits for the face to load |
| `shadow` | `0.55` | Opacity of the soft ground ellipse (it turns with the helmet; 0.8 suits the night room; the messenger casts none) |
| ...group props | | `position`, `rotation`, `scale`, `ref` |

Space: metres, +Y up, the visor toward +Z, origin on the ground under the centre; 274 × 280 × 374 mm. A camera on −X shows the visor to the right (the left-hand card), on +X to the left. Parts: `Shell` · `Visor` · `Trim` (rear and chin spoilers) · `Hardware` · `Lining`. The studio's `ContactShadows` can't shade an open helmet (it looks up from below and sees only back faces), hence the helmet's own shadow. Also exported: `HERMES_HELMET_MODEL`, `preloadHermesHelmet()`.

### Proving Ground (`ProvingGround.tsx`)

| Export | |
| --- | --- |
| `<Track layout? scenery? />` | Road (14 m, asphalt texture), white edge lines, kerbs, run-off, graphite walls with a Redline top stripe, the start gantry, pit building, tower, grandstand and a far skyline. No layout draws `OPENING_LAYOUT`, the straight and Turn 1 from the test-drive renders |
| `TrackLayout` | `points` (centre line, metres), `closed`, `halfWidth`, `kerbs` and `runoff` as spans in metres along the track (`side: 'left' \| 'right'`), `walls` offsets, `gantry` position |
| `makeTrackCurve`, `trackStrip`, `trackWall` | The builders, for anything the layout doesn't cover |
| `<TrackEnvironment />` | Outdoor reflections: bright sky, warm dawn horizon ahead, long side strips. Sets Neutral tone mapping |
| `<GhostCar />` | The messenger: the game car as glass with a Redline (`#FF5A63`) fresnel edge, no depth write |
| `HORIZON` | `#ECEAE6`, for the fog and the CSS sky |

The full lap needs a closed layout traced from the circuit map in the design handoff, with kerbs on the apexes and exits. The scenery boxes sit around the opening straight; pass `scenery={false}` and place your own for a full circuit.

## Model conventions

- Units are metres, +Y is up, and the nose points +Z (the glTF front).
- The origin sits on the ground at the centre of the wheelbase.
- The wheelbase is exactly **3,400 mm**, the 2026 maximum and the figure in the spec copy. Overall size is 5.54 × 1.88 × 1.15 m, and the wheel radius is 0.332 m.
- **Parts** are groups: `Body`, `Halo`, `FrontWing`, `RearWing`, `Floor`, `Suspension`, `Wheel_FL`, `Wheel_FR`, `Wheel_RL`, `Wheel_RR`. +X is the car's left.
- **Meshes** are named part plus material: `Body_Paint`, `FrontWing_Accent`, `Wheel_RL_Tyre`, and so on.
- **Wheels:** `Wheel_FL` pivots at the hub (steering is `rotation.y`). Its child `Wheel_FL_Spin` rolls (`rotation.x`).
- **Material roles:** `Paint`, `Carbon`, `Accent`, `Tyre`, `Rim`, `Metal`, `Light`. The GLB carries the livery colours, so it also looks right in any glTF viewer. The component swaps in tuned physical materials.
- **Compression:** `EXT_meshopt_compression` with `KHR_mesh_quantization`. drei's `useGLTF` decodes it out of the box. Other loaders need the meshopt decoder.

## Livery

- **Colours:** every colour is a token in `livery.ts`. `FIRST_LIGHT` is the race livery. `BEFORE_DAWN` is the launch-night car in Graphite, shown until First Light (06:00 at the Proving Ground on Day One, one moment for everyone).
- **Carbon band and halo:** the carbon lower band (below 0.30 m, front edge leaning forward at 14°) and the black halo are cut into the geometry. The lines stay exact at any distance, with no textures.
- **Decals:** these are projected onto the body when the car loads, from `HERMES_DECAL_LAYOUT`. Each entry is `[height, position along the car]` plus a width in metres, placed on both flanks. Marks flip on the left flank so they always fly forward; text never flips.
- **Tyres and hubs:** the soft-compound red ring on the tyres and the red hubs are drawn by the tyre and rim shaders.

## Performance

- Desktop landing and specs: `lod="hero"`, `dpr={[1, 2]}`, with `<HermesEffects />` only where the car is large.
- Phones and the test drive: `lod="game"`, no effects, `dpr` capped at 1.75.
- Call `preloadHermesCar('game')` when the Test drive button appears, so the car is ready when the track loads.
- Mount one canvas per section and unmount it (or set `frameloop="demand"`) when the section is off screen.

## Rebuilding the models

`pipeline/` uses glTF-Transform and meshoptimizer only, no Blender.

```bash
cd pipeline && npm i
node build.mjs <sketchfab-2026_f1_car.glb> master.glb report.json   # scale, split, livery cuts
node lod.mjs master.glb hermes-hm27.glb 280000 "" 16
WHEEL_K=1.8 node lod.mjs master.glb hermes-hm27-game.glb 50000 Floor_Fences 14
```

The helmet has its own steps in `pipeline/helmet/README.md` (bake the livery mask, then build).

Settings: `BAND_H` (0.30) and `BAND_Z0` (0.85) move the carbon band, and `HALO_Y` (0.68) sets where the halo cut starts. `lod.mjs` searches for the single error tolerance that lands on the triangle budget. It locks the seams between split parts, so no cracks open. `decals.html` and `savedecals.cjs` re-render the livery masks.

## Re-rendering the images (`tools/render/`)

Every car image on the design canvas came from this harness: a small Vite app that draws the components from URL parameters, screenshotted by Playwright. Use it for new stills, larger sizes or a changed livery.

```bash
cd tools/render
npm i && npx playwright install chromium
npm run sync        # copies ../../src/hermes in; set HERMES_SRC if the components live elsewhere
npm run build && npm run serve        # http://127.0.0.1:8766, reads the models from ../../public
GPU=1 node scripts/shootapp.cjs "http://127.0.0.1:8766/?view=landing&transparent=1&dpr=2" hero.png 1600 1000
```

Without `GPU=1` the scripts use SwiftShader, which works on any machine but is slow.

| Parameter | |
| --- | --- |
| `view` | Camera preset: `hero`, `night`, `side`, `sideR`, `rear`, `rearNight`, `exploded`, `top`, `chase`, `landing`, `fin`, `nose`, `wing`, `pod`, `wheel` |
| `lod`, `livery`, `mode`, `decals=0`, `fx=1` | Model weight, `firstLight` or `beforeDawn`, `day` or `night`, decals off, effects on |
| `explode`, `stagger=specs` | Explode value; per-part timing as in the specs section |
| `transparent=1`, `dpr`, `fov`, `settle` | Transparent background, pixel ratio, field of view, frames to wait before capture |
| `path=specs&cam=fixed`, `look`, `dist` | The specs section's fixed camera (the canvas frames used `fov=24`, viewport 1600 × 1000) |
| `scene=track`, `layer=bg\|cars\|all`, `chase`, `look`, `ghost`, `noghost=1` | The test-drive scene in layers, camera position and target, the ghost's position |
| `scene=helmet`, `helmet`, `num`, `hview` | One helmet: `gallery`, `graphite`, `beforeDawn` or `messenger`; the chin number; `right`, `left`, `sideR`, `sideL`. The Drivers stills: `transparent=1&fov=15` at 1440 × 1100, `mode=night` for `beforeDawn` |

| Script | |
| --- | --- |
| `scripts/shootapp.cjs <url> <out.png> [w] [h]` | One still |
| `scripts/shootseq.cjs <url> <outDir> <e0,e1,…> [w] [h]` | A run of explode values in one page load, plus `meta.json` with the camera matrices and part boxes |
| `scripts/specs_post.py <framesDir> <outDir> <width> <dpr>` | Crops a run to one shared box, smooths the contact shadow, writes WebP and the callout anchors |
| `scripts/drive_composite.py <bgDir> <carsDir> <out.webp> <width> <dpr> [ghost] [boardWidth]` | Test-drive still: dawn sky, track with a zoom blur, cars, vignette, HUD anchors |
| `scripts/sign.cjs <out.png>` | The gantry sign texture, set in Michroma |
| `scripts/helmet_stills.py <render.png> <stem>` | Crops a helmet render to the shared frame, fades the edges, writes `<stem>.png` (1140 × 940) and `<stem>.webp` (800 × 660) |

The Python scripts need `pip install -r scripts/requirements.txt`. Run them with `python3 -I`.

## Changelog

**v2.2 (9 November 2026)**: the drivers' helmet.
- `public/models/hermes-helmet.glb` and `HermesHelmet` with `HELMET_LIVERIES` (`gallery`, `graphite`, `beforeDawn`, `messenger`), the race number drawn on the chin at runtime, and its own ground shadow.
- `HermesStudio` takes `shadow` (contact-shadow overrides, or `false`).
- Example `DriverHelmet.tsx`; harness `scene=helmet`; `scripts/helmet_stills.py`; `pipeline/helmet/`.
- Type-checked (strict) and built in the harness; the stills on the Drivers board came from it.

**v2.1 (7 November 2026)**: the studio floor no longer writes depth, so the contact shadow can't z-fight with it on low-precision depth buffers (some phones, software rendering).

**v2 (7 November 2026)**
- `stagger` and `staggerEase` on `<HermesCar />`, with `HERMES_SPEC_STAGGER` and `partExplode` for the specs section.
- `background` on `<HermesStudio />` for transparent canvases; softer, higher-resolution contact shadow.
- `ProvingGround.tsx`: the track builder with layouts, `TrackEnvironment` and `GhostCar`; textures in `public/track`.
- Examples: `SpecsApart.tsx`, `TestDriveScene.tsx`. `Exhibition.tsx` now switches livery at one fixed moment (`firstLight`), not at 06:00 on the viewer's clock.
- `tools/render/`: the harness and scripts behind the canvas images.

**v1 (6 November 2026)**: the models, livery, `HermesCar`, `HermesStudio`, `HermesEffects`, `Exhibition`.
