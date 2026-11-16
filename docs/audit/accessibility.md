# Accessibility audit (M6)

Standard: **WCAG 2.2 AA** (ARCHITECTURE §11). Audited 16 November 2026 on every route in both themes (Before Dawn, First Light), on desktop Chrome, Pixel 7 (Chromium) and iPhone 14 landscape (WebKit).

## What runs on every pull request

`tests/e2e/a11y.spec.ts`, plus the per-page specs:

| Check | Where | Covers |
| --- | --- | --- |
| axe, WCAG 2.0–2.2 A and AA rules | every built route, a news story, a shared lap, the 404 · both themes · all three device projects | 1.1.1, 1.3.1, 1.4.3, 2.4.x, 2.5.3, 4.1.2 and the rest of axe's WCAG set |
| One `<h1>` per page | every route | headings (axe best practice) |
| A visible focus ring at every Tab stop (2 px or more) | every route, desktop | 2.4.7, 2.4.11 |
| Reflow at 320 CSS px, no sideways scroll | every route | 1.4.10 |
| No endless animation with `prefers-reduced-motion: reduce` | every route | 2.3.3, ARCH §11 |
| Targets at least 24 × 24 px (the site aims for 44) | every button and standalone link, every route | 2.5.8 |
| Keyboard paths | skip link; phone menu (modal, focus trap, Escape, focus returns); theme preview; news filters; COPY; specs rail and Play; test drive (controls sheet, pause sheet, Escape); finish screen | 2.1.1, 2.1.2, 2.4.3 |
| Live regions | countdown (once a minute); lights; jump start; finish summary | 4.1.3 |

All of these pass. axe's best-practice rules were also run once on every page: the only finding is fixed below.

## Fixed during the build

| Where | Finding | Fix |
| --- | --- | --- |
| Specs (M2) | Dimmed headline under 3:1 where the text scrolls | `--dim-specs-scroll` (50%) |
| Specs, phones (M2) | Play button without a name; chapter 5's button under the rail | CSS order fixed; tested at the section's end |
| Test drive (M3) | Escape closed the pause sheet it had just opened | `preventDefault` on that key press |
| Thumb controls (M3) | "OT" and "BST" not part of their buttons' names (2.5.3) | "OT, Overtake", "BST, Boost for 2 seconds" |
| Pages (M5) | Dimmed middle line at 42% is 2.7:1 on the day page grey | `--dim-page` (50%, 3.4:1) |
| Store (M5) | The tee's dimmed line 2.8:1 on white | 50% |
| Test drive (M6) | No `<h1>` once the drive is open | a visually hidden "BEAT THE MESSENGER." |

## Known limits

- **The test drive needs sight and fine control.** It is a game: there is no non-visual way to drive the lap. Everything around it is accessible: the controls are listed in text (the controls sheet, the key bar), the start lights and a jump start are announced, the lap is summarised at the finish (sectors and gap), and the shared result is a normal page.
- **The 3D canvases are decoration.** The specs car, the helmets and the drive scene are `aria-hidden`; the stills beside or under them carry the alt text, so nothing is lost when WebGL is off.
- **Safari doesn't move focus to links with Tab** unless "Press Tab to highlight each item" is on (or Option+Tab). That's the browser's setting, not the site's; the keyboard checks run in Chromium.

## Manual checks for Oscar (screen readers)

These can't be automated here. About 15 minutes each.

**VoiceOver, iPhone (Safari).** Settings → Accessibility → VoiceOver.
1. Home, before Day One: swipe through the hero. You should hear the headline, the countdown ("… until first light", and an update once a minute, not every second), "Be here at 06:00" and the sealed rows.
2. Turn on the preview (the sun button, "Preview first light"). The page should become First Light, and the button should now say "Preview the site before dawn".
3. Drivers: each helmet image should describe the helmet. Before Day One the names are "Name revealed at 06:00".
4. News: the filter buttons say whether they're selected; a story opens from its title.
5. The test drive, turned sideways: the lights are announced; at the finish, the lap summary is read once.

**TalkBack, Android (Chrome).** The same five steps; also open the phone menu (it should trap focus and close with Back).

**VoiceOver, Mac (Safari).** Tab through the header and the specs rail; play the specs (Play / Pause); on the press kit, press COPY and listen for "COPIED".

Report anything that reads oddly, and where. The fix usually belongs in `content/` (the words) or a component's `aria-*`.
