---
paths:
  - "app/**/*.{ts,tsx,css}"
  - "components/**/*.{ts,tsx,css}"
  - "styles/**/*.css"
  - "lib/clock/**/*.ts"
---

# Front-end rules

Specs live in `docs/design/` (numbered by screen) with screenshots in `docs/design/screenshots/`. Tokens are in `docs/design/00-tokens.md` and implemented once in `styles/tokens.css`.

## Components and styling

- Server Components by default. Add `'use client'` only where there is state, effects, timers or 3D.
- CSS Modules per component. Every colour, size, radius, shadow, blur, duration and easing is a `var(--…)` from `styles/tokens.css`. A value that is not a token yet → add the token, don't inline it.
- Two themes: `[data-theme="night"]` (Before Dawn) and `[data-theme="day"]` (First Light) on `<html>`. Components read theme tokens (`--surface`, `--ink`, `--muted`, `--glass-bg` …), never test the theme in JS to pick colours.
- Type: Michroma for display headlines (always uppercase in the copy, not by `text-transform`), Geist for text, Geist Mono for numbers, labels and times, with `font-variant-numeric: tabular-nums` on anything that counts.
- Write "HM‑27" with a non-breaking hyphen (U+2011) in running text so it never breaks across lines; `content/` already does.
- Images: `next/image`. The landing hero still is the LCP element: `priority`, explicit `sizes`, AVIF/WebP from `public/images/`.

## The launch clock (`lib/clock`)

- `DAY_ONE` is one instant (ISO string with offset) in `content/launch.ts`. `phase(now)` returns `'before' | 'firstLight'`. Nothing else decides the phase.
- An inline script in `<head>` sets `data-phase` and `data-theme` before first paint from `Date.now()`, so there is no flash. After hydration, `/api/now` corrects device-clock skew once.
- Visitors on the page at 06:00 see the stripe wipe at that instant (one `setTimeout` to `DAY_ONE`, re-armed on `visibilitychange`).
- The sun/moon button in the header previews the other theme for this visitor (stored in `sessionStorage`). It never changes `phase` for the countdown, the lock text or the campaign beats unless ARCHITECTURE §4.4 says so.
- Prototype boards count to the next 06:00 on the device. **Don't copy that**; the site counts to `DAY_ONE`.

## Motion

- Only ease-out curves (`--ease-out: cubic-bezier(.22,1,.36,1)` and the cubic `1-(1-t)^3` in JS). Durations from tokens: wipe 450 ms, text wipe 450 ms, number count-up 800 ms after 150 ms, dial ignite 2600 ms.
- Every animation has a `prefers-reduced-motion: reduce` path: jump to the end state, keep opacity fades under 200 ms or none. The stripe wipe becomes an instant theme swap.
- Animate `transform`, `opacity` and `clip-path` only. No layout-thrashing properties in loops.

## Accessibility

- WCAG 2.2 AA contrast. On dark surfaces small red text is `--red-on-dark` (#FF5A63); on light, `--red-on-light` (#B10F19). Redline #D5121E is for fills and large type only.
- Touch targets at least 44 × 44 px. Visible `:focus-visible` ring on everything interactive (token `--focus-ring`).
- Icon-only buttons have `aria-label`; toggles use `aria-pressed`; the chapter rail uses `aria-current="step"`; timers use `role="timer"` with a label, and only announce at minute changes.
- Images of the car carry real alt text (what the car looks like in that shot). Decorative stripes, glows, grids: `aria-hidden`.
- The header collapses to a menu button under 900 px; the menu is a dialog with focus trap and Escape to close.

## Pages and data

- Pages import their copy from `content/` (typed modules), their facts from `content/facts.ts` (mirrors `docs/content/facts.md`), and their metadata from `content/seo.ts`.
- Every page renders the shared footer with the model credit and the fictional-team line.
- No cookies, no trackers, no third-party requests at runtime (fonts are self-hosted by next/font).
