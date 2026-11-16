# Launch checklist

How the site goes from "built" to "live on Day One". Work through it top to bottom. Each step says which file to change and what proves it worked.

**The site switches itself on.** At `DAY_ONE` every open page flips to First Light, and new visitors get it from the first paint. No deploy is needed at 06:00. This list covers what has to be true *before* that instant.

## 1. Close the open decisions

Each one is a placeholder in the code (`PLACEHOLDER — Decision …`) and a row in `docs/PROGRESS.md`. Change the file, run `npm run test`, open a PR, and mark the row decided.

| # | What | Where | Checks |
| --- | --- | --- | --- |
| D1, D2 | Day One date, time and zone | `content/launch.ts`: `DAY_ONE` (ISO with its UTC offset), `PROVING_GROUND_TZ`. Then set `DAY_ONE_FINAL = true` so news prints real dates instead of beats. Update the snippet in ARCHITECTURE §4.1. | `tests/unit/clock` fails if the offset doesn't match the zone at that instant. `tests/unit/season.test.ts` fails if the opener is no longer D+28 (then fix `opener` in `content/copy/pages/season.ts`). |
| D3 | Preview unlocks the drive before Day One | Already on. Say so if you want it off. | |
| D4 | Driver names and numbers | `content/drivers.ts`. If a number changes, re-render the helmet stills with `tools/render` (`docs/design/assets.md`) and run `npm run assets`. | `tests/e2e/pages.spec.ts` (drivers) |
| D5 | Domain and "Made by Oscar ↗" | The domain: §2 below. The link: `madeByHref` in `content/nav.ts` (the footer turns it into a link). Also the "Designed and built by" paragraph in `content/copy/pages/legal.ts` (credits). | |
| D7 | Store: lookbook, no cart | Already built that way. | |
| D8 | Contact target | `contactHref` in `content/nav.ts`: a `mailto:` address, or a form URL. It drives the footer "Contact", "Partner with us" and the press office button. Add the contact line to the privacy page (`content/copy/pages/legal.ts`, marked D8). | |
| — | Social handles | `socialLinks` in `content/nav.ts`. A pill with `href: '#'` goes nowhere, so delete any account you won't open. | |
| D10 | Hashtag, opener beat | The hashtag isn't printed on the site yet; it's for the campaign posts. The beat is D1's check. | |
| D11 | Where CI runs e2e | Keep the local `next start` build (recommended). Running against the Vercel preview needs a protection-bypass secret. | |
| D28 | Test drive difficulty | Play it on a phone and a keyboard. Tuning: `lib/game/tuning.ts`. | `tests/unit/game` (the three reference laps) |

## 2. Vercel

Project: `hermes-motors`, production at https://hermes-motors.vercel.app.

- **Settings → Build:** framework Next.js, Node 22.x, default build command. Production branch `main`, a preview per pull request.
- **Environment variables:** the only one is `NEXT_PUBLIC_SITE_URL` (`.env.example`). Leave it unset while there's no domain: the site uses the `*.vercel.app` address. No analytics (D6), so nothing else.
- **With a domain (D5):**
  1. Settings → Domains → add it, and add the DNS records Vercel shows at the registrar. Redirect `www` to the bare domain, or the other way, but pick one.
  2. Set `NEXT_PUBLIC_SITE_URL=https://<domain>` for Production. It is baked in at build time, so **redeploy** `main` afterwards.
  3. Check that the canonical address, `/sitemap.xml`, `/robots.txt` and a shared lap's link preview all show the new domain.
- **Deployment protection:** previews ask for a Vercel login by default. To test a preview on a phone that isn't signed in, use a shareable link from the deployment page.

## 3. Cross-browser run

CI runs desktop Chrome, Pixel 7 and iPhone 14 landscape on every PR. Before the real-device pass, run the same suite in desktop Firefox and Safari (WebKit):

```bash
npx playwright install firefox webkit   # once
npm run e2e:engines
```

Tests that need Chromium (clipboard permissions, the Tab-order sweep) skip themselves in the other engines.

## 4. Launch rehearsal on a preview

Do this once, about a week before Day One, so you see the live flip on real devices:

1. On a throwaway branch, set `DAY_ONE` in `content/launch.ts` to about 15 minutes from now (with the Proving Ground offset). Push it. Don't merge it.
2. Open the Vercel preview on a phone and a computer, before Dawn: night hero, countdown, locked Test drive.
3. Watch the instant: the stripe wipe plays, the hero turns to First Light, the dials ignite, Test drive unlocks, and the 06:00 news story appears.
4. Reload: no flash of the night theme. Turn on "Reduce motion" on one device: the theme swaps without the wipe.
5. Close the PR and delete the branch.

## 5. Real devices

On each device: **iPhone (Safari), Android (Chrome), Mac (Safari), Windows (Edge or Chrome), Firefox.** Cross out what passes; note anything else with the device, the browser and a screenshot.

**Every page**
- [ ] Night and day (use the sun/moon button): no unreadable text, nothing cut off, no sideways scroll.
- [ ] Phone menu: opens, closes with the close button and Back/Escape, links work.
- [ ] The footer credit and the fictional-team line are there.

**Home**
- [ ] The hero still loads first and sharp. The countdown ticks, and the LEDs too.
- [ ] "Be here at 06:00" opens the `.ics` in Apple or Google Calendar at the right local time.
- [ ] Specs: the car pins and comes apart while scrolling, the rail jumps to chapters, Play runs and pauses them. Turned sideways and back: still lined up.

**Test drive**
- [ ] Desktop: the controls sheet on the first visit, the keys (W/↑/Right Shift, S/↓/Right Ctrl, A D/← →, E Boost), pause on Escape.
- [ ] Phone: the rotate screen when upright, the thumb pads and BST in landscape, vibration on Android.
- [ ] A jump start adds 5 s and says so. A full lap reaches the finish screen.
- [ ] Share: the share sheet on phones (try Messages and WhatsApp), the two PNGs and the copied link on a computer.
- [ ] The shared link opens `/drive/r` with the card as its preview in Messages, WhatsApp, Slack, X and LinkedIn.

**Pages**
- [ ] Drivers: the stills appear first, then the helmets turn.
- [ ] News: the filters, a story, the back link. Press kit: the zip downloads (8.4 MB) and opens; COPY copies.
- [ ] A wrong address shows the 404.

**Slow network** (DevTools, "Slow 4G", or a phone on mobile data): the hero is readable within about 2.5 s, and the 3D never holds up scrolling.

**Screen readers:** the script in `docs/audit/accessibility.md`.

## 6. The week before

- [ ] Every row in §1 is decided, or knowingly kept as a placeholder. `DAY_ONE_FINAL` is `true` only if D1 is final.
- [ ] `main` is green and deployed; the production URL shows Before Dawn with the right countdown.
- [ ] Freeze: from the day before, merge fixes only.

## 7. Day One

- [ ] 05:55 Proving Ground time: production open on a phone and a computer.
- [ ] 06:00: the flip happens by itself. Nothing to deploy.
- [ ] 06:05: a fresh visit (private window) opens in First Light, Test drive is open, the 06:00 story is on `/news`.
- [ ] Post the launch with a lap of your own: a `/drive/r` link shows its card.

If something is wrong at 06:00, fix it on a branch and merge as usual. The time lives in `content/launch.ts` only, so a fix never has to move the clock.
