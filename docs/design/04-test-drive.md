# 04 · Test drive — "Beat the messenger"

Boards 13 (the lap), 14 (finish and share), 15 (phone, turn sideways), 16 (phone lap), 17 (phone finish). Prototypes `TestDrive-*.dc.html`. Behaviour and physics: ARCHITECTURE §7; rules `.claude/rules/game.md`; numbers `docs/content/facts.md` §C.

## The data in the prototype

`TestDrive-Lap.dc.html` → `this.PTS` (120 map points of the Proving Ground, the bottom straight first), `this.SPD` (the messenger's speed in km/h at each point), `this.GHOST = 71.906`. The prototype's own lap is scripted (`gap(p)` makes you lose time through sector 1 and win by 0.214); **the site's lap is driven by physics**, not by that function.

## Desktop lap (board 13, 1440 × 900)

- Full-bleed 3D: chase camera behind the car, dawn sky in CSS behind a transparent canvas, the gantry "HERMES PROVING GROUND".
- Top left: "BEAT THE MESSENGER", the messenger's time 1:11.906, YOUR BEST, Δ MESSENGER (green when ahead, red-on-dark when behind).
- Top right: the track map (dots for YOU and THE MESSENGER), sector bars S1–S3 filling with the lap, finished sectors tagged purple (faster) or yellow (slower) with their gap.
- Over the ghost car: a tag "THE MESSENGER" with the live gap; when you are within 1 s behind, a chip "WITHIN 1 S · OVERTAKE READY".
- Bottom centre: speed dial (KM/H), gear, 15 RPM LEDs (5 white, 10 Redline), THR/BRK/ERS bars, Straight/Corner mode, OVERTAKE and BOOST indicators.
- Bottom bar: keys W Throttle · S Brake · A D Steer · SPACE Overtake · SHIFT Boost, centred at x ≈ 678.
- Gears change at 95, 128, 160, 192, 224, 258, 300, 345 km/h (prototype `GEARS`); RPM 7,200–11,800 across each gear.

## Start

The grid shot, five red lights lit one per second, lights out after a random 0.2–1.0 s, caption "WAIT FOR LIGHTS OUT" → "LIGHTS OUT AND AWAY" (1.2 s). Prototype `start()`.

## Finish (boards 14, 17)

- Won: "YOU BEAT THE / MESSENGER." with the gap in green (−0.214 S); lost: "THE MESSENGER / HOLDS ON." in red (+0.152 S).
- The timing table: Driver, S1, S2, S3, LAP, GAP for YOU and MESSENGER; your sector cells purple when faster, yellow when slower; gaps computed on rounded times.
- The two cards side by side (desktop): link 1200 × 630 and story 1080 × 1920 previews; phone shows the story card.
- Buttons: won "Share your card" (Redline) + "Run it back"; lost "Run it back" (Redline) + "Share". Note under them.
- Card design: dark gradient, grid texture, the winged H + HERMES, the car still, "I BEAT THE / MESSENGER BY" + the gap in 34 px mono with a Redline "S", the circuit outline in Redline, "YOU 1:11.692 · MESSENGER 1:11.906", the credit line in 7 px.

## Phone

- **Portrait (board 15):** blurred drive still behind, "BEAT THE / MESSENGER.", the messenger's time, a phone that turns sideways (animated; still under reduced motion), three numbered steps, "Waiting for landscape". The page waits for `orientation: landscape` (screen orientation API where available; never forced).
- **Landscape (board 16, 844 × 390):** HUD compressed: speed, gear, delta, sectors; thumb controls — steer buttons left, BRAKE and THROTTLE right, OT and BST small above them; pressed state visibly changes. Overtake/Boost show a 2 s effect.
- **Finish (board 17, portrait):** headline, gap, sector chips, the story card (180 × 320 preview), two buttons.

## Prototype only

- Lap timing driven by `gap(p)`; the attempt counter starting at 4; "Play the start" (a canvas control to run the sequence).
- "STEER · BUTTONS · TILT IN SETTINGS" (tilt is a stretch goal); "Works best with sound on" (no audio planned). See copy.md.

## Accessibility and states

Pause on blur with a pause sheet (Resume, Restart, Exit). No WebGL2 → the static "Here's the messenger's lap instead" screen. At the finish, a polite live region reads: "Lap complete. 1:11.692, 0.214 seconds faster than the messenger. Sector 1 slower by 0.422…". Reduced motion: no camera sway, no zoom blur.
