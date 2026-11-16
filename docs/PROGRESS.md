# Progress

**Now:** M5 PR 6 (Manifesto). **Next:** PR 7, Press kit.
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
- [x] Phone layout (board 24); reduced motion

### M3 Test drive
- [x] Circuit from PTS (3,119 m), kerbs, walls, gantry
- [x] Messenger ghost from SPD (sums to 71.906 s)
- [x] Physics + tuning + three reference laps in tests
- [x] HUD, lights, sectors, delta, map; desktop keys; phone controls; rotate; pause; no-WebGL state

### M4 Finish and share
- [x] Finish screens (14, 17); `/drive/r` + validation; `/api/card` link + story
- [x] Web Share / download / copy link

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
| D1 | Day One date | Sun 14 Feb 2027 | Opener in Bahrain is 12–14 Mar 2027, so race day = D+28. Feb 14 is Valentine's Day; alt. Fri 12 Feb or the go-live day |
| D2 | Proving Ground time zone | America/Puerto_Rico | UTC−4, no daylight saving |
| D3 | Preview unlocks the drive before Day One | Yes, with a "Preview" banner | Otherwise recruiters can't play until Day One |
| D4 | Drivers | Lena Brandt #9 (GER), Mateo Ríos #19 (PUR) | Fictional; helmets only, no faces. Numbers are drawn at runtime, but the helmet stills show 9 and 19: re-render them if the numbers change |
| D5 | Domain; "Made by Oscar" link | no domain: the `*.vercel.app` production URL | Site URL = `NEXT_PUBLIC_SITE_URL` ?? `VERCEL_PROJECT_PRODUCTION_URL` ?? localhost |
| D6 | Analytics | none | Option: Vercel Web Analytics (cookieless) |
| D7 | Store | Lookbook, no cart | |
| D8 | Press office / partners contact | buttons, no target | mailto address or a form |
| D9 | Jump start | **Decided 2026-11-13:** +5 s, said at once (red lights caption), explained before the start | |
| D10 | Hashtag, opener beat | #BeatTheMessenger, D+28 | |
| D11 | E2E target in CI (ARCH §14 says preview URL) | local `next start` build | preview URL needs a Vercel protection-bypass secret; revisit in M6 |
| D12–14 | Token gaps; Preview/Play labels flip; header 900–1199 px mark only | as flagged | PRs #3–#5 |
| D15–18 | JS, hero stills, countdown, LCP | **Decided:** JS < 40 KB gz first-party; `<picture>` + preload; "96 DAYS"; LCP throttled | PRs #8–#12 |
| D19–23 | Specs | **Decided:** sealed at night; night frames; ch 5 night headline; JS on `/` < 206 KB gz; no effects in the specs scene | PRs #13–#14, ARCH §6, §10 |
| D24–25 | Specs text that scrolls | **Decided:** on phones and screens under 830 px tall the text scrolls under/beside the pinned car | PRs #15–#16 |
| D26–27 | Start; three.js before scroll | **Decided:** grid 65 m behind the line, lap and ghost start at it, car on the centre line until then; specs load their car only after the first scroll | `gridBehindM`; ARCH §10, rules/three.md |
| D28 | Test drive difficulty | careful lap just behind him (+0.15), clean racing line −3.5 s; grip ×0.7, friction circle, pedal ramps, brakes 34/22 | after Oscar's playtests; ARCH §7.3. Confirm after driving it |
| D29 | Phone drive | **Decided 2026-11-13:** compact HUD as board 16, no sector bars; BST tap = 2 s of Boost (again extends, brake cancels) | PR 5a/5b |
| D30 | Finish and share | **Decided 2026-11-13:** jump start = `j=1` (lap as driven + 5 s); summary with figures; finish works in landscape; `/drive/r` CTA "Beat the messenger"; never mention sign-up or databases | M4 |

## Log

- 2026-11-13/14 · M5 PRs 1–5: `PageHero`, `Doc`; credits, privacy, 404; team, season (checked against facts.md); partners, store; drivers (stills, then live helmets); news (MDX; a story shows from its beat, all while previewing); manifesto (text wipe on view). `proxy.ts` 404s bad `/drive/r` and `/news/*`. Day dims 50%. Copy guard: no sign-up/database.
- 2026-11-13 · **M4 done** (PRs #25–#26): `lib/game/share.ts`; `/api/card` link + story (OFL fonts in `assets/`); `Result` (boards 14, 17) at the finish and on `/drive/r` (card as OG, noindex, `proxy.ts` 404s); Share = share sheet on touch, else both PNGs + link.
- 2026-11-13 · **M3 done** (PRs #23–#24): rotate screen (board 15), compact HUD (board 16), thumb pads, BST tap = 2 s Boost (D29), haptics; WebGL e2e one at a time.
- 2026-11-12 · Handling (PR #22): friction circle, pedal ramps, quicker steering, softer brakes, grip ×0.7, 3-2-1 braking boards at six corners; right-hand pedals (R Shift/R Ctrl, Boost E; mid-lap exit asks first); two-row key bar under 1480 px; controls sheet on first visit, and from pause; laps re-recorded (D28).
- 2026-11-11/12 · M3 core (PRs #17–#20): circuit (3,119 m), ghost, arcade car, fixed step, reference laps in CI; `/drive`, keys, lights, pause, board 13 HUD, best + attempts on device.
- 2026-11-11 · **M2 done** (PRs #13–#16): pinned chapters (frame stack + zoom, callouts, rail, Play; sealed at night, D19/D21); live `SpecsScene` placed from the recovered crop, night frames (D20), **SITE PATCH** `HermesStudio` `near={-0.01}` (contact shadow); phones (board 24) and short screens: text scrolls under/beside the pinned car (D24, D25). JS before scroll 190.9 KB gz.
- 2026-11-10 · **M1 done** (PRs #8–#11): night hero (countdown D17, LEDs, sealed rows, `/day-one.ics`), day dashboard (5 dials, ignition, HP/kW, hotspots), Slipstream wipe + live flip (≤ 24-day timer steps), phone boards 22/23 (`display: contents` grid), D16 stills. `experimental.inlineCss` on. Measured `/`: LCP 2.2 s mobile (real throttling), CLS 0.002, desktop Lighthouse 100 ×4; JS 182.4 KB gz (first-party ≈ 16).
- 2026-11-10 · **M0 done** (PRs #1–#7). Pins: next + eslint-config-next 16.4.5, react/react-dom 19.3.1, typescript 5.9.3, eslint 9.39.5, @types/react(-dom) 19.3.0, @types/node 22.20.5, vitest 5.1.0, @playwright/test + playwright-core 1.63.0, @axe-core/playwright 4.14.0, three + @types/three 0.187.0, fiber 9.8.2, drei 10.7.9, postprocessing 3.2.2 / 6.39.6, sharp 0.35.5 (stats-gl overridden to our three). Shell, tokens + fonts, launch clock + `/api/now` + preview, CI + Vercel, car package in `components/hermes`, `npm run assets`, `tools/render`.
- 2026-11-09 · Driver helmets (Miopass, CC BY 4.0, Hermes livery): `HermesHelmet`, `DriverHelmet` (package v2.2); stills in `vendor/assets/images/drivers`.
- 2026-11-07 · Handoff: boards 01–30, car package v2, film, docs.
