import { DAY_ONE } from '@/content/launch'

/**
 * A campaign beat, written relative to Day One: "D0", "D-42" or "D−42" (U+2212), "D+28",
 * optionally with a Proving Ground time: "D0 12:00". Without a time, a beat falls at
 * DAY_ONE's time of day, so "D0" is DAY_ONE itself.
 */
export type Beat = string

const BEAT = /^D(?:([+\-−])(\d+)|0)(?: (\d{2}):(\d{2}))?$/
const ISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?([+-])(\d{2}):(\d{2})$/

function dayOneParts(iso: string) {
  const m = ISO.exec(iso)
  if (!m) throw new Error(`DAY_ONE must be an ISO date-time with an explicit offset, got "${iso}"`)
  const [, y, mo, d, hh, mm, sign, oh, om] = m
  const offsetMinutes = (sign === '-' ? -1 : 1) * (Number(oh) * 60 + Number(om))
  return { y: Number(y), mo: Number(mo), d: Number(d), hh: Number(hh), mm: Number(mm), offsetMinutes }
}

export function parseBeat(beat: Beat): { days: number; time: { hh: number; mm: number } | null } {
  const m = BEAT.exec(beat.trim())
  if (!m) throw new Error(`Not a beat: "${beat}"`)
  const [, sign, n, hh, mm] = m
  const days = sign ? (sign === '+' ? 1 : -1) * Number(n) : 0
  const time = hh ? { hh: Number(hh), mm: Number(mm) } : null
  if (time && (time.hh > 23 || time.mm > 59)) throw new Error(`Not a time: "${beat}"`)
  return { days, time }
}

/**
 * The real instant (epoch ms) of a beat. Calendar days are counted at the Proving Ground,
 * using DAY_ONE's UTC offset; tests/unit/clock checks that PROVING_GROUND_TZ keeps that
 * offset across the campaign, so this stays exact while the zone has no daylight saving.
 */
export function beatDate(beat: Beat, dayOne: string = DAY_ONE): number {
  const p = dayOneParts(dayOne)
  const { days, time } = parseBeat(beat)
  const hh = time?.hh ?? p.hh
  const mm = time?.mm ?? p.mm
  return Date.UTC(p.y, p.mo - 1, p.d + days, hh, mm) - p.offsetMinutes * 60_000
}

export function dayOneOffsetMinutes(dayOne: string = DAY_ONE): number {
  return dayOneParts(dayOne).offsetMinutes
}
