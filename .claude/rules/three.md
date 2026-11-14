---
paths:
  - "components/hermes/**/*"
  - "components/specs/**/*"
  - "components/drive/**/*"
  - "components/drivers/**/*"
  - "app/drive/**/*"
  - "public/models/**/*"
  - "tools/render/**/*"
---

# 3D rules (React Three Fiber)

The car package is in `vendor/hermes-hm27/` (README there: props, conventions, performance). Its components are copied into `components/hermes/`; keep them in sync with the vendor copy unless a change is deliberate and noted in PROGRESS.md.

## Loading

- Every scene is a client component loaded with `dynamic(() => import(...), { ssr: false })`. Nothing 3D runs on the server or blocks the hero.
- The landing hero is a still image. The live car appears only in the specs section (when it scrolls near) and on `/drive`.
- The Drivers page paints the helmet stills first; the live helmets (`DriverHelmet`) mount after that, only with WebGL2 and data saver off. Call `preloadHermesHelmet()` on intent: the first hover, focus or touch of a link to `/drivers` (`DrivePreload`), not on view, since the header's link is on every page. On `/drivers` the live helmets mount 300 px before their card is in view (`components/drivers/HelmetBox`).
- `preloadHermesCar('game')` on intent: the first hover, focus or touch of a link to `/drive` (the header's button is visible on every page). The specs section loads its car one viewport away, but only after the first scroll, or at once if the page opens on the section: the landing page loads no three.js before scroll (ARCHITECTURE §10, Decision D27).
- Before mounting a canvas, check WebGL2. No WebGL2 → the specs section uses its frame fallback, `/drive` shows the "your device can't run the test drive" state from the spec.

## Weights and quality

| Where | LOD | Effects | dpr |
| --- | --- | --- | --- |
| Specs, desktop | `hero` | `<HermesEffects />` | `[1, 2]` |
| Specs, phone | `game` | none | `[1, 1.75]` |
| Test drive | `game` | none | `[1, 1.75]` |
| Drivers | the helmet (38k triangles, one file for all three) | none | `[1, 2]` |

- One canvas per section. Unmount it (or `frameloop="demand"`) when its section is off screen.
- Transparent canvases (`HermesStudio background={false}`, `gl={{ alpha: true }}`) sit over the section's CSS background, so the page and the 3D share one look.

## Frame loop

- Animation state lives in refs read inside `useFrame`. No `setState` per frame, no new objects per frame (reuse vectors from `useMemo`).
- Timelines drive `explode` through a ref with `explodeDamping={0}`, and keep `staggerEase` linear when the timeline already eases (`HERMES_SPEC_STAGGER`).
- Dispose what you create outside drei loaders (geometries, materials, render targets) in cleanup.
- Respect `prefers-reduced-motion`: chapter changes jump, the chase camera doesn't sway, no zoom blur.

## The car and the helmet are licensed

- The model is "2026 F1 CAR" by Abu Saif under CC BY 4.0, modified. Any page, image, share card or video that shows the car keeps the credit line from `docs/legal/credits.md`.
- The helmet is based on a model by Miopass under CC BY 4.0, modified. Same rule wherever a helmet shows. The credit names the author and links the source; never add the source's title (it names a real driver; credits.md explains).
- Don't edit `public/models/*.glb` by hand. Changes go through `vendor/hermes-hm27/pipeline` and are noted in PROGRESS.md.

## Renders

- Helmet stills: `scene=helmet` in `tools/render` (package README), then `scripts/helmet_stills.py`. They carry the placeholder numbers 9 and 19, so re-render them if Decision D4 changes the numbers.
- New stills or frames come from `tools/render` (the same components, screenshotted by Playwright). Run it with `GPU=1` on a machine with a GPU. Commit outputs to `public/images/` as AVIF + WebP, with the command used noted in `docs/design/assets.md`.
