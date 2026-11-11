// Shared copy: header, menu, footer (docs/content/copy.md → Shared).
// Michroma headlines are written in capitals here; "/" line breaks become arrays.

import { CC_BY_4, carModel, helmetModel } from '@/content/credits'
import { messenger } from '@/content/facts'
import { formatLapTime } from '@/lib/format/lapTime'

export const WORDMARK = 'HERMES'

export const headerCopy = {
  homeLabel: 'Hermes Motors home',
  primaryNavLabel: 'Primary',
  storeLabel: 'Store',
  menuOpen: 'Menu', // new
  menuClose: 'Close menu', // new
  menuNavLabel: 'Site', // new: the menu dialog's nav landmark
  skipLink: 'Skip to content', // new: keyboard skip link
} as const

export const previewCopy = {
  /** aria-label at night: the button previews First Light */
  toDay: 'Preview first light',
  /** aria-label by day: the button previews Before Dawn */
  toNight: 'Preview the site before dawn',
  chip: 'Preview', // new
} as const

export const testDriveCopy = {
  open: 'Test drive',
  locked: 'Test drive opens 06:00',
} as const

/** A line with inline links, rendered in order. */
export type RichText = readonly ({ text: string; href?: undefined } | { text: string; href: string })[]

export const footerCopy = {
  statement: ['SPEED IS', 'THE', 'MESSAGE.'] as const, // middle line dimmed
  lineDay: 'A Grand Prix team in its first season. Take the HM‑27 for a lap.',
  lineNight: 'A message is on its way. At 06:00 the HM‑27 meets first light, and the test drive opens.',
  statusDay: `TEST DRIVE OPEN · BEAT ${formatLapTime(messenger.lapMs)}`,
  statusNight: '06:00 AT THE PROVING GROUND · STREAMED LIVE',
  statusNightPhone: '06:00 AT THE PROVING GROUND',
  socialLabel: 'Social',
  navLabel: 'Footer',
  /** Changed from the board (copy.md): the credit now covers the helmet too. */
  credit: [
    { text: '3D models based on ' },
    { text: '“2026 F1 CAR” by Abu Saif', href: carModel.source },
    { text: ' and ' },
    { text: 'a helmet by Miopass', href: helmetModel.source },
    { text: ', both ' },
    { text: 'CC BY 4.0', href: CC_BY_4 },
    { text: ', modified.' },
  ] satisfies RichText,
  fictional:
    'Hermes Motors is a fictional team, made as a portfolio project. Not affiliated with Formula 1, the FIA, Porsche or Hermès.',
  // PLACEHOLDER — Decision D5: no link target yet, so it renders as text.
  madeBy: 'Made by Oscar ↗',
} as const
