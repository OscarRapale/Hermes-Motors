---
paths:
  - "content/**/*"
  - "docs/content/**/*"
  - "docs/legal/**/*"
  - "app/**/opengraph-image.*"
---

# Content rules

## Voice (`docs/content/voice.md`)

- Fewer words, faster laps. Short declaratives. Numbers carry the claims: "1,006 horsepower. Half of it electric." never "Unleash mind-blowing power!".
- Headlines in Michroma are written in capitals in the copy, three short lines where the design shows three, the middle line dimmed.
- Sentence case for buttons and body. Buttons say what happens: "Beat the messenger", "Be here at 06:00", "Run it back".
- "Day One", "First Light", "Before Dawn", "the Proving Ground", "the messenger" are proper names of the campaign; keep their capitals as in voice.md.

## Facts

- Every number about the car or the rules comes from `docs/content/facts.md`, which cites a source for each. If a figure you need isn't there, ask; don't invent or round differently.
- The 2027 calendar comes from `content/season.ts`, filled from the published calendar (sources in facts.md). If Formula 1 changes it, update the data and the as-of date, not the components.

## The fiction stays honest

- Hermes Motors, the HM-27, its drivers, partners, store and news are fictional. Every page keeps the footer line: "Hermes Motors is a fictional team, made as a portfolio project. Not affiliated with Formula 1, the FIA, Porsche or Hermès."
- Never use the logos or marks of Formula 1, the FIA, teams, sponsors or Porsche. Grand Prix names and dates are facts and may be used as text.
- Driver names and numbers are placeholders until Oscar confirms them (PROGRESS.md, Decisions). No faces, real or generated.
- The 3D model credit (docs/legal/credits.md) appears wherever the car does.

## Dates

- Campaign dates are written relative to Day One (D−42, D+28) in content and resolved to real dates at runtime from `DAY_ONE`. News items carry a `beat` (e.g. `"D0 12:00"`), not a hard-coded date.
