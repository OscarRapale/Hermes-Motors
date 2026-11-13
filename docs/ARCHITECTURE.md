# Hermes Motors — Architecture

> **v1.0 (7 November 2026).** Source of truth for behaviour, data and rules. The design handoff (`docs/design/`) is the source of truth for visuals, layout, motion and copy. When a prototype contradicts this document, this document wins; when you find a contradiction, stop and flag it (PROGRESS.md → Decisions).

## 1. What we're building

A launch website for a fictional Grand Prix team. It has three jobs, in this order:

1. **Stage the reveal.** Before Day One the site is night: a countdown to 06:00 at the Proving Ground, the car in the dark, the specs sealed. At that instant it turns to day for everyone at once.
2. **Explain the car.** The HM-27 comes apart in five chapters, each with one number from the 2026 rules.
3. **Hand over the wheel.** "Beat the messenger": one lap of the Proving Ground against the test driver's ghost, ending in a share card.

Around those: Drivers, News, Team, Season 2027, Partners, Store, Manifesto, Press kit, Credits, Privacy.

**Audience.** People who love the engineering of speed, and recruiters looking at Oscar's portfolio. Both must be able to see the night and the day versions at any time (§4.4).

**Non-goals.** No accounts, no database, no CMS, no checkout, no leaderboard, no cookies.

## 2. Stack

| Layer | Choice | Pin |
| --- | --- | --- |
| Framework | Next.js App Router, TypeScript strict | next 16.x (the car package was tested on 16.4.5), React 19.3 |
| Styling | CSS Modules + CSS custom properties (`styles/tokens.css`) | — |
| Fonts | `next/font/google`: Michroma 400, Geist (variable), Geist Mono (variable), self-hosted at build | — |
| 3D | three, @react-three/fiber, @react-three/drei; @react-three/postprocessing only for `HermesEffects` | 0.187.0 · 9.8.x · 10.7.x · 3.2.x |
| Content | Typed TS modules in `content/`; news as MDX (`@next/mdx`) | — |
| Share images | `next/og` `ImageResponse` | — |
| Tests | Vitest (unit), Playwright (e2e: desktop Chrome, Pixel 7, iPhone 14 landscape) | — |
| Hosting | Vercel (Production = `main`, Preview = every PR) | — |
| Node | 22 LTS | — |

Pin exact versions in `package.json` at M0 and record them in PROGRESS.md.

## 3. Routes

| Route | What | Rendering |
| --- | --- | --- |
| `/` | Hero (phase-aware) → Specs (5 chapters) → Drive band → Footer | static + client islands |
| `/drive` | Test drive. Before Day One: locked page with countdown, unless previewing (§4.4) | static shell, client game |
| `/drive/r` | A shared result: `?lap&s&a` (§7) | dynamic, validated |
| `/api/card` | Share image, `format=link` 1200×630 or `story` 1080×1920 | edge/node route |
| `/api/now` | `{ now: <epoch ms> }` for clock skew | dynamic, `no-store` |
| `/manifesto` | The manifesto | static |
| `/team`, `/drivers`, `/season`, `/partners`, `/store` | Site pages | static |
| `/news`, `/news/[slug]` | News list and article (MDX) | static |
| `/press` | Press kit (downloads in `public/press/`) | static |
| `/credits`, `/privacy` | Legal | static |

Every page: shared header (nav: Team · HM-27 · Drivers · Season 2027 · Partners · News; Store icon; theme preview button; Test drive button), shared footer.

## 4. The launch clock

### 4.1 One instant

`content/launch.ts`:

```ts
export const DAY_ONE = '2027-02-14T06:00:00-04:00' // PLACEHOLDER — Decision D1/D2 in PROGRESS.md
export const PROVING_GROUND_TZ = 'America/Puerto_Rico' // PLACEHOLDER — Decision D2
```

`lib/clock`:

- `phase(now: number): 'before' | 'firstLight'` — `now < Date.parse(DAY_ONE) ? 'before' : 'firstLight'`.
- `untilDayOne(now)` → `{ h, m, s }` for the countdown (hours can exceed 24: show `HH:MM:SS` when under 100 h, else `D DAYS · HH:MM:SS`).
- `beatDate(beat)` → the real date of a campaign beat (`'D-42'`, `'D0 12:00'`, `'D+28'`), for news and the calendar.
- Never build "06:00" from the visitor's local date. The prototypes do this for demo purposes only.

