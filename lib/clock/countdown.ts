import { DAY_ONE_MS } from './phase'

export type Countdown = { h: number; m: number; s: number }

/** Time left until DAY_ONE, in whole seconds; hours can exceed 24. Zero once it has passed. */
export function untilDayOne(now: number, dayOne: number = DAY_ONE_MS): Countdown {
  const total = Math.max(0, Math.ceil((dayOne - now) / 1000))
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 }
}

const pad = (n: number) => String(n).padStart(2, '0')

export const LONG_COUNTDOWN_HOURS = 100

/**
 * What the night panel shows (Decision D17): under 100 hours one `HH:MM:SS` line; from 100 hours
 * the days on their own line over the remaining `HH:MM:SS`.
 */
export function countdownView({ h, m, s }: Countdown): { days: number | null; hh: string; mm: string; ss: string } {
  const long = h >= LONG_COUNTDOWN_HOURS
  return { days: long ? Math.floor(h / 24) : null, hh: pad(long ? h % 24 : h), mm: pad(m), ss: pad(s) }
}

export const LED_COUNT = 15
export const LED_FILL_MS = 6 * 3_600_000

/** Night panel: the 15 LEDs fill over the last 6 hours before DAY_ONE. */
export function ledsLit(msLeft: number): number {
  const fraction = Math.min(1, Math.max(0, 1 - msLeft / LED_FILL_MS))
  return Math.round(LED_COUNT * fraction)
}

/** `HH:MM:SS` under 100 hours, else `D DAYS · HH:MM:SS` (ARCHITECTURE §4.1). */
export function formatCountdown({ h, m, s }: Countdown): string {
  if (h < 100) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${Math.floor(h / 24)} DAYS · ${pad(h % 24)}:${pad(m)}:${pad(s)}`
}
