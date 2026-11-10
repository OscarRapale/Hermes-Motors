import { describe, expect, it } from 'vitest'
import { DAY_ONE_MS, formatCountdown, untilDayOne } from '@/lib/clock'

const H = 3_600_000

describe('untilDayOne', () => {
  it('splits the time left into h, m, s with hours past 24', () => {
    expect(untilDayOne(DAY_ONE_MS - (30 * H + 4 * 60_000 + 5_000))).toEqual({ h: 30, m: 4, s: 5 })
  })

  it('rounds partial seconds up so it reaches 00:00:00 exactly at the instant', () => {
    expect(untilDayOne(DAY_ONE_MS - 1)).toEqual({ h: 0, m: 0, s: 1 })
    expect(untilDayOne(DAY_ONE_MS)).toEqual({ h: 0, m: 0, s: 0 })
  })

  it('never goes negative', () => {
    expect(untilDayOne(DAY_ONE_MS + 10 * H)).toEqual({ h: 0, m: 0, s: 0 })
  })
})

describe('formatCountdown', () => {
  it('shows HH:MM:SS under 100 hours', () => {
    expect(formatCountdown({ h: 5, m: 59, s: 42 })).toBe('05:59:42')
    expect(formatCountdown({ h: 99, m: 59, s: 59 })).toBe('99:59:59')
  })

  it('shows D DAYS · HH:MM:SS from 100 hours', () => {
    expect(formatCountdown({ h: 100, m: 0, s: 0 })).toBe('4 DAYS · 04:00:00')
    expect(formatCountdown({ h: 24 * 96 + 7, m: 3, s: 9 })).toBe('96 DAYS · 07:03:09')
  })
})
