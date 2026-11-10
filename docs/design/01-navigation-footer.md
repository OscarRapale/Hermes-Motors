# 01 · Navigation and footer

Boards 09/10 (header), 20, 21 (footer), 22–24 (phone header). Screenshots `20-footer.png`, `21-footer-phone.png`.

## Header

- A glass pill floating 16 px inside the page card (desktop), 12 px (phone); min height 64 / 60 px; padding 10 px 10 px 10 px 20 px.
- Left: the winged H (42 × 28) + "HERMES" in Michroma 15 px, tracking .34em. Phone: 36 × 24 and 13 px.
- Centre (≥ 900 px): nav links, Geist 500 14 px, gap 28 px; current page underlined in Redline, 2 px, offset 7 px; `aria-current="page"`.
- Right: Store (44 px circle), the sun/moon preview button (44 px circle), Test drive (Carbon pill with a glowing Redline dot; at night before Day One a locked outline pill "Test drive opens 06:00").
- Under 900 px: wordmark, preview button, a 44 px Carbon menu button. The menu is a full-screen glass sheet (dialog): nav links at 28 px Michroma, the Test drive button, the footer's credit line; focus trapped; Escape and the close button dismiss.
- Sticky: the header stays at the top on scroll with the same glass; on `/drive` during a lap it hides (shows on pause).

## Footer

- A dark card inside the frame: Carbon by day (on the Gallery White frame), Graphite at night (on the near-black frame). Radius 32 px (28 phone), padding 44 px 56 px (30/24 phone).
- Row 1: wordmark · status chip (green dot + "TEST DRIVE OPEN · BEAT 1:11.906" by day; Redline dot + "06:00 AT THE PROVING GROUND · STREAMED LIVE" at night) · Test drive button (or locked pill).
- Row 2: "SPEED IS / THE / MESSAGE." 40 px (26 phone) + one line + social pills (Instagram, TikTok, YouTube, X as text, not logos) | four link columns (HM-27, Team, Season 2027, More). Phone: columns in a 2 × 2 grid, links 40 px tall.
- Row 3, above a 10% white rule: the model credit and the fictional-team line in Geist Mono 11.5 px #A9AEB6, links in white; right: Privacy · Credits · Made by Oscar ↗.
- An outline "HERMES" in Michroma 176 px (44 px phone) sits along the bottom edge, cut by the card, stroke white at 12–16%, `aria-hidden`.
- A soft Redline glow from the bottom right (day) or bottom centre (night).

Copy: `docs/content/copy.md` → Shared. The credit and fictional lines are required on every page.
