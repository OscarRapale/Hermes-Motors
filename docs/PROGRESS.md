# Progress

**Now:** M2 specs (plan approved 2026-11-10). **Next:** PR 3, phone layout (board 24).
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
- [x] Stripe wipe + live flip at DAY_ONE; reduced motion
- [x] Phone layouts (boards 22, 23)

### M2 Specs section
- [x] Pinned chapters, scroll mapping, rail, Play
- [x] Live scene (SpecsApart) + frame fallback, callouts from anchors
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
| D12 | Token gaps | `--surface`, `--rule`, two chip recipes, night frame `#050506`, phone < 900 px | flagged, see PR #3 |
| D13 | Preview / Play buttons | labels flip, no `aria-pressed` | flagged, see PR #4 |
| D14 | Header/footer vs boards | 900–1199 px mark only; 44 px pills/links | flagged, see PR #5 |
| D15 | JS budget on `/` | **Decided:** first-party < 40 KB gz; total revised by D22 | |
| D16 | Hero stills | **Decided:** `<picture>`, lazy + head preload + eager switch | PR #8, #11 |
| D17 | Countdown over 100 h | **Decided:** "96 DAYS" over HH:MM:SS | PR #8 |
| D18 | LCP measurement | **Decided:** Lighthouse mobile, real throttling (ARCH §10) | PR #12 |
| D19 | Specs before Day One | **Decided:** sealed: Before Dawn livery; the hero's five figures sealed; rules facts shown | |
| D20 | Night fallback frames | **Decided:** render them (M2 PR 2), same crop as the day set | |
| D21 | Chapter 5 at night | **Decided 2026-11-11:** "THE NUMBER / ARRIVES AT / 06:00." + body without kW | its day headline and body are sealed numbers |
| D22 | Total JS on `/` | **Decided 2026-11-11:** < 206 KB gz (framework ≈ 166 + first-party 40), ARCH §10 | 190 tripped before the first-party budget |
| D23 | Effects in the specs scene | **None** (ARCH §6 says HermesEffects on desktop) | the frames were rendered without them; 03-specs: live and frames "must match"; also saves GPU and the postprocessing chunk |

## Log

- 2026-11-11 · Live specs car (PR #14): `SpecsScene` (frames' camera), canvas placed from the recovered crop (`specs-layout.json` → `crop`) inside the same zoom layer; loads one viewport early, WebGL2 + no data saver; night frames rendered (D20). Fixed: R3F measured through the CSS zoom (`offsetSize`); **SITE PATCH** `HermesStudio` `near={-0.01}` (v2.1's 3 mm lift clipped drei's blur plane: no contact shadow); three.js leaked into first load via a static preload import. JS before scroll 190.9 KB; 3D chunk ≈ 292 KB gz on approach.
- 2026-11-10 · Specs chapters (PR #13): pinned section, 5 slots (#specs-1…5), hysteresis, frame stack + zoom, callouts from anchors, text wipe, count-up, rail, Play, HM‑27 location; sealed at night (D19, D21). Fix: label-case overrides out-rank the global `.label`.
- 2026-11-10 · **M1 done** (PRs #8–#11): night hero (countdown D17, LEDs, sealed rows, `/day-one.ics`), day dashboard (5 dials, ignition once per session, HP/kW, hotspots → `/#specs-2|3|5`), Slipstream wipe + live flip (≤ 24-day timer steps), phone boards 22/23 (`display: contents` grid), D16 stills. Bugs caught: minifier `450ms` → `.45s` (`parseCssTime`); favicon 404; 404 prefetches (now `BUILT_ROUTES`). `experimental.inlineCss` on. Measured `/`: LCP 2.2 s mobile (real throttling), CLS 0.002, desktop Lighthouse 100 ×4; JS 182.4 KB gz (first-party ≈ 16).
- 2026-11-10 · **M0 done** (PRs #1–#7). Pins: next + eslint-config-next 16.4.5, react/react-dom 19.3.1, typescript 5.9.3, eslint 9.39.5, @types/react(-dom) 19.3.0, @types/node 22.20.5, vitest 5.1.0, @playwright/test + playwright-core 1.63.0, @axe-core/playwright 4.14.0, three + @types/three 0.187.0, fiber 9.8.2, drei 10.7.9, postprocessing 3.2.2 / 6.39.6, sharp 0.35.5 (stats-gl overridden to our three). Shell (header, phone menu, footer, page card), tokens + fonts, launch clock + `/api/now` + preview, CI + Vercel + protected main, car package verbatim in `components/hermes`, `npm run assets`, `tools/render` (sync from `components/hermes`). Details in the PRs.
- 2026-11-09 · Driver helmets: a CC BY 4.0 helmet (Miopass) repainted in the Hermes livery; `HermesHelmet` and `DriverHelmet` in the car package (v2.2); stills in `vendor/assets/images/drivers`.
- 2026-11-07 · Handoff: design boards 01–30, car package v2, First Light film, docs.
