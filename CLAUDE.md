# Hermes Motors — the website

A launch site for **Hermes Motors**, a fictional Grand Prix team debuting in 2027, and its car, the **HM-27**. It is Oscar's portfolio piece: brand, campaign and product in one. The site is the launch itself: it counts down to 06:00 on Day One, flips from night to day at that instant, takes the car apart in five chapters, and lets visitors race the test driver's ghost lap ("Beat the messenger").

## Read first, every session

1. `docs/PROGRESS.md` — where the build is, what's next, what is waiting on Oscar. Read it before anything else.
2. `docs/ARCHITECTURE.md` — the source of truth for behaviour: stack, routes, the launch clock, the 3D, the game, share cards, budgets.
3. `docs/design/README.md` — the board index. Open the spec for the screen you are building, and its screenshots.

## Source of truth, in this order

- **Behaviour, data, rules:** `docs/ARCHITECTURE.md`. If a design prototype does something the architecture says not to (the prototype counts down to 06:00 *local* time, for example), **the architecture wins**.
- **Visuals, layout, motion, copy:** `docs/design/` (numbered specs, screenshots, prototype source) and `docs/content/`.
- **Numbers about the car:** `docs/content/facts.md` only. Every figure on the site comes from there, with its source.
- If two documents disagree, or a choice you're about to make contradicts one, **stop and flag it** in your reply and under "Decisions" in PROGRESS.md. Don't pick silently.

## Stack (pinned, see ARCHITECTURE §2)

Next.js 16 (App Router, TypeScript strict) · React 19 · CSS Modules + design tokens in `styles/tokens.css` · three 0.187 + @react-three/fiber 9.8 + @react-three/drei 10.7 · next/font for Michroma, Geist, Geist Mono · Vitest + Playwright · Vercel.

## Repository layout

```
app/                  routes (App Router); route handlers under app/api/
components/
  hermes/             the 3D components from vendor/hermes-hm27 (HermesCar, HermesHelmet, HermesStudio, ProvingGround…)
  site/               header, footer, buttons, glass panels, chips, the stripe wipe
  landing/ specs/ drive/ drivers/ pages/   one folder per area
lib/
  clock/              DAY_ONE, phase, campaign beats, server-time skew
  game/               circuit, physics, ghost, timing, share codec (pure TypeScript, unit-tested)
content/              copy, drivers, season, news (MDX), facts — typed, imported by pages
styles/               tokens.css, globals.css
public/               models/, livery/, track/, images/ (hero stills, specs frames), og/
vendor/hermes-hm27/   the car and helmet package as delivered; keep it pristine, copy from it
tools/render/         the render harness (stills and frames), from the package
tests/                unit/ (vitest) and e2e/ (playwright)
docs/                 these planning documents
```

## Working rules

- **Plan first.** For each milestone in PROGRESS.md, propose the steps and files before writing code, and wait for Oscar's OK.
- **Small PRs.** One task per branch, `main` protected, CI green before merge (typecheck, lint, unit, build). Conventional commit messages.
- **Update `docs/PROGRESS.md`** when a task finishes: tick it, add one log line (date, what, PR). Keep the file under 8,000 characters; the hook prints it back after compaction and longer output is cut.
- **Tokens, not values.** Colours, type sizes, radii, durations and easings come from `styles/tokens.css`. No hex codes in components.
- **Copy from `content/`.** No user-facing string is typed inside a component. The brand voice is in `docs/content/voice.md`.
- **The clock.** Never compute "06:00" in the visitor's time zone. Phase comes from `lib/clock` and the single `DAY_ONE` instant.
- **The car and the helmet.** Don't edit the GLB files. Change liveries through `components/hermes/livery.ts` (car) and `HELMET_LIVERIES` (helmet); rebuild models only with `vendor/hermes-hm27/pipeline`.
- **Credits stay.** The CC BY line for the 3D model and the "fictional team" line appear in the footer of every page, the press kit, share images that show the car, and the film. Never remove them.
- **Accessibility is part of done.** WCAG 2.2 AA, 44 px touch targets, visible focus, `prefers-reduced-motion` honoured everywhere, every interactive board's keyboard path working.
- **Performance is part of done.** Budgets in ARCHITECTURE §10. 3D code is dynamically imported and never blocks the hero.
- **No secrets in the repo.** Environment variables are documented in `.env.example`.

## Commands (once M0 is done)

```bash
npm run dev          # local site
npm run typecheck    # tsc --noEmit
npm run lint
npm run test         # vitest
npm run e2e          # playwright (desktop + phone projects)
npm run build
```

## When unsure

Ask Oscar, briefly, with the options you see. Things only he decides are listed under "Decisions" in PROGRESS.md; use the placeholder values there until he answers, and never present a placeholder as final.
