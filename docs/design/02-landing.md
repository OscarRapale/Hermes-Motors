# 02 · Landing hero

Boards 09 (Before Dawn), 10 (First Light), 22, 23 (phone). Prototypes `Landing-v2-BeforeDawn.dc.html` (the two desktop boards share one file; `firstLight` picks the state), `Landing-Phone-BeforeDawn.dc.html` (same for phone). Behaviour: ARCHITECTURE §4–5.

## Layout, desktop (1440 × 1000 first screen)

- Page card radius 32 inside a 14 px frame; the hero fills the first viewport (`min-height: 100svh`, design at 1000 px).
- Background per theme (00-tokens), the perspective grid on the lower half, a huge outline word behind the car: "06:00" at night, "HM-27" by day (Michroma ~300 px, white at 72% with a 1 px ink stroke at 9%).
- The car still centred above the middle (`hero-night` / `hero-day`, 2495 × 886 source, transparent edges), a chip under it.
- Left column: eyebrow chip, H1 50 px in three lines, body 17 px, two buttons (primary Redline pill with a white arrow circle; secondary glass pill).
- Right column: the glass panel. Night: power icon (disabled), 15 LEDs, "NIGHT MODE" chip, "UNTIL FIRST LIGHT", the 84 px countdown, caption, five sealed rows (label + grey bar), a feather line. Day: ignite button, 15 LEDs, HP/kW toggle, five dials (the large System Power dial in the middle).
- Day hotspots on the car: ACTIVE AERO, HALO, 750 kW POWER UNIT (glass chips with a Redline-ringed dot), each linking to its specs chapter.

## Phone (390 wide)

Header pill; a 288 px stage with the outline word (72 px), the car (382 px wide) and its chip; then eyebrow, H1 30 px, body 15 px, two full-width 56 px buttons; then the panel full width with 12 px margins. Night panel: LEDs, the 58 px countdown, sealed rows, the feather line. Day panel: ignite + LEDs, the System Power dial (176 px) and HP/kW, then four 108 px dials in a 2 × 2 grid. The dashed line on the boards marks the 844 px first screen; it is an annotation, not UI.

## States and behaviour

| | Before Dawn | First Light |
| --- | --- | --- |
| Theme | night | day |
| Countdown | to `DAY_ONE` (never local 06:00) | — |
| LEDs | fill over the last 6 h before `DAY_ONE` | sweep up and back with the ignition |
| Spec values | sealed (grey bars) | dials sweep to values, count up |
| Primary CTA | "Be here at 06:00" → `.ics` download | "Beat the messenger" → `/drive` |
| Secondary | "Read the manifesto" | "Explore the car" → specs section |
| Test drive buttons | locked | open |

- **Ignition (day):** 2600 ms. For the first 42% every needle sweeps to full scale and the LEDs light left to right; then needles settle on their values while the LEDs drain and the numbers count up. Runs once per session on first view and on the ignite button.
- **HP/kW:** swaps the System Power dial between 1,006 HP (sub "750 KW · 50/50") and 750 KW (sub "≈ 1,006 HP · 50/50"), `aria-pressed` on both buttons.
- **The flip:** at `DAY_ONE`, or when the preview button is pressed, the Slipstream wipe crosses the screen (11-motion) and the state swaps at the moment the stripes cover it.

## Prototype only

- "PREVIEW 06:00 →" on the night panel (a canvas control) is not built; the header's preview button does that job.
- The countdown's target (next 06:00 on the device).
- "DRAG TO ROTATE · 360°": the hero is a still in v1 (ARCHITECTURE §16).

## Accessibility

Countdown `role="timer"` with `aria-label="Time until first light"`, updated visually every second, announced only on the minute. Dials are `role="img"` with full-value labels. The ignite button and the unit toggle are keyboard-operable. Reduced motion: the dials and LEDs appear settled; the wipe is an instant swap.
