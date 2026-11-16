// What each route's link preview says and shows (ARCHITECTURE §12, seo.md: one 1200 × 630 image per
// route). Built at build time by app/**/opengraph-image.tsx from the pages' own words.

import { driveCopy } from '@/content/copy/drive'
import { beforeDawn, firstLight } from '@/content/copy/landing'
import { driversCopy } from '@/content/copy/pages/drivers'
import { manifestoCopy } from '@/content/copy/pages/manifesto'
import { newsCopy } from '@/content/copy/pages/news'
import { partnersCopy } from '@/content/copy/pages/partners'
import { pressCopy } from '@/content/copy/pages/press'
import { seasonCopy } from '@/content/copy/pages/season'
import { storeCopy } from '@/content/copy/pages/store'
import { teamCopy } from '@/content/copy/pages/team'
import { creditsCopy, privacyCopy } from '@/content/copy/pages/legal'
import type { Story } from '@/content/news/stories'
import type { OgStill } from '@/lib/card/assets'

export type OgArt =
  | { kind: 'still'; still: OgStill; credit: 'car' }
  | { kind: 'helmets'; credit: 'helmet' }
  | { kind: 'mark' }
  | { kind: 'feathers'; path: string }

export type OgPreview = {
  theme: 'night' | 'day'
  eyebrow: string
  headline: readonly string[]
  art: OgArt
  /** the image's alt text */
  alt: string
}

const ONE_FEATHER = 'M80,30 L76,46 L8,30 Z'
const TWO_FEATHERS = 'M78,22 L74,36 L10,22 Z M70,46 L67,58 L24,49 Z'

export const ogPreviews = {
  homeNight: {
    theme: 'night',
    eyebrow: beforeDawn.eyebrow,
    headline: beforeDawn.headline,
    art: { kind: 'still', still: 'car-night', credit: 'car' },
    alt: 'A message is on its way: the HM‑27 before dawn, a graphite car lit from behind by a red glow',
  },
  homeDay: {
    theme: 'day',
    eyebrow: firstLight.eyebrow,
    headline: firstLight.headline,
    art: { kind: 'still', still: 'car-day', credit: 'car' },
    alt: 'Speed is the message: the HM‑27 at first light, in the race livery',
  },
  drive: {
    theme: 'night',
    eyebrow: driveCopy.kicker,
    headline: driveCopy.headline,
    art: { kind: 'still', still: 'drive', credit: 'car' },
    alt: 'Beat the messenger: the HM‑27 on the Proving Ground straight, his ghost car ahead',
  },
  drivers: {
    theme: 'day',
    eyebrow: driversCopy.eyebrow,
    headline: driversCopy.day.headline,
    art: { kind: 'helmets', credit: 'helmet' },
    alt: 'Two seats, two names, one message: the drivers’ helmets, numbers 9 and 19',
  },
  team: {
    theme: 'day',
    eyebrow: teamCopy.eyebrow,
    headline: teamCopy.headline,
    art: { kind: 'still', still: 'drive', credit: 'car' },
    alt: 'Built for a first day: the Proving Ground at dawn',
  },
  season: { theme: 'night', eyebrow: seasonCopy.eyebrow, headline: seasonCopy.headline, art: { kind: 'mark' }, alt: '24 rounds, one first season' },
  partners: { theme: 'day', eyebrow: partnersCopy.eyebrow, headline: partnersCopy.headline, art: { kind: 'mark' }, alt: 'The people behind the message' },
  store: {
    theme: 'day',
    eyebrow: storeCopy.eyebrow,
    headline: storeCopy.headline,
    art: { kind: 'still', still: 'car-day', credit: 'car' },
    alt: 'The store opens on Day One: the 1:18 HM‑27',
  },
  news: { theme: 'night', eyebrow: 'NEWS · HERMES MOTORS', headline: newsCopy.headline, art: { kind: 'feathers', path: TWO_FEATHERS }, alt: 'News from the Proving Ground' },
  manifesto: {
    theme: 'night',
    eyebrow: manifestoCopy.eyebrow,
    headline: manifestoCopy.open.title,
    art: { kind: 'feathers', path: ONE_FEATHER },
    alt: 'We have no trophies: the manifesto',
  },
  press: {
    theme: 'day',
    eyebrow: pressCopy.eyebrow,
    headline: pressCopy.headline,
    art: { kind: 'still', still: 'exploded', credit: 'car' },
    alt: 'Press kit, Day One: the HM‑27 taken apart',
  },
  credits: { theme: 'night', eyebrow: creditsCopy.eyebrow, headline: [creditsCopy.title], art: { kind: 'mark' }, alt: 'Credits' },
  privacy: { theme: 'night', eyebrow: privacyCopy.eyebrow, headline: [privacyCopy.title], art: { kind: 'mark' }, alt: 'Privacy' },
} satisfies Record<string, OgPreview>

export type OgKey = keyof typeof ogPreviews

/** The credit lines a preview carries (docs/legal/credits.md), with the fictional-team line under them */
export const ogCredits = {
  car: driveCopy.card.credit,
  helmet: 'Driver helmet based on a model by Miopass, CC BY 4.0, modified.',
}

/** A news story's preview: its own headline and art (a still where it has one) */
export function storyPreview(story: Story): OgPreview {
  const stills: Partial<Record<string, OgStill>> = {
    '/images/hero-day-1248.webp': 'car-day',
    '/images/hero-night-1248.webp': 'car-night',
    '/images/drive.webp': 'drive',
    '/images/specs/hm27-specs-18.webp': 'exploded',
  }
  const a = story.art
  const art: OgArt =
    a.kind === 'still' && stills[a.src]
      ? { kind: 'still', still: stills[a.src]!, credit: 'car' }
      : a.kind === 'feathers'
        ? { kind: 'feathers', path: a.path }
        : { kind: 'mark' }
  return { theme: 'night', eyebrow: `NEWS · ${story.category}`, headline: story.headline, art, alt: story.title }
}
