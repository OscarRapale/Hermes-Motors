---
paths:
  - "lib/game/**/*"
  - "app/drive/**/*"
  - "app/api/card/**/*"
  - "components/drive/**/*"
  - "tests/unit/game/**/*"
---

# Test drive rules ("Beat the messenger")

Behaviour is in ARCHITECTURE §7 and the screens in `docs/design/04-test-drive.md`. The prototype `docs/design/prototypes/TestDrive-Lap.dc.html` holds the circuit map (`PTS`, 120 points) and the messenger's speeds (`SPD`, 120 values) that the game is built from.

## Simulation

- `lib/game` is pure TypeScript with no React, no DOM, no three.js: `step(state, input, dt) → state`. The scene only reads the state.
- Fixed timestep of 1/120 s with an accumulator; render interpolates. Never step physics with the raw frame delta.
- Deterministic for a given input log (seedable RNG only for the lights-out delay). Unit-test laps from recorded inputs.
- Units: metres, seconds, m/s, radians. Display converts (km/h, mm:ss.mmm).

## Timing

- The messenger's lap is **1:11.906**; sectors 19.420, 26.411, 26.075 s. These live in `content/facts.ts`, not in game code.
- Sector and lap gaps are computed **on times rounded to the millisecond**, so the three shown sector gaps add up to the shown lap gap.
- Colours: purple `#C9A0FF` = faster than the messenger in that sector, yellow `#F2C94C` = slower, green `#5BE58F` = the live delta when ahead, red-on-dark `#FF5A63` when behind.
- Lights: five lights, one per second, then lights out after a random 0.2–1.0 s. A jump start is a 5 s penalty, shown on the finish screen (placeholder until Decision D9).

## Share cards (no accounts, no database)

- The result is encoded in the URL (`/drive/r?lap=71692&s=19842.26323.25527&a=4`): integers only, validated against ranges (a lap between 60 and 180 s, sectors summing to the lap within 3 ms). Anything else → 404.
- Cards are drawn by `app/api/card/route.tsx` with `ImageResponse`: `format=link` 1200 × 630, `format=story` 1080 × 1920. Text comes only from the validated numbers and fixed copy, never from query strings.
- Cards that show the car carry the CC BY credit in small type.
- Best lap and attempt count live in `localStorage` (`hermes.drive.v1`), wrapped in try/catch; the game works without it.

## Controls and access

- Desktop: W/↑/Right Shift throttle, S/↓/Right Ctrl brake, A/D or ←/→ steer, Space = Overtake (only within 1 s of the messenger), Left Shift = Boost, Esc = pause (right-hand pedals: Oscar, 2026-11-12, over board 13's key bar). Show the key bar from the spec.
- Phone: landscape only, thumb controls from board 16; portrait shows the rotate screen (board 15). Haptics via `navigator.vibrate` only on lights out and finish, never required.
- Pause on `visibilitychange` and on blur. Reduced motion: no camera sway, no zoom blur, no screen shake.
- The page has a text summary of the lap for screen readers (sector results, final gap) announced at the finish.
