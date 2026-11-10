# Progress

**Now:** M0 in progress (plan approved 2026-11-10; order: scaffold → CI → tokens → clock → header/footer → car package). **Next:** launch clock.

## Milestones

### M0 Foundation
- [x] Scaffold Next.js 16 (App Router, TS strict, ESLint), Node 22; pin versions (list them in the log)
- [x] `styles/tokens.css` + globals from docs/design/00-tokens.md; next/font (Michroma, Geist, Geist Mono)
- [ ] Header (nav, menu dialog under 900 px, theme preview button, Test drive) + footer with credits
- [ ] `lib/clock`, `content/launch.ts`, inline phase script, `/api/now`, preview toggle (ARCH §4)
- [ ] Car package: vendor/hermes-hm27 → components/hermes, tools/render, public/models, livery, track; vendor/assets → public/images (AVIF + WebP), public/press (docs/design/assets.md)
- [x] Vitest + Playwright skeleton, GitHub Actions, `.env.example`
  - [x] Vercel project (production: https://hermes-motors.vercel.app) + preview per PR; `main` protected, `ci` required

### M1 Landing hero
- [ ] Before Dawn: still, countdown, LEDs, sealed rows, CTAs, `.ics`
- [ ] First Light: still, hotspots, dashboard, dials + ignite, HP/kW
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
| D12 | Token gaps (flag, not Oscar-only) | `--surface` day Studio Gray / night Carbon; `--rule` ink 10%; header round buttons `--chip-*` (P: .7/.95) vs floating `--glass-chip-*` (00-tokens: .62/.9 + blur); night frame `#050506` (footer board shows `#0E0F11`); phone values below 900 px | 00-tokens names these without values or the boards disagree |

## Log

- 2026-11-10 · Tokens + fonts (PR #3): `styles/tokens.css` (palette, two themes, type scale, glass, motion, focus), `globals.css`, next/font in `lib/fonts.ts`; unit guard: no raw colours outside tokens.css, every `var(--…)` defined. Font licences checked (OFL 1.1) → credits.md.
- 2026-11-10 · CI + tests (PR #2): vitest 5.1.0, @playwright/test + playwright-core 1.63.0 (pinned together so axe shares the types), @axe-core/playwright 4.14.0; projects desktop / Pixel 7 / iPhone 14 landscape; workflow `ci` (typecheck, lint, unit, build, e2e).
- 2026-11-10 · M0 scaffold (PR #1): next 16.4.5 (cacheComponents on), react/react-dom 19.3.1, typescript 5.9.3 (not 7.x: the car package was tested on 5), eslint 9.39.5, eslint-config-next 16.4.5, @types/react(-dom) 19.3.0, @types/node 22.20.5; Node 22 in `.nvmrc`/engines (Oscar's machine runs 24; npm only warns). Fixed game.md §6 → §7.
- 2026-11-09 · Driver helmets: a CC BY 4.0 helmet (Miopass) repainted in the Hermes livery; `HermesHelmet` and `DriverHelmet` in the car package (v2.2); board 25 shows the renders; stills in `vendor/assets/images/drivers`.
- 2026-11-07 · Handoff: design boards 01–30 (canvas "Hermes Motors — Visual Directions"), car package v2, First Light film, docs.
