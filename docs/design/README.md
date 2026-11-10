# Design handoff

The designs live on a Claude Design canvas ("Hermes Motors — Visual Directions"), 40 boards across 8 pages. This folder is the build's copy: numbered specs, a screenshot of every board and state, and each board's prototype source.

## How to read it

- **Specs** (`NN-*.md`) describe each screen: layout, states, interactions, motion, accessibility, data, and what differs from the prototype on purpose.
- **Screenshots** (`screenshots/NN-…png`) are the visual truth at 1x (desktop 1440 wide) or 2x (phone 390 wide). Compare your build to them side by side.
- **Prototypes** (`prototypes/*.dc.html`) are the boards' source: an HTML template with `{{holes}}` and a `class Component` whose `renderVals()` holds the logic and data. They don't run outside the canvas, but every measurement, colour, string and formula is in there. Read them for exact values; don't copy their code structure.
- **Assets** (`assets.md`) lists every image and model, where it lives in `public/`, and how it was made.
- When a spec says **Prototype only**, the board does something for demonstration that the site must not do (the clearest case: the prototypes count down to 06:00 on the viewer's clock; the site counts to `DAY_ONE`).

## Board index

| # | Board | Spec | Route / area | States in screenshots |
| --- | --- | --- | --- | --- |
| 01–05 | Brand book: Platform, Mark, Identity system, Livery, Debut campaign | 00-tokens, 10-campaign | reference | one each |
| 06–08 | The car: First light & Before dawn, Drawing to car, Built in parts | 03-specs | reference | one each |
| 09 | Landing — Before Dawn | 02-landing | `/` hero | night |
| 10 | Landing — First Light | 02-landing | `/` hero | day, dials settled |
| 11 | Specs — the car comes apart | 03-specs | `/` specs | chapters 1–5 |
| 12 | Specs — storyboard and motion notes | 03-specs, 11-motion | reference | one |
| 13 | Test drive — the lap | 04-test-drive | `/drive` | mid-lap snapshot |
| 14 | Test drive — finish and share card | 04-test-drive | `/drive` finish | won, lost |
| 15 | Phone — turn sideways | 04-test-drive | `/drive` portrait | one |
| 16 | Phone — the lap | 04-test-drive | `/drive` landscape | one |
| 17 | Phone — finish and share | 04-test-drive | `/drive` finish | won, lost |
| 18 | Day One — rollout calendar | 10-campaign | campaign | one |
| 19 | Day One — one post per beat | 10-campaign | social | one |
| 20 | Footer, both themes | 01-navigation-footer | every page | day + night |
| 21 | Footer on a phone | 01-navigation-footer | every page | day + night |
| 22 | Phone — landing before dawn | 02-landing | `/` | night |
| 23 | Phone — landing at first light | 02-landing | `/` | day |
| 24 | Phone — specs | 03-specs | `/` specs | chapters 1–5 |
| 25 | Drivers | 05-drivers | `/drivers` | day, night |
| 26 | News | 06-news | `/news` | all stories |
| 27 | Team, Season 2027, Partners, Store | 07-pages | four routes | one per page |
| 28 | The manifesto | 08-manifesto | `/manifesto` | night, day |
| 29 | Day One — stories, 9:16 | 10-campaign | social | one |
| 30 | Press kit | 09-press-kit | `/press` | one |

Boards from the explorations (Drafts A, B, C) are on the canvas for the case study only; don't build from them.

## Specs

`00-tokens.md` · `01-navigation-footer.md` · `02-landing.md` · `03-specs.md` · `04-test-drive.md` · `05-drivers.md` · `06-news.md` · `07-pages.md` · `08-manifesto.md` · `09-press-kit.md` · `10-campaign.md` · `11-motion.md` · `assets.md`
