# 00 · Tokens

Implement once in `styles/tokens.css`. Brand book boards 02–04 (screenshots `01-…` to `05-…`) are the reference; values below are the ones the site boards use.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `--redline` | #D5121E | The accent: feathers, primary buttons, progress, large type. About 10% of any screen |
| `--redline-bright` | #E8432E | Glow highlights only |
| `--redline-deep` | #A30F1F | Shadows of red (seal, pressed button) |
| `--red-on-dark` | #FF5A63 | Small red text and red lines on dark surfaces |
| `--red-on-light` | #B10F19 | Small red text on light surfaces |
| `--carbon` | #0E0F11 | Night base, dark panels, ink on light |
| `--graphite` | #16171A | Raised dark surfaces (cards at night) |
| `--night` | #050506 | The page frame at night |
| `--gallery-white` | #F4F4F5 | Day base, ink on dark |
| `--studio-gray` | #E3E5E9 | Day surfaces, the frame around light cards |
| `--steel` | #4B4F57 | Brand secondary |
| `--ink-2-light` | #3D4047 | Body text on light |
| `--ink-3-light` | #5A5F68 | Meta text on light |
| `--ink-2-dark` | #C9CDD3 | Body text and labels on dark |
| `--ink-3-dark` | #A9AEB6 | Meta text on dark |
| `--ink-4-dark` | #8E939C | Column headings on dark (11 px+, 18% tracking) |
| `--timing-purple` | #C9A0FF | Faster than the messenger in a sector |
| `--timing-yellow` | #F2C94C | Slower in a sector |
| `--timing-green` | #5BE58F | Live delta when ahead; "open" status dot |

Theme aliases (`[data-theme="day"]` / `[data-theme="night"]`): `--surface`, `--frame`, `--ink`, `--muted`, `--dim` (ink at 42%, for the dimmed headline line), `--glass-bg`, `--glass-border`, `--glass-shadow`, `--chip-bg`, `--chip-border`, `--rule`. Values per theme are in `prototypes/Landing-v2-BeforeDawn.dc.html` (`renderVals`, object `P`).

Backgrounds:

- Day hero: `radial-gradient(70% 55% at 50% 34%, #FFFFFF 0%, #EEF0F3 40%, #DADDE2 76%, #CDD1D7 100%)` (the specs section centres it at 62% 40%), with the perspective grid (`#0E0F11` at 7%).
- Night hero: `radial-gradient(64% 36% at 50% 104%, rgba(213,18,30,.34) 0%, rgba(213,18,30,.08) 45%, rgba(213,18,30,0) 72%), radial-gradient(70% 55% at 50% 34%, #1C1D22 0%, #121317 42%, #08090B 78%, #040405 100%)`, grid in white at 5%.

## Type

| Role | Face | Desktop | Phone |
| --- | --- | --- | --- |
| Display (landing hero H1) | Michroma 400, caps | 50 px / 1.1 | 30 px / 1.14 |
| Page H1 (Drivers, News, pages) | Michroma | 56 px / 1.1 | 30 px |
| Manifesto | Michroma | 84 px opening, 48 px sections, 96 px close | 34–40 px |
| Section H2 | Michroma | 40 px / 1.12, `white-space: nowrap` lines | 25–26 px / 1.16 |
| Card title | Michroma | 22–24 px | 18–22 px |
| Body | Geist 400 | 17 px / 1.6 | 15 px / 1.55 |
| Small | Geist | 13–14 px | 13 px |
| Button | Geist 600 | 14–15 px | 15 px |
| Label / eyebrow | Geist Mono, caps | 10.5–11 px, tracking .14–.22em | 10–10.5 px |
| Figures | Geist Mono 500, tabular | 26–44 px (countdown 84 px) | 22–30 px (countdown 58 px) |

Michroma is uppercase by design: write headlines in capitals in `content/`, never with `text-transform`.

## Shape and space

- Page card: the page sits in a rounded card inside the frame: radius 32 px, frame padding 14 px (desktop); 28 px and 8 px (phone).
- Cards 24–28 px radius; glass panels 22–24 px; chips and buttons are pills (999 px); small tiles 14–18 px.
- Section side padding 60 px (desktop text), cards inset 28 px; phone 20 px text, 12 px panels.
- Touch targets ≥ 44 px; primary buttons 52–56 px tall with a 38–44 px white circle holding the arrow.

## Glass

| Recipe | Background | Blur | Border | Shadow |
| --- | --- | --- | --- | --- |
| Header, day | `rgba(255,255,255,.55)` | `blur(18px) saturate(160%)` | `rgba(255,255,255,.85)` | `0 10px 30px -14px rgba(14,15,17,.22), inset 0 1px 0 rgba(255,255,255,.9)` |
| Header, night | `rgba(22,23,27,.55)` | same | `rgba(255,255,255,.12)` | `0 10px 30px -14px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.08)` |
| Dark panel (dashboard, figures) | `linear-gradient(180deg, rgba(34,35,40,.82), rgba(12,13,15,.9))` | `blur(22px) saturate(140%)` | `rgba(255,255,255,.16)` | `0 30px 60px -28px rgba(14,15,17,.6), inset 0 1px 0 rgba(255,255,255,.14)` |
| Chip, day | `rgba(255,255,255,.62)` | `blur(12px)` | `rgba(255,255,255,.9)` | `0 8px 20px -10px rgba(14,15,17,.3)` |

Provide a solid fallback when `backdrop-filter` is unsupported.

## The 14° rule

One angle carries the brand: the mark's lean, the Slipstream stripes (`skewX(-14deg)`), the Redline edge of the text wipe, the kerbs, the feathers in motion (they travel along 14°). Don't introduce other angles.

## Motion

| Token | Value |
| --- | --- |
| `--ease-out` | `cubic-bezier(.22, 1, .36, 1)`; in JS `1 - (1 - t) ** 3` |
| `--dur-wipe` | 450 ms (stripe wipe, text wipe) |
| `--dur-ignite` | 2600 ms (dials sweep 42%, settle 58%) |
| `--dur-count` | 800 ms after a 150 ms delay |
| `--dur-hover` | 150 ms |

Only ease-out. Full catalogue in `11-motion.md`.

## Focus

`:focus-visible { outline: 2px solid var(--redline); outline-offset: 2px; }`, on light and dark (contrast ≥ 3:1 against both). Never remove outlines without this replacement.