### 4.2 First paint

An inline script in `<head>` (no dependencies) reads `Date.now()`, sets `<html data-phase="before|firstLight" data-theme="night|day">` before paint. React reads the same values; no flash, no hydration mismatch (theme-dependent markup is rendered for both themes and hidden by CSS).

### 4.3 Skew and the live flip

- After hydration, fetch `/api/now` once; `skew = server − (sent + received) / 2`; all clock reads use `Date.now() + skew`. If the corrected phase differs from the painted one, run the stripe wipe.
- If the visitor is on the page across `DAY_ONE`, one timer fires at the instant (re-armed on `visibilitychange`): the stripe wipe plays, the hero switches to First Light, the dials ignite, the Test drive buttons unlock.

### 4.4 Preview (both states, any time)

The header's sun/moon button lets any visitor see the other state: before Day One it previews First Light; after, it revisits Before Dawn. It is stored in `sessionStorage` (`hermes.preview`) and shows a small "Preview" chip next to the button while active.

- Previewing changes the theme, the hero, and the copy of locked buttons.
- **Proposed default (Decision D3):** previewing First Light before Day One also unlocks the test drive, with a "Preview · opens at 06:00 on Day One" banner on `/drive`, so the portfolio's main feature is always playable. If Oscar says no, `/drive` stays locked until `DAY_ONE` and shows the countdown.
- The prototype's "PREVIEW 06:00 →" button on the night panel is a canvas control. It is not built.

## 5. Landing

Specs: `docs/design/02-landing.md` (boards 09, 10, 22, 23).

- **Hero, Before Dawn:** night still (`public/images/hero-night.*`), outline "06:00", headline, two CTAs ("Be here at 06:00" → adds a calendar event via an `.ics` download for `DAY_ONE`; "Read the manifesto"), the night panel: 15 LEDs filling over the last six hours, `role="timer"` countdown, sealed spec rows.
- **Hero, First Light:** day still, outline "HM-27", three hotspots (desktop), "Beat the messenger" + "Explore the car", the dashboard: ignite button, 15 LEDs, five dials, HP/kW toggle. Dials sweep and settle in 2600 ms on first view (once per session), replayed by the ignite button.
- **Stripe wipe:** three stripes at 14°, 450 ms, ease-out; the theme swaps when the stripes cover the screen (49% of the ease). Reduced motion: instant swap.
- Hero stills are the LCP element: `next/image` with `priority`, AVIF + WebP at 1x/2x.
- The hero's "Drag to rotate · 360°" chip on the day board is a prototype hint; the shipped hero is a still. Drag-to-rotate is a stretch goal (§16).

## 6. Specs section

Specs: `docs/design/03-specs.md` (boards 11, 12, 24).

- A pinned section (`position: sticky`) five viewport-heights tall on desktop; scroll progress picks the chapter (`Math.floor(progress × 5)`), with a 10% hysteresis band so it doesn't flicker.
- Chapter targets: explode `[0, 1/3, 2/3, 1, 0]` (wings → halo → body, suspension, wheels → back together). Tween: ease-out cubic, `min(1500, 380 + 120 × |Δframes|)` ms with 18 frames for a full opening, 600 ms to close; text wipes in 450 ms; numbers count up over 800 ms after 150 ms.
- **Live (default when WebGL2):** `components/specs/SpecsScene` = the package's `SpecsApart` (fixed camera, `HERMES_SPEC_STAGGER`, zoom 1.28 → 1.0). Desktop hero LOD + effects; phone game LOD.
- **Fallback:** the 19 pre-rendered frames in `public/images/specs/` stacked with `mix-blend-mode: plus-lighter` inside an `isolation: isolate` box, opacity per frame as in the prototype. Used when WebGL2 is missing or `navigator.connection.saveData` is true.
- Callouts are positioned from the anchors in the spec (frame pixels, scaled with the same zoom), not guessed.
- Chapter rail: five stops with `aria-current="step"`; clicking a stop scrolls to that chapter. "Play the scroll" auto-advances every 2700 ms and stops on any user scroll.
- Phone (board 24): the car sticks to the top third; chapter text scrolls under it; the dot rail sits at the bottom; the zoom is gone by chapter 2 so the open car never crosses the screen edge.
- Reduced motion: chapters swap with a 150 ms fade, no tween, numbers shown final.

