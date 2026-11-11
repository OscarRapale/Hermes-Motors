# Progress

**Now:** M1 landing hero (plan approved 2026-11-10). **Next:** PR 3, the stripe wipe + live flip at DAY_ONE.

## Milestones

### M0 Foundation
- [x] Scaffold Next.js 16 (App Router, TS strict, ESLint), Node 22; pin versions (list them in the log)
- [x] `styles/tokens.css` + globals from docs/design/00-tokens.md; next/font (Michroma, Geist, Geist Mono)
- [x] Header (nav, menu dialog under 900 px, theme preview button, Test drive) + footer with credits
- [x] `lib/clock`, `content/launch.ts`, inline phase script, `/api/now`, preview toggle (ARCH §4)
- [x] Car package: vendor/hermes-hm27 → components/hermes, tools/render, public/models, livery, track; vendor/assets → public/images (AVIF + WebP), public/press (docs/design/assets.md)
- [x] Vitest + Playwright skeleton, GitHub Actions, `.env.example`
  - [x] Vercel project (production: https://hermes-motors.vercel.app) + preview per PR; `main` protected, `ci` required

### M1 Landing hero
- [x] Before Dawn: still, countdown, LEDs, sealed rows, CTAs, `.ics`
- [x] First Light: still, hotspots, dashboard, dials + ignite, HP/kW
- [ ] Stripe wipe + live flip at DAY_ONE; reduced motion
- [ ] Phone layouts (boards 22, 23)

### M2 Specs section
- [ ] Pinned chapters, scroll mapping, rail, Play
- [ ] Live scene (SpecsApart) + frame fallback, callouts from anchors
- [ ] Phone layout (board 24); reduced motion

### M3 Test drive
- [ ] Circuit from PTS (3,121 m), kerbs, walls, gantry
- [ ] Messenger ghost from SPD (sums to 71.906 s)
- [ ] Physics + tuning + three reference laps in tests
- [ ] HUD, lights, sectors, delta, map; desktop keys; phone controls; rotate; pause; no-WebGL state

### M4 Finish and share
- [ ] Finish screens (14, 17); `/drive/r` + validation; `/api/card` link + story
- [ ] Web Share / download / copy link; best lap in localStorage

### M5 Pages
- [ ] Drivers (3D helmets: stills first, then live `DriverHelmet`), News (+ MDX article), Team, Season, Partners, Store
- [ ] Manifesto, Press kit (+ downloads), Credits, Privacy, 404

### M6 Launch
- [ ] Accessibility audit (axe + manual, both themes) · performance budgets (Lighthouse CI)
- [ ] SEO/OG per route · analytics decision · cross-device QA
- [ ] Set DAY_ONE, domain, launch checklist

## Decisions waiting on Oscar

Placeholders are in the code until he answers. Never present them as final.

| # | Decision | Placeholder | Notes |
| --- | --- | --- | --- |
| D1 | Day One date | Sun 14 Feb 2027 | Opener in Bahrain is 12–14 Mar 2027, so race day = D+28. Feb 14 is Valentine's Day; alternative Fri 12 Feb (D+28 = start of the opener weekend), or the day the portfolio piece goes live |
| D2 | Proving Ground time zone | America/Puerto_Rico | UTC−4, no daylight saving |
| D3 | Preview unlocks the drive before Day One | Yes, with a "Preview" banner | Otherwise recruiters can't play until Day One |
| D4 | Drivers | Lena Brandt #9 (GER), Mateo Ríos #19 (PUR) | Fictional; helmets only, no faces. Numbers are drawn at runtime, but the helmet stills show 9 and 19: re-render them if the numbers change |
| D5 | Domain; "Made by Oscar" link | no domain: the `*.vercel.app` production URL | Site URL = `NEXT_PUBLIC_SITE_URL` ?? `VERCEL_PROJECT_PRODUCTION_URL` ?? localhost |
| D6 | Analytics | none | Option: Vercel Web Analytics (cookieless) |
| D7 | Store | Lookbook, no cart | |
| D8 | Press office / partners contact | buttons, no target | mailto address or a form |
| D9 | Jump start | +5 s penalty | proposal |
| D10 | Hashtag, opener beat | #BeatTheMessenger, D+28 | |
| D11 | E2E target in CI (ARCH §14 says preview URL) | local `next start` build | preview URL needs a Vercel protection-bypass secret; revisit in M6 |
| D12 | Token gaps | `--surface` Studio Gray / Carbon; `--rule` ink 10%; `--chip-*` (header buttons) vs `--glass-chip-*` (floating chips); night frame `#050506`; phone values < 900 px | 00-tokens names these without values, or boards disagree |
| D13 | Preview button semantics | label switches by theme (copy.md), no `aria-pressed`; the visible "Preview" chip shows the state | rules/frontend.md says toggles use `aria-pressed`; a pressed state on a label that flips reads badly |
| D14 | Header/footer vs boards | 900–1199 px: mark only, tighter nav, short night status; 44 px pills and links (boards 36); phone "Preview" chip under the header; locked pill links to `/drive`; new strings: skip link, menu labels | boards are 1440/390 only; 44 px targets |
| D15 | JS budget on `/` | **Decided 2026-11-10:** total < 190 KB gz + first-party < 40 KB gz (ARCH §10) | was < 120 KB, unreachable: Next 16 + React 19 ≈ 166 KB; M0 measured 176.6 total, ≈ 10 first-party |
| D16 | Hero stills (ARCH §5 says next/image + priority) | **Decided:** `<picture>` with the pre-built AVIF/WebP 1x/2x, both `loading=lazy`; an inline script makes the visible one eager + high priority before layout | both themes are in the DOM (§4.2); next/image priority would fetch both stills |
| D17 | Countdown over 100 h | **Decided:** "96 DAYS" at 84 px over HH:MM:SS at 44 px; under 100 h the board's single 84 px HH:MM:SS | "D DAYS · HH:MM:SS" (§4.1) is ~900 px wide at 84 px |

## Log

- 2026-11-10 · Day hero (PR #9): dashboard (ignite, 15 LEDs, HP/kW with `aria-pressed`, five SVG dials, `role="img"`), ignition 2600 ms once per session on first view (`hermes.ignited`), reduced motion settled; hotspots → `/#specs-2|3|5` (ids in M2); `facts.ts` §A/§B. JS on `/`: 181.5 KB gz (first-party ≈ 15 KB).
- 2026-11-10 · Night hero (PR #8): stage (both stills via `<picture>` + inline eager switch, D16; outline word; grid), both text columns, night panel (LEDs over the last 6 h, countdown with D17 days line, sealed rows), `/day-one.ics` (static), `Cta`. Only the visible still is fetched. JS on `/`: 178.6 KB gz total (+2 KB vs M0).
- 2026-11-10 · M1 plan approved: four PRs (night hero, day hero, stripe wipe, phone). D16, D17 decided.
- 2026-11-10 · **M0 done** (PRs #1–#7). Pins: next + eslint-config-next 16.4.5, react/react-dom 19.3.1, typescript 5.9.3, eslint 9.39.5, @types/react(-dom) 19.3.0, @types/node 22.20.5, vitest 5.1.0, @playwright/test + playwright-core 1.63.0, @axe-core/playwright 4.14.0, three + @types/three 0.187.0, fiber 9.8.2, drei 10.7.9, postprocessing 3.2.2 / 6.39.6, sharp 0.35.5 (stats-gl overridden to our three). Shell (header, phone menu, footer, page card), tokens + fonts, launch clock + `/api/now` + preview, CI + Vercel + protected main, car package verbatim in `components/hermes`, `npm run assets`, `tools/render` (sync from `components/hermes`). Details in the PRs.
- 2026-11-09 · Driver helmets: a CC BY 4.0 helmet (Miopass) repainted in the Hermes livery; `HermesHelmet` and `DriverHelmet` in the car package (v2.2); stills in `vendor/assets/images/drivers`.
- 2026-11-07 · Handoff: design boards 01–30, car package v2, First Light film, docs.
