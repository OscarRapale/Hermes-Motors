import { describe, expect, it } from 'vitest'
import { lapResult } from '@/lib/game/timing'
import { parseShared, resultFromShared, shareQuery, sharedFromResult, type SharedLap } from '@/lib/game/share'

const won: SharedLap = { lapMs: 71692, sectorsMs: [19842, 26323, 25527], attempt: 4, jumpStart: false }
const q = (s: string) => parseShared(new URLSearchParams(s))

describe('the result link (ARCHITECTURE §7.5)', () => {
  it('round-trips a lap, as rules/game.md writes it', () => {
    expect(shareQuery(won)).toBe('lap=71692&s=19842.26323.25527&a=4')
    expect(q(shareQuery(won))).toEqual(won)
    // the page gets its query as a record
    expect(parseShared({ lap: '71692', s: '19842.26323.25527', a: '4' })).toEqual(won)
  })

  it('carries a jump start as j=1: the lap as driven, the 5 s on top', () => {
    const jumped = { ...won, jumpStart: true }
    expect(shareQuery(jumped)).toBe('lap=71692&s=19842.26323.25527&a=4&j=1')
    expect(q(shareQuery(jumped))).toEqual(jumped)
    expect(resultFromShared(jumped)).toMatchObject({ lapMs: 71692, penaltyMs: 5000, totalMs: 76692 })
  })

  it('comes from a finished lap, sectors adding up to it', () => {
    const r = lapResult([19.842, 46.165, 71.692], 5)
    const s = sharedFromResult(r, 4)
    expect(s).toEqual({ ...won, jumpStart: true })
    expect(resultFromShared(s)).toEqual(r)
    expect(sharedFromResult(r, 5000).attempt).toBe(999)
  })

  it('takes laps from 60 to 180 s, sectors within 3 ms of the lap, attempts 1–999', () => {
    expect(q('lap=60000&s=20000.20000.20000&a=1')).not.toBeNull()
    expect(q('lap=180000&s=60000.60000.60003&a=999')).not.toBeNull()
    expect(q('lap=59999&s=20000.20000.19999&a=1')).toBeNull()
    expect(q('lap=180001&s=60000.60000.60001&a=1')).toBeNull()
    expect(q('lap=71692&s=19842.26323.25531&a=4')).toBeNull() // 4 ms off
    expect(q('lap=71692&s=19842.26323.25527&a=0')).toBeNull()
    expect(q('lap=71692&s=19842.26323.25527&a=1000')).toBeNull()
  })

  it('refuses anything that isn’t plain integers, once each', () => {
    for (const bad of [
      'lap=71692.5&s=19842.26323.25527&a=4',
      'lap=+71692&s=19842.26323.25527&a=4',
      'lap=071692&s=19842.26323.25527&a=4',
      'lap=7e4&s=19842.26323.25527&a=4',
      'lap=71692&s=19842.26323&a=4',
      'lap=71692&s=19842.26323.25527.0&a=4',
      'lap=71692&s=0.45165.26527&a=4',
      'lap=71692&s=19842.26323.25527',
      'lap=71692&lap=71692&s=19842.26323.25527&a=4',
      'lap=71692&s=19842.26323.25527&a=4&j=2',
      'lap=71692&s=19842.26323.25527&a=4&j=1&j=1',
      'lap=<b>&s=19842.26323.25527&a=4',
      '',
    ])
      expect(q(bad), bad).toBeNull()
  })
})
