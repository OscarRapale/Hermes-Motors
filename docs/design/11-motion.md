# 11 · Motion catalogue

Ease-out only (`1 − (1 − t)³`). Every item has a reduced-motion version in the last column.

| Name | Where | Spec | Reduced motion |
| --- | --- | --- | --- |
| Slipstream wipe | theme flip, 06:00, film cuts | Three stripes (1/3 width each) in a container 2580 px wide for a 1440 viewport (scale with width), `skewX(-14deg)`, moving `translateX` from −2900 to +1800 px over 450 ms. Order to day: Gallery White, Redline, Carbon; to night: Carbon, Redline, Gallery White. The state swaps when the eased progress passes 0.49 (the screen is covered) | instant swap |
| Text wipe | chapter text, manifesto statements, film titles | `clip-path: polygon(...)` edge moving left→right over 450 ms with a 3 px Redline bar skewed −14° riding the edge (96 px slant across the block) | no wipe, 150 ms fade |
| Ignition | First Light dashboard | 2600 ms: needles sweep to full (0–42%), then settle to values (42–100%) while LEDs drain and numbers count | settled state |
| Count-up | figures, dials | value × ease over 800 ms, starting 150 ms after the text | final values |
| Chapter tween | specs | explode tween `min(1500, 380 + 120·Δframes)` ms, 600 ms to close | jump |
| Callouts | specs | opacity 0→1 over 350 ms once the chapter settles | appear |
| LED fill | night panel | 15 LEDs light over the last 6 h before Day One | same (it's a state) |
| Live pulse | "LIVE FROM THE PROVING GROUND" dot | box-shadow ring 0→8 px, 1.8 s loop | none |
| Phone turn | rotate screen | the phone glyph turns 90° and back, 2.4 s loop | static |
| Lights | test drive | one light per second, out after 0.2–1.0 s | same (it's the game) |
| Overtake / Boost | test drive | 2 s glow on the indicator and a brief speed-line overlay | indicator only |
| Feather flight | manifesto, film, end card | feathers translate along 14° (dx, dx·tan 14°) with ease-out, 30 ms stagger per feather | appear |

Storyboard: board 12 (`screenshots/12-specs-storyboard.png`).
