import { DAY_ONE } from '@/content/launch'

export type Phase = 'before' | 'firstLight'
export type Theme = 'night' | 'day'

export const DAY_ONE_MS = Date.parse(DAY_ONE)

/** Before Dawn until DAY_ONE, First Light from that instant on. */
export function phase(now: number, dayOne: number = DAY_ONE_MS): Phase {
  return now < dayOne ? 'before' : 'firstLight'
}

export function themeForPhase(p: Phase): Theme {
  return p === 'before' ? 'night' : 'day'
}

/**
 * The theme on screen: the phase's own theme, unless the visitor previews the other one
 * (ARCHITECTURE §4.4). A stored preview equal to the phase's theme means nothing.
 */
export function resolveTheme(p: Phase, preview: Theme | null): Theme {
  return preview ?? themeForPhase(p)
}

export function isPreviewing(p: Phase, preview: Theme | null): boolean {
  return preview !== null && preview !== themeForPhase(p)
}
