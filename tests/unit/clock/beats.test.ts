import { describe, expect, it } from 'vitest'
import { DAY_ONE, PROVING_GROUND_TZ } from '@/content/launch'
import { DAY_ONE_MS, beatDate, dayOneOffsetMinutes, parseBeat } from '@/lib/clock'

const DAY = 86_400_000

function offsetMinutesAt(instant: number, timeZone: string): number {
  const name =
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(instant)
      .find((p) => p.type === 'timeZoneName')?.value ?? '' // "GMT-04:00", or "GMT" for UTC
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name)
  return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0
}

describe('beats', () => {
  it('parses every written form', () => {
    expect(parseBeat('D0')).toEqual({ days: 0, time: null })
    expect(parseBeat('D-42')).toEqual({ days: -42, time: null })
    expect(parseBeat('D−42')).toEqual({ days: -42, time: null })
    expect(parseBeat('D+28')).toEqual({ days: 28, time: null })
    expect(parseBeat('D0 12:00')).toEqual({ days: 0, time: { hh: 12, mm: 0 } })
  })

  it('rejects anything else', () => {
    for (const bad of ['', 'D', 'D+', 'D-0x', 'D28', 'D0 24:00', 'D0 12:60', 'd0']) {
      expect(() => parseBeat(bad)).toThrow()
    }
  })

  it('resolves to real instants', () => {
    expect(beatDate('D0')).toBe(DAY_ONE_MS)
    expect(beatDate('D0 12:00')).toBe(DAY_ONE_MS + 6 * 3_600_000)
    expect(beatDate('D+28')).toBe(DAY_ONE_MS + 28 * DAY)
    expect(beatDate('D−42')).toBe(DAY_ONE_MS - 42 * DAY)
  })

  it('keeps the Proving Ground offset across the whole campaign (D-60 to D+60)', () => {
    // beatDate counts days with DAY_ONE's fixed offset. If Decision D2 picks a zone with
    // daylight saving, this fails and beatDate must switch to zone-aware arithmetic.
    const offset = dayOneOffsetMinutes(DAY_ONE)
    for (let d = -60; d <= 60; d++) {
      expect(offsetMinutesAt(DAY_ONE_MS + d * DAY, PROVING_GROUND_TZ)).toBe(offset)
    }
  })
})