## 7. Test drive — "Beat the messenger"

Specs: `docs/design/04-test-drive.md` (boards 13–17). Rules: `.claude/rules/game.md`.

### 7.1 The circuit

- Centre line = the 120 map points `PTS` in `docs/design/prototypes/TestDrive-Lap.dc.html`, closed, Catmull-Rom (centripetal). Map units × **3.975 m** → a **3,119 m** lap. (Derived so that the messenger's speeds `SPD` integrate to exactly 71.906 s; compute the factor in code from the data, don't hard-code it.)
- Width 14 m (±7), edge lines, kerbs on apexes and exits (from curvature: |κ| above the 70th percentile), asphalt run-off to ±12 m on the outside of fast corners, walls beyond. Build it with `TrackLayout` + `trackStrip`/`trackWall` from `components/hermes/ProvingGround.tsx`.
- Start/finish and the gantry at map point 0 (the bottom straight, heading +x on the map). Sector lines where the messenger passes 19.420 s and 45.831 s (1,039.6 m and 2,079.6 m, about a third and two thirds round), so his ghost and the timing table agree by construction.

### 7.2 The messenger (ghost)

- Speeds `SPD` (km/h) at the 120 points → time-at-distance table by integrating segment length / mean speed. Sector times come out at 19.420, 26.411, 26.075 s; the lap at 71.906 s.
- Ghost pose at lap time `t`: invert the table to distance, place on the centre line (lateral offset 0), heading = tangent. Drawn with `GhostCar` (see-through, Redline edge). Hidden for the first 0.5 s after lights out and after the player finishes.

### 7.3 The car (arcade model, track-relative)

State per step: distance `s`, lateral offset `d`, heading error `ψ`, speed `v`; inputs throttle, brake, steer, overtake, boost. Starting values to tune from (all in `lib/game/tuning.ts`):

| Quantity | Start value | Note |
| --- | --- | --- |
| Mass | 800 kg | 768 kg car + driver |
| Power | 750 kW (+ Boost deploys stored energy) | from facts.md |
| Drag | `k·v²` with `k` so top speed ≈ 330 km/h | |
| Brakes | 40 m/s² at speed, 25 m/s² below 100 km/h | |
| Grip | `a_lat_max = g·(1.6 + 0.00045·v²)` | downforce grows with v² |
| Steering | yaw rate up to 1.6 rad/s at low speed, scaled by grip | |
| Off-track | run-off ×3 drag; wall = lateral stop + 30% speed loss | |
| Energy | 64% at start; harvest under braking, spend on Boost; Overtake adds 0.5 MJ when within 1 s of the messenger | from facts.md |

**Tuning target (Decision D28):** a careful lap (centre line, early braking, no Boost) lands just behind 71.906, and a clean lap on the racing line beats it by 2–5 s, so the messenger is beatable with practice. (The first target, a clean lap within ±0.4 s, made the car too hard to drive on a keyboard.) The prototype's examples are 1:11.692 (−0.214) and +0.152. Record three reference input logs in `tests/unit/game/` and keep their lap times in CI.

**As tuned (M3, `tuning.ts`):**
- Grip is the starting values × 0.7: a 60 m corner at about 102 km/h.
- Friction circle: the harder the car corners, the less drive it puts down (none at the limit), so a car held flat through a corner keeps its line. Braking is unaffected.
- Pedals and steering follow a keyboard's on/off: the brake squeezes in over 0.25 s, the throttle over 0.17 s, both let go in 0.1 s; steering at 4.5/s, back at 6/s. Brakes peak at 34 m/s² (22 below 100 km/h).
- Boost adds 160 kW, which reaches the HM‑27's 352 km/h. 0–100 km/h takes 2.6 s flat out.
- No turning standing still: the tightest turn is 7 m.
- Off the road also costs 4 m/s², and scraping along a wall 8 m/s², so neither is ever a faster line. A slow touch slides along without a hit.
- Harvest under braking is 150 kW; the store is game tuning, shown as a percentage. Overtake works once per lap.
- Reference laps (`npm run laps:record`): careful 1:12.058, clean 1:08.424 (a racing line at 97% of the limit), wall 1:09.822 with a hit.

