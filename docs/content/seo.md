# SEO and sharing

Titles: `<page> · Hermes Motors` (home: "Hermes Motors · Speed is the message"). Descriptions ≤ 155 characters. OG images 1200 × 630 in `public/og/`, made with `tools/render` stills and the brand type; every OG image that shows the car carries the credit line in small type.

| Route | Title | Description | OG image |
| --- | --- | --- | --- |
| `/` | Hermes Motors · Speed is the message | A new Grand Prix team and its first car, the HM‑27. Revealed at 06:00 on Day One. Then race the messenger. | `og/home-night.png` before Day One, `og/home-day.png` after |
| `/drive` | Beat the messenger · Hermes Motors | One flying lap of the Proving Ground against the test driver's ghost. His time is 1:11.906. | `og/drive.png` |
| `/drive/r` | I beat the messenger by 0.214 s · Hermes Motors | (built from the result) | `/api/card?…&format=link` |
| `/manifesto` | Manifesto · Hermes Motors | We have no trophies. We have a first day, and we intend to use all of it. | `og/manifesto.png` |
| `/drivers` | Drivers · Hermes Motors | Two seats, two rookies, and a test driver nobody has named. | `og/drivers.png` |
| `/season` | Season 2027 · Hermes Motors | 24 rounds, Bahrain to Abu Dhabi: our first season, race by race. | `og/season.png` |
| `/news` | News · Hermes Motors | Every message from the Proving Ground, newest first. | `og/news.png` |
| `/news/[slug]` | `<title>` · Hermes Motors | the dek | the story's image |
| `/team` | Team · Hermes Motors | Built for a first day: precise, quietly audacious, swift. | `og/team.png` |
| `/partners` | Partners · Hermes Motors | Founding partners, sealed until Day One. | `og/partners.png` |
| `/store` | Store · Hermes Motors | Team kit and a 1:18 HM‑27. | `og/store.png` |
| `/press` | Press kit · Hermes Motors | Renders, the mark, the First Light film and the facts. | `og/press.png` |

- `robots.ts`: allow all; `sitemap.ts`: every static route plus news slugs.
- The footer on every page states the team is fictional; don't add Organization structured data (ARCHITECTURE §12).
- Social handles are placeholders until Oscar decides (footer links point to `#` for now).
