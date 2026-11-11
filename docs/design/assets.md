# Assets

Everything arrives in `vendor/` and is copied into `public/` during M0 (convert stills to AVIF + WebP at 1x and 2x with sharp; keep the PNG sources out of `public/`). `vendor/assets/blob-map.json` maps the canvas image ids used in the prototypes to these files.

**How:** `npm run assets` (`scripts/assets.mjs`) does all of the below from `vendor/` and checks the §10 budgets; outputs are committed. Hero stills become `hero-{day,night}-{1248,2495}.{avif,webp}` (1x/2x); helmet stills get an 800 px AVIF next to the delivered WebP; the mark SVGs (`mark`, `mark-reversed`, `mark-white`, `mark-black`) are written from the Brand-Mark paths. The wordmark and lock-up SVGs need the Michroma text outlined and come with the press kit (M5). `tests/unit/assets.test.ts` checks the result.

| Asset | In the handoff | Goes to | Notes |
| --- | --- | --- | --- |
| Car, landing version | `vendor/hermes-hm27/public/models/hermes-hm27.glb` | `public/models/` | 1.17 MB, 279,590 triangles, meshopt-compressed |
| Car, game version | `vendor/hermes-hm27/public/models/hermes-hm27-game.glb` | `public/models/` | 281 KB, 49,521 triangles |
| Helmet | `vendor/hermes-hm27/public/models/hermes-helmet.glb` | `public/models/` | 330 KB, 37,991 triangles, meshopt; the livery mask is embedded, colours and the number come from code |
| Livery masks | `vendor/hermes-hm27/public/livery/*.png` | `public/livery/` | white masks, tinted in code |
| Track textures | `vendor/hermes-hm27/public/track/*.png` | `public/track/` | asphalt, kerb, gantry sign |
| Hero, First Light | `vendor/assets/images/hero-day.{png,webp}` | `public/images/hero-day.*` | 2495 × 886, transparent edges; the LCP image |
| Hero, Before Dawn | `vendor/assets/images/hero-night.{png,webp}` | `public/images/hero-night.*` | 2495 × 886 |
| Specs frames | `vendor/assets/images/specs/hm27-specs-00…18.webp` | `public/images/specs/` | 1500 × 751, one fixed camera, uniform in displacement; fallback only |
| Specs layout | `vendor/assets/images/specs/specs-layout.json` | `content/specs-layout.json` | frame size, callout anchors per frame |
| Drive stills | `vendor/assets/images/drive.webp`, `drive-phone.webp` | `public/images/` | backgrounds for the rotate screen, finish screens, Team page, OG |
| Helmet stills | `vendor/assets/images/drivers/helmet-*.{png,webp}` | `public/images/drivers/` | `gallery-9`, `graphite-19`, `before-dawn-right`, `before-dawn-left`, `messenger`; 1140 × 940 PNG sources (transparent), 800 × 660 WebP; poster stills under the live helmets and the Drivers OG |
| Press renders | `vendor/hermes-hm27/renders/*.png` | `public/press/renders/` | 2400 × 1500; also zipped into the press kit |
| First Light film | `vendor/assets/film/first-light-1080p.mp4` + `first-light-poster.jpg` | `public/press/` | 24 s, 1920 × 1080, 30 fps, H.264, silent |
| Brand reference images | `vendor/assets/images/reference/*.webp` | — | used by boards 06–08 only |
| Logos | draw from the SVG paths in `prototypes/Brand-Mark.dc.html` | `public/brand/*.svg` | mark, wordmark, lock-up, reversed, single-colour |

## How the images were made

- **Car stills and frames:** `vendor/hermes-hm27/tools/render` (Vite + the same React Three Fiber components, screenshotted by Playwright). Specs frames: `path=specs&cam=fixed&stagger=specs&fov=24&transparent=1`, explode values 0…1 in 19 equal steps, then `scripts/specs_post.py` (shared crop, shadow smoothing, WebP, anchors). Drive still: `scene=track` in layers, then `scripts/drive_composite.py`.
- **Helmet stills:** `tools/render` with `scene=helmet&helmet=<look>&num=<n>&hview=right|left&transparent=1&fov=15` (plus `mode=night` for `beforeDawn`) at 1440 × 1100, then `scripts/helmet_stills.py` (one shared crop so left and right mirror, an 80 px edge fade so the ground shadow never ends in a line, WebP). The live view renders the same crop (`HELMET_FRAME`).
- **The film:** `vendor/assets/film/` holds the camera paths (`orbit.json`, `explode.json`), the frame script (`shootcam.cjs`), the type scenes (`film.html`, `film.cjs`) and `render3d.sh`. Paths inside are absolute to the machine that made them; adjust before re-running. Each scene is encoded on its own and joined with the concat demuxer.
- Re-render on a machine with a GPU (`GPU=1`); SwiftShader takes about 13 s a frame at 1920 × 1080.
