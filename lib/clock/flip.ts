import { DAY_ONE_MS } from './phase'

/**
 * setTimeout keeps its delay in a signed 32-bit int: anything over ~24.8 days overflows and fires
 * at once. The live flip (ARCHITECTURE §4.3) therefore waits in steps of at most 24 days.
 */
export const MAX_TIMER_MS = 24 * 86_400_000

/** A little after the instant, so the timer never lands a millisecond early. */
export const FLIP_MARGIN_MS = 25

/** How long to wait before checking the phase again; null once DAY_ONE has passed. */
export function flipDelay(now: number, dayOne: number = DAY_ONE_MS): number | null {
  const left = dayOne - now
  if (left <= 0) return null
  return Math.min(left + FLIP_MARGIN_MS, MAX_TIMER_MS)
}
