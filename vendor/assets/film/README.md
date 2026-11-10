# First Light film — how it was made

24 s, 1920 × 1080, 30 fps, H.264, silent. Five scenes, each encoded on its own and joined with ffmpeg's concat demuxer (`-c copy`).

| Scene | Frames | What | Made by |
| --- | --- | --- | --- |
| dawn | 120 | black, the Redline glow, one feather flies in at 14°, "A MESSAGE IS ON ITS WAY." | `film.html` (type) |
| count | 120 | the countdown 05:59:56 → 06:00:00 over the car in the dark, 15 LEDs filling | `film.html` + the night hero still |
| reveal | 180 | the Slipstream wipe, then a camera pull-back from the nose to the whole car, "FIRST LIGHT." | 3D frames (`orbit.json`) + `film.html` |
| apart | 135 | the car comes apart (wings, halo, body and wheels) and back together | 3D frames (`explode.json`) + `film.html` |
| end | 165 | the wipe to Gallery White, the mark builds feather by feather, "SPEED IS THE MESSAGE.", the model credit | `film.html` |

- 3D frames: `render3d.sh` runs `shootcam.cjs` against the render harness (`vendor/hermes-hm27/tools/render`, served on port 8766) with `fx=1` (ambient occlusion) in the day studio, reading the canvas directly (`toDataURL`) instead of screenshotting the page.
- Type and transitions: `film.cjs` loads `film.html`, calls `window.render(scene, frame, options)` per frame and saves JPEG at quality 92, then encodes each scene with `libx264 -crf 18 -preset veryfast -pix_fmt yuv420p`.
- Paths inside the scripts are absolute to the machine that made them; change the `S` constants before re-running. Fonts come from @fontsource packages (Michroma, Geist, Geist Mono).