### 7.4 Flow and HUD

Grid → five lights (1 s apart) → lights out after random 0.2–1.0 s → live lap → finish screen. The grid is 65 m behind the line, and the lap (and the messenger) start at the line: his is a flying lap (Decision D26, placeholder). HUD per board 13/16: speed dial, gear, RPM LEDs, ERS bar, Straight/Corner mode, Overtake ready, sector bars, live delta, the messenger tag over the ghost, map with both dots. Jump start (throttle before lights out) = +5 s, shown on the finish screen (**proposal**, Decision D9).

### 7.5 Finish and share

- Finish screen (boards 14, 17): headline won/lost, gap, lap, sector chips, card previews, "Share your card" / "Run it back".
- Share link: `/drive/r?lap=<ms>&s=<s1>.<s2>.<s3>&a=<attempt>[&j=1]`. Validate: integers, lap 60,000–180,000 ms, |Σs − lap| ≤ 3 ms, attempt 1–999, each key once. Invalid → 404. After a jump start, `j=1`: `lap` stays the lap as driven (its sectors add up to it) and the 5 s penalty is added to what counts (Decision D30). Codec: `lib/game/share.ts`.
- Cards (`/api/card`, Node runtime): drawn from the validated numbers only, with Michroma and Geist Mono TTFs from `assets/fonts/`, the car from `assets/card/card-car.png` (`npm run assets`), and colours read from `styles/tokens.css`. Both carry the car credit and the fictional-team line. Cached `immutable`.
- `/drive/r` renders the result (no game) with `generateMetadata` pointing OG/Twitter images to `/api/card?…&format=link`.
- "Share your card": Web Share API with the story PNG (`format=story`) when `navigator.canShare({ files })`, otherwise download + copy link. As built (M4): the share sheet on touch screens only (desktop Chrome has one too, but board 14 says a computer saves both cards and copies the link); `lib/drive/shareCard.ts`.
- As built (M4): `/drive/r` streams, so it can't set its status late; `proxy.ts` (matcher `/drive/r`) rewrites a link that doesn't parse to a path with no page, a real 404. Its metadata: the result's title (seo.md), the link card as OG/Twitter image, `noindex, follow` (every lap is its own URL).
- Best lap and attempts in `localStorage` (`hermes.drive.v1`).
- No leaderboard: a URL can be edited, and that's fine — the card is a brag, not a record.

### 7.6 Devices

Desktop: keyboard (rules file). Phone: landscape, thumb controls; portrait → rotate screen (board 15). No WebGL2 → a static screen with the messenger's lap time and a link back. Pause on blur.

As built (M3): touch screens get board 16's compact HUD and thumb pads, read by pointer so both thumbs work and one can slide between ‹ and ›. A thumb on THROTTLE can't hold BST, so a BST tap deploys Boost for 2 s, another tap adds 2 s, and braking cancels it (Decision D29). The compact HUD is also used in windows under 1000 × 500. `lib/drive/media.ts` holds the media queries; the CSS repeats them.

## 8. Pages

| Page | Board | Data |
| --- | --- | --- |
| Drivers | 25 | `content/drivers.ts` (placeholders, Decision D4); night state blacks out names until `DAY_ONE`; 3D helmets (`HermesHelmet`) over poster stills (05-drivers.md) |
| News | 26 | `content/news/*.mdx` with frontmatter `title, dek, beat, category, image`; list sorted by resolved date, newest first; filters by category |
| Team | 27 (page 1) | `content/team.ts` |
| Season 2027 | 27 (page 2) | `content/season.ts` — 24 rounds with dates, venue, sprint flag; as-of date; source links |
| Partners | 27 (page 3) | eight sealed slots until Day One; contact CTA (Decision D8) |
| Store | 27 (page 4) | three products, lookbook only, no cart (Decision D7) |
| Manifesto | 28 | `content/manifesto.ts`; night by default when `phase=before` |
| Press kit | 30 | downloads in `public/press/`; boilerplate with a copy button |

