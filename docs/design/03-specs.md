# 03 · Specs — the car comes apart

Boards 11 (desktop, interactive), 12 (storyboard and motion notes), 24 (phone), and the car boards 06–08 for reference. Prototypes `Specs-Apart.dc.html`, `Specs-Phone.dc.html`. Behaviour: ARCHITECTURE §6. Copy: copy.md → Specs.

## Desktop layout (1440 × 1000 per chapter screen)

- Light page background (centred at 62% 40%), perspective grid, a huge outline chapter number top right ("01"…"05", Michroma 300 px).
- **Car box:** x 412, y 250, 980 × 491 in a 1440 board (the frames are 1500 × 751 and scale into it). Zoom 1.28 while assembled, easing to 1.0 as it opens: `Z = 1 + 0.28 × (1 − f/18)³`, pivot at frame pixel (790, 408.5).
- **Text column:** left 44, top 128, 400 wide: label "NN / 05 · NAME" (red-on-light number), H2 40 px in three lines (`nowrap`), body 17 px, then a dark glass figures panel (two figures, 40 px Geist Mono with 12 px units) or, in chapter 5, the power panel (750 kW, a bar split 53.3/46.7 white/Redline, V6 and electric labels, 8.5 MJ, 100%).
- **Rail:** bottom 26 px: five stops on a line, filled Redline up to the current chapter, labels "01 THE CAR" … "05 POWER", current stop with a Redline halo; "Play the scroll" pill on the right.

## Callouts

Anchored to the parts, in frame pixels (scale with the box and the zoom like the frames):

| Chapter | Callout | Anchor (frame px) | Placement |
| --- | --- | --- | --- |
| 1 | wheelbase line + "3,400 MM WHEELBASE" chip | (825.9, 590.0) → (1312.4, 421.4) | chip under the line's middle |
| 2 | "FRONT WING · 2 MOVING ELEMENTS" | (350.6, 594.8) | below the dot |
| 2 | "REAR WING · 3 MOVING ELEMENTS" | (1380.7, 51.4) | right-aligned above (phone: below, right-aligned) |
| 3 | "HALO · GRADE 5 TITANIUM" | (813.4, 20.8) | above (phone: below) |
| 4 | "18-INCH RIMS" | (951.1, 540.9) | above (phone: below) |
| 4 | "FLAT FLOOR" | (1161.8, 344.2) | above |
| 5 | "750 kW · V6 + ELECTRIC" | (1008.7, 205.3) | above |

Dots: a white 12 px dot with a 3 px Redline ring and an 18% Redline halo, in a 44 px hit area. Callouts fade in (350 ms) only once a chapter has settled.

## Chapters and timing

| Chapter | Explode | Frame (of 18) | Parts that move |
| --- | --- | --- | --- |
| 1 | 0 | 0 | none |
| 2 | 1/3 | 6 | front wing forward, rear wing up and back |
| 3 | 2/3 | 12 | + halo up |
| 4 | 1 | 18 | + body and suspension up, wheels out |
| 5 | 0 | 0 | everything back (600 ms) |

Tween `min(1500, 380 + 120 × |Δframes|)` ms, ease-out cubic; text wipe 450 ms with the Redline edge; figures count up over 800 ms after 150 ms. "Play" advances every 2700 ms.

## Live 3D vs frames

The prototype stacks 19 pre-rendered frames (one fixed camera, frame `i` at opacity `max(0, 1 − |f − i|)`, `mix-blend-mode: plus-lighter` in an isolated box). The site renders the car live with the same camera (`SpecsApart` in the car package: look at (−0.62, 0.42, 0.42), direction (8.65, 2.8, 9.4), distance 11.2, fov 24) and keeps the frames as the fallback (ARCHITECTURE §6). The two must match: compare a live screenshot at each chapter with `screenshots/11-specs-chN.png`.

## Phone (board 24)

The car sits under the header in a 366 px box (x 4, y 98 inside the card), zoom 1.28 at chapter 1 but gone by chapter 2 (`Z = 1 + 0.28 × max(0, 1 − f/6)³`) so the open car never crosses the screen edge. Text starts at y 314: label, H2 25 px, body 15 px, the figures panel (30 px numbers), the chapter 5 CTA. The rail is a glass pill at the bottom: five dots with numbers only, and a 44 px Carbon play button. Chips are shortened (copy.md).

## Car alt text

1 "The HM‑27 in one piece, its 3,400 mm wheelbase marked on the ground" · 2 "The HM‑27 with its front wing pulled forward and its rear wing lifted back" · 3 "The halo lifted clear of the cockpit" · 4 "Body and wheels lifted off the floor, every part apart" · 5 "The HM‑27 back in one piece".
