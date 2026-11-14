// The news (06-news, board 26): seven stories on the campaign's beats (10-campaign). Titles and deks from the
// prototype (Site-News.dc.html); the bodies are in ./<slug>.mdx, figures from facts.md only.
// A story is hidden until its beat, unless the visitor is previewing (Oscar, 2026-11-13).

import type { ComponentType } from 'react'

export type Category = 'CAR' | 'TEST DRIVE' | 'TEAM'

/** What a story's image area shows: a still, the mark, or feathers on a dark ground */
export type StoryArt =
  | { kind: 'still'; src: string; width: number; height: number; alt: string; fit: 'cover' | 'contain'; ground: 'drive' | 'light' | 'night' }
  | { kind: 'mark'; alt: string }
  | { kind: 'feathers'; path: string; alt: string; ground: 'graphite' | 'night' }

export type Story = {
  slug: string
  category: Category
  /** a campaign beat (lib/clock/beats): "D-42", "D0 06:00" */
  beat: string
  title: string
  /** the article's headline, in Michroma capitals (written so, not transformed) */
  headline: readonly string[]
  dek: string
  art: StoryArt
  body: () => Promise<{ default: ComponentType }>
  /** Board 26 leads with First Light ("LATEST") once it is out, though the test drive story comes later */
  featured?: boolean
}

/** Newest first */
export const stories: readonly Story[] = [
  {
    slug: 'the-test-drive-is-open',
    category: 'TEST DRIVE',
    beat: 'D0 12:00',
    title: 'Beat the messenger: the test drive is open',
    headline: ['BEAT THE', 'MESSENGER.'],
    dek: 'One lap of the Proving Ground against the test driver’s ghost. Beat 1:11.906 and the card is yours to share.',
    art: { kind: 'still', src: '/images/drive.webp', width: 1800, height: 1125, alt: 'The HM‑27 on the Proving Ground straight, the ghost car ahead', fit: 'cover', ground: 'drive' },
    body: () => import('./test-drive-open.mdx'),
  },
  {
    slug: 'inside-the-hm27',
    category: 'CAR',
    beat: 'D0 08:00',
    title: 'Every part carries the message: inside the HM‑27',
    headline: ['EVERY PART', 'CARRIES THE', 'MESSAGE.'],
    dek: 'Wings, halo, floor and wheels, one at a time. The car comes apart in five chapters on the home page.',
    art: {
      kind: 'still',
      src: '/images/specs/hm27-specs-18.webp',
      width: 1500,
      height: 751,
      alt: 'The HM‑27 taken apart: wings, halo, body and wheels lifted clear of the floor',
      fit: 'contain',
      ground: 'light',
    },
    body: () => import('./inside-the-hm27.mdx'),
  },
  {
    slug: 'first-light',
    featured: true,
    category: 'CAR',
    beat: 'D0 06:00',
    title: 'First Light. The HM‑27 is here.',
    headline: ['FIRST LIGHT.', 'THE HM‑27', 'IS HERE.'],
    dek: 'At 06:00 the HM‑27 rolled out of the dark at the Proving Ground in the First Light livery: Gallery White over carbon, the winged H on the engine cover. 1,006 horsepower, half of it electric.',
    art: { kind: 'still', src: '/images/hero-day-1248.webp', width: 1248, height: 443, alt: 'The HM‑27 at first light, in the race livery', fit: 'contain', ground: 'light' },
    body: () => import('./first-light.mdx'),
  },
  {
    slug: 'tomorrow-before-the-sun',
    category: 'TEAM',
    beat: 'D-1',
    title: 'Tomorrow, before the sun',
    headline: ['TOMORROW,', 'BEFORE', 'THE SUN.'],
    dek: 'The last post before Day One: a graphite car in the dark, and a time. 06:00 at the Proving Ground.',
    art: { kind: 'still', src: '/images/hero-night-1248.webp', width: 1248, height: 443, alt: 'The HM‑27 before dawn, lit from behind by a red glow', fit: 'contain', ground: 'night' },
    body: () => import('./tomorrow-before-the-sun.mdx'),
  },
  {
    slug: 'every-message-has-a-sender',
    category: 'TEAM',
    beat: 'D-7',
    title: 'Every message has a sender',
    headline: ['EVERY MESSAGE', 'HAS A', 'SENDER.'],
    dek: 'The winged H: two uprights, a crossbar, and three feathers at 14 degrees. Why the mark leans forward.',
    art: { kind: 'mark', alt: 'The winged H mark' },
    body: () => import('./every-message-has-a-sender.mdx'),
  },
  {
    slug: 'faster-than-the-news',
    category: 'TEAM',
    beat: 'D-28',
    title: 'It travels faster than the news',
    headline: ['IT TRAVELS', 'FASTER THAN', 'THE NEWS.'],
    dek: 'Two feathers. Wax-sealed envelopes reached a shortlist of creators, with a date and nothing else.',
    art: { kind: 'feathers', path: 'M78,22 L74,36 L10,22 Z M70,46 L67,58 L24,49 Z', alt: 'Two red feathers', ground: 'graphite' },
    body: () => import('./faster-than-the-news.mdx'),
  },
  {
    slug: 'a-message-is-on-its-way',
    category: 'TEAM',
    beat: 'D-42',
    title: 'A message is on its way',
    headline: ['A MESSAGE', 'IS ON ITS', 'WAY.'],
    dek: 'The first post: one feather on black, no logo, no name. Forty-two days to Day One.',
    art: { kind: 'feathers', path: 'M80,30 L76,46 L8,30 Z', alt: 'One red feather on black', ground: 'night' },
    body: () => import('./a-message-is-on-its-way.mdx'),
  }
]

export const categories: readonly Category[] = ['CAR', 'TEST DRIVE', 'TEAM']
