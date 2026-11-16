# Progress

**Now:** M7 PR 3 (test drive sound); M7 done with it. **Next:** Oscar closes the open decisions (`docs/launch.md` §1), then the real-device pass.
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
- [x] Drivers (3D helmets: stills first, then live `DriverHelmet`), News (+ MDX article), Team, Season, Partners, Store
- [x] Manifesto, Press kit (+ downloads), Credits, Privacy, 404

### M6 Launch
- [x] Accessibility audit (axe + manual, both themes) · performance budgets (Lighthouse CI) — screen-reader pass: Oscar, `docs/audit/accessibility.md`
- [x] SEO/OG per route · analytics decision (none) · cross-browser e2e (`npm run e2e:engines`) — real devices: Oscar, `docs/launch.md` §5
- [ ] Set DAY_ONE, domain (Oscar: `docs/launch.md` §1–2) · [x] launch checklist

### M7 Sound (Oscar 2026-11-16, ARCH §7.7)
- [x] `lib/audio` (context, buses, loops, sound preference), `public/audio`, credits, privacy
- [x] Dashboard: ignition sound, SOUND toggle (label + live wave)
- [x] Test drive: engine by RPM, soundtrack, mute (HUD, M, pause)

## Decisions waiting on Oscar

Placeholders are in the code until he answers. Never present them as final.

| # | Decision | Placeholder | Notes |
| --- | --- | --- | --- |
| D1 | Day One date | Sun 14 Feb 2027 | Bahrain opener 12–14 Mar 2027 = D+28; alt. Fri 12 Feb or the go-live day |
| D2 | Proving Ground time zone | America/Puerto_Rico | UTC−4, no daylight saving |
| D3 | Preview unlocks the drive before Day One | Yes, with a "Preview" banner | Otherwise recruiters can't play until Day One |
| D4 | Drivers | Lena Brandt #9 (GER), Mateo Ríos #19 (PUR) | Fictional, helmets only; the stills show 9 and 19: re-render if the numbers change |
| D5 | Domain; "Made by Oscar" link | no domain: the `*.vercel.app` production URL | Site URL = `NEXT_PUBLIC_SITE_URL` ?? `VERCEL_PROJECT_PRODUCTION_URL` ?? localhost |
| D6 | Analytics | **Decided 2026-11-16:** none | |
| D7 | Store | Lookbook, no cart | |
| D8 | Press office / partners contact | buttons, no target | mailto address or a form |
| D9 | Jump start | **Decided 2026-11-13:** +5 s, said at once (red lights caption), explained before the start | |
| D10 | Hashtag, opener beat | #BeatTheMessenger, D+28 | |
| D11 | E2E target in CI (ARCH §14 says preview URL) | local `next start` build | recommended to keep (preview URL needs a bypass secret) |
| D12–27 | Tokens, labels, JS budgets, hero stills, countdown, LCP, specs, the grid, three.js before scroll | **Decided** (M0–M3) | PRs #3–#16; ARCH §6, §10, rules/three.md |
| D28 | Test drive difficulty | careful lap just behind him (+0.15), clean racing line −3.5 s; grip ×0.7, friction circle, pedal ramps, brakes 34/22 | after Oscar's playtests; ARCH §7.3. Confirm after driving it |
| D29 | Phone drive | **Decided 2026-11-13:** compact HUD as board 16, no sector bars; BST tap = 2 s of Boost (again extends, brake cancels) | PR 5a/5b |
| D31 | Soundtrack | **Decided 2026-11-16:** "Hagion", DJ Seduce, Epidemic Sound; Oscar's plan covers websites | credited on /credits; source kept out of git |
| D30 | Finish and share | **Decided 2026-11-13:** jump start = `j=1` (lap as driven + 5 s); summary with figures; finish works in landscape; `/drive/r` CTA "Beat the messenger"; never mention sign-up or databases | M4 |

## Log

- 2026-11-16 · M7 PR 3: engine loop rate = RPM / 9,500 (idles and revs on the grid; Boost +4%), soundtrack streamed (`track`, 40% under the engine; fades on pause and at the finish); M, a wave button under pause, SOUND on the pause sheet.
- 2026-11-16 · M7 PRs 1–2: `lib/audio` (one AudioContext after the first interaction, buses, cached files, loops); engine loop cut by `npm run assets` (2.6 s WAV); sound credit, privacy line; ignition sound; `SoundToggle` (label + live wave) beside HP/kW. (Playwright clicks unlock audio in Chromium.)
- 2026-11-16 · M6 PR 5: Firefox + WebKit e2e (`npm run e2e:engines`), `docs/launch.md`, `madeByHref`, D6 in docs.
- 2026-11-16 · M6 PRs 1–3: canonical + a preview per route (`content/og.ts`), sitemap, robots; JS budget on `/` (154.3 KB, 25.1 ours), Lighthouse CI (100 ×4); `a11y.spec.ts` (axe every route × theme × device, focus rings, reflow 320, reduced motion, targets ≥ 24, one h1), `docs/audit/accessibility.md`.
- 2026-11-13/16 · **M5 done** (PRs #28–#34): drivers, news (MDX, shown from its beat), team, season, partners, store, manifesto, press kit (8.4 MB zip), credits, privacy, 404 (`proxy.ts`).
- 2026-11-13 · **M4 done** (PRs #25–#26): `lib/game/share.ts`; `/api/card` link + story (OFL fonts in `assets/`); `Result` (boards 14, 17) at the finish and on `/drive/r` (card as OG, noindex, `proxy.ts` 404s); Share = share sheet on touch, else both PNGs + link.
- 2026-11-13 · **M3 done** (PRs #23–#24): rotate screen, compact HUD, thumb pads, BST = 2 s Boost (D29), haptics.
- 2026-11-12 · Handling (PR #22): friction circle, pedal ramps, grip ×0.7, braking boards; R Shift/R Ctrl, Boost E; controls sheet on first visit and from pause; laps re-recorded (D28).
- 2026-11-11/12 · M3 core (PRs #17–#20): circuit (3,119 m), ghost, arcade car, reference laps in CI; `/drive`, keys, lights, pause, HUD.
- 2026-11-11 · **M2 done** (PRs #13–#16): pinned chapters, rail, Play; live `SpecsScene`, night frames; **SITE PATCH** `HermesStudio` `near={-0.01}`; D24, D25.
- 2026-11-10 · **M1 done** (PRs #8–#11): night hero, `/day-one.ics`, day dashboard, wipe + live flip, phone boards 22/23. `experimental.inlineCss` on. `/`: LCP 2.2 s mobile, CLS 0.002, Lighthouse 100 ×4.
- 2026-11-10 · **M0 done** (PRs #1–#7). Pins: next + eslint-config-next 16.4.5, react/react-dom 19.3.1, typescript 5.9.3, eslint 9.39.5, @types/react(-dom) 19.3.0, @types/node 22.20.5, vitest 5.1.0, @playwright/test + playwright-core 1.63.0, @axe-core/playwright 4.14.0, three + @types/three 0.187.0, fiber 9.8.2, drei 10.7.9, postprocessing 3.2.2 / 6.39.6, sharp 0.35.5 (stats-gl overridden to our three). Shell, tokens + fonts, launch clock + `/api/now` + preview, CI + Vercel, car package in `components/hermes`, `npm run assets`, `tools/render`.
- 2026-11-09 · Driver helmets (Miopass, CC BY 4.0, Hermes livery): `HermesHelmet`, `DriverHelmet` (package v2.2); stills in `vendor/assets/images/drivers`.
- 2026-11-07 · Handoff: boards 01–30, car package v2, film, docs.
