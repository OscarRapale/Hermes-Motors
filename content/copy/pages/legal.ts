// /credits and /privacy (docs/legal/credits.md, docs/legal/privacy.md). No board: the document template.
// Users never hear about sign-up or databases (Oscar, 2026-11-13).

import { CC_BY_4, carModel, factSources, helmetModel } from '@/content/credits'
import type { RichText } from '@/content/copy/shared'
import { footerCopy } from '@/content/copy/shared'

export type DocSection = {
  heading: string
  /** Paragraphs, then an optional list */
  paragraphs?: readonly RichText[]
  items?: readonly RichText[]
  /** A credit line to quote, set apart */
  quote?: RichText
}

export type DocCopy = {
  eyebrow: string
  title: string
  intro: string
  sections: readonly DocSection[]
  updated?: string
}

const OFL = 'https://openfontlicense.org'

export const creditsCopy: DocCopy = {
  eyebrow: 'CREDITS · HERMES MOTORS',
  title: 'CREDITS.',
  intro: 'Who made what you see here, and where the facts come from.',
  sections: [
    {
      heading: 'THE FICTIONAL TEAM',
      quote: [{ text: footerCopy.fictional }],
      paragraphs: [
        [
          {
            text: 'Grand Prix names and dates on the Season page are factual references to the published 2027 calendar. No logos or marks of Formula 1, the FIA, any team, sponsor or Porsche are used anywhere.',
          },
        ],
      ],
    },
    {
      heading: 'THE CAR',
      quote: [
        { text: '3D model based on ' },
        { text: '“2026 F1 CAR”', href: carModel.source },
        { text: ' by ' },
        { text: 'Abu Saif', href: carModel.author },
        { text: ', ' },
        { text: 'CC BY 4.0', href: CC_BY_4 },
        { text: ', modified.' },
      ],
      paragraphs: [
        [
          {
            text: 'Changes: rescaled to a 3,400 mm wheelbase, split into ten named parts, re-meshed into two levels of detail, re-materialled, Hermes livery and decals added.',
          },
        ],
      ],
    },
    {
      heading: 'THE HELMET',
      quote: [
        { text: 'Driver helmet based on ' },
        { text: 'a model', href: helmetModel.source },
        { text: ' by ' },
        { text: 'Miopass', href: helmetModel.author },
        { text: ', ' },
        { text: 'CC BY 4.0', href: CC_BY_4 },
        { text: ', modified.' },
      ],
      paragraphs: [
        [
          {
            text: 'Changes: every original texture removed; repainted in the Hermes livery (feathers, trim band, spoilers, number); parts regrouped; simplified from 98,724 to 37,991 triangles; rescaled to metres.',
          },
        ],
      ],
    },
    {
      heading: 'TYPEFACES',
      items: [
        [
          { text: 'Michroma', href: 'https://github.com/googlefonts/Michroma-font' },
          { text: ' by Vernon Adams. Copyright 2011 The Michroma Project Authors.' },
        ],
        [
          { text: 'Geist and Geist Mono', href: 'https://github.com/vercel/geist-font' },
          { text: ' by Vercel. Copyright 2024 The Geist Project Authors.' },
        ],
      ],
      paragraphs: [[{ text: 'Three typefaces, all under the ' }, { text: 'SIL Open Font License 1.1', href: OFL }, { text: ':' }]],
    },
    {
      heading: 'FACTS AND DATA',
      paragraphs: [[{ text: 'The 2026 rule figures and the 2027 calendar come from public sources:' }]],
      items: factSources.map((s) => [{ text: s.name, href: s.href }]),
    },
    {
      heading: 'DESIGN AND BUILD',
      // PLACEHOLDER — Decision D5: "Made by Oscar" has no link target yet.
      paragraphs: [[{ text: 'Designed and built by Oscar, with Claude.' }]],
    },
  ],
}

export const privacyCopy: DocCopy = {
  eyebrow: 'PRIVACY · HERMES MOTORS',
  title: 'PRIVACY.',
  intro: 'Hermes Motors is a fictional team and this site is a portfolio project. It collects as little as a website can.',
  sections: [
    {
      heading: 'WHAT THIS SITE KEEPS',
      items: [
        // changed from the draft (Oscar, 2026-11-13): never a word about sign-up
        [{ text: 'No accounts and no cookies. There is nothing to log in to.' }],
        [
          {
            text: 'Your browser keeps two small things, only on your device: whether you are previewing the other side of the clock (cleared when you close the tab), and your best lap and attempt count in the test drive. Clear your site data to remove them.',
          },
        ],
        [
          {
            text: 'Share links carry your lap. When you share a result, the link contains your lap and sector times, and nothing else. Anyone with the link can see those times.',
          },
        ],
        // Decision D6: no analytics
        [{ text: 'We don’t run analytics.' }],
        [
          {
            text: 'The site is served by Vercel, which keeps standard server logs (such as IP addresses) for security and operations, under ',
          },
          { text: 'Vercel’s privacy policy', href: 'https://vercel.com/legal/privacy-policy' },
          { text: '.' },
        ],
        [{ text: 'Fonts and images are served from this site; your browser doesn’t contact third parties while you browse.' }],
      ],
    },
  ],
  // PLACEHOLDER — Decision D8: the questions/contact line waits for a contact address.
  updated: 'Last updated 13 November 2026.',
}

/** The 404 (copy.md → Pages) */
export const notFoundCopy = {
  eyebrow: '404 · PROVING GROUND',
  headline: ['OFF THE', 'RACING', 'LINE.'],
  body: 'This page isn’t on the Proving Ground.',
  cta: 'Back to the start',
} as const
