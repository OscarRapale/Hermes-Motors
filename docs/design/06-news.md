# 06 · News

Board 26 (filters work). Prototype `Site-News.dc.html`. Data `content/news/*.mdx`.

- **Hero:** "NEWS · N STORIES", "NEWS FROM / THE PROVING / GROUND.", one line on the right.
- **Filters:** pills (All, Car, Test drive, Team) with counts in mono; the active one is Carbon; `aria-pressed`. Only categories with stories show.
- **Featured** (latest story; shown for All and its own category): a wide card, image 58% (the day car on a light radial with the grid), "LATEST" Redline chip, meta "CAR · DAY ONE · 06:00", Michroma 34 px title, dek, "Read the story" with a Carbon arrow circle.
- **Grid:** three columns, cards with a 250 px image area and meta (category in red-on-light, date), 21 px semibold title, dek. Image areas use the renders, or the mark and feathers on Carbon for the tease stories.
- **Dates:** each story has a `beat` ("D0 12:00", "D−7"). Before `DAY_ONE` is final the site prints the beat; after, it prints the real date (`beatDate`). Stories whose beat is in the future are hidden.
- **Article** (`/news/[slug]`): the manifesto's typography (08-manifesto), image, meta, body at 18/1.65 in a 680 px column, next/previous.
- Seven stories at launch (titles and deks in the prototype's `all` array plus the featured First Light story).