Article template (`/news/[slug]`): use the manifesto's typography (Michroma headline, Geist 18/1.65 body, max 680 px column), hero image, beat date, category, share link, next/previous.

## 9. Content model

`content/` is typed TypeScript: `launch.ts`, `nav.ts`, `copy/landing.ts`, `copy/specs.ts`, `copy/drive.ts`, `copy/pages/*.ts`, `facts.ts`, `drivers.ts`, `season.ts`, `seo.ts`, `news/*.mdx`. Copy text comes from `docs/content/copy.md`; numbers from `docs/content/facts.md`. A Vitest check asserts every number shown in `copy/specs.ts` exists in `facts.ts`.

## 10. Performance budgets

| Metric | Budget (Moto G-class phone, 4G) |
| --- | --- |
| LCP (landing) | < 2.5 s, measured with Lighthouse mobile and real (devtools) throttling (Decision D18) |
| CLS | < 0.05 |
| INP | < 200 ms |
| JS on `/` before scroll, total | < 206 KB gzipped (no three.js): the framework (Next 16 + React 19 ≈ 166 KB, measured at M0) plus the first-party budget; it catches framework growth (Decision D22) |
| JS on `/` before scroll, first-party | < 40 KB gzipped (our code: shell, clock, hero, specs; ≈ 22 KB after M2 PR 1). The guard that protects the hero |
| 3D chunk | loaded only near the specs section, on `/drive`, and on `/drivers` after the helmet stills have painted |
| Models | game 281 KB, hero 1.17 MB (desktop only), helmet 330 KB (`/drivers`, one file for all three helmets) |
| Helmet stills | 800 px WebP, ≤ 45 KB each (the messenger's 110 KB) |
| Specs fallback frames | ≤ 2.5 MB total, lazy |

Lighthouse CI on `/`, `/drive`, `/news` in GitHub Actions; fail under 90 performance on desktop. Both JS budgets on `/` are checked in CI from M6 (first-party = the chunks that aren't React, React DOM or the Next runtime).

## 11. Accessibility

WCAG 2.2 AA. Keyboard path for every control; focus visible; reduced motion everywhere (§5, §6, §7); timers announce politely; the game has a text summary at finish and a no-WebGL state; all images of the car have alt text from the spec. Automated axe checks in Playwright on every page, both themes.

## 12. SEO and metadata

`content/seo.ts` holds title, description and OG image per route (`docs/content/seo.md`). Static OG images in `public/og/`; dynamic only for `/drive/r`. `sitemap.ts`, `robots.ts`, canonical URLs from `NEXT_PUBLIC_SITE_URL`. No JSON-LD for the fictional organisation (it shouldn't look like a real company in search); `WebSite` only.

## 13. Privacy, legal, analytics

- No cookies, no accounts, no third-party requests at runtime. `localStorage`/`sessionStorage` only for the preview toggle and best lap.
- Analytics: none by default; Vercel Web Analytics (cookieless) if Oscar opts in (Decision D6). `docs/legal/privacy.md` covers both.
- Credits and the fictional-team line: `docs/legal/credits.md`, rendered on `/credits` and in every footer.

## 14. Testing and CI

- Unit (Vitest): `lib/clock` (phases around `DAY_ONE`, skew, beats), `lib/game` (circuit length, ghost table sums to 71.906, sector rounding, share codec validation, reference laps), content checks.
- E2E (Playwright): every route renders in both themes; the phase switch with a mocked clock (before → wipe → after); reduced motion; the drive flow on desktop keyboard; axe on every page.
- GitHub Actions on PRs: install, typecheck, lint, unit, build, e2e (preview URL), Lighthouse CI.

## 15. Environments and git

- `main` is the only long-lived branch, protected; work on short branches, merge by PR with CI green.
- Vercel: Production = `main`; Preview per PR. Env: `NEXT_PUBLIC_SITE_URL`, optional `NEXT_PUBLIC_ANALYTICS`.
- Domain: Decision D5.

## 16. Later (not in the milestones)

Drag-to-rotate live car in the hero · the 9:16 film cut · a second circuit · localisation (es-PR).
