import { DAY_ONE_MS } from './phase'

export type Countdown = { h: number; m: number; s: number }

/** Time left until DAY_ONE, in whole seconds; hours can exceed 24. Zero once it has passed. */
export function untilDayOne(now: number, dayOne: number = DAY_ONE_MS): Countdown {
  const total = Math.max(0, Math.ceil((dayOne - now) / 1000))
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** `HH:MM:SS` under 100 hours, else `D DAYS · HH:MM:SS` (ARCHITECTURE §4.1). */
export function formatCountdown({ h, m, s }: Countdown): string {
  if (h < 100) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${Math.floor(h / 24)} DAYS · ${pad(h % 24)}:${pad(m)}:${pad(s)}`
}
