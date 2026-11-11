import { describe, expect, it } from 'vitest'
import { DAY_ONE_MS } from '@/lib/clock'
import { FLIP_MARGIN_MS, MAX_TIMER_MS, flipDelay } from '@/lib/clock/flip'

const DAY = 86_400_000

describe('live flip timer', () => {
  it('waits until just after DAY_ONE when it is near', () => {
    expect(flipDelay(DAY_ONE_MS - 5_000)).toBe(5_000 + FLIP_MARGIN_MS)
  })

  it('never asks setTimeout for more than 24 days (it overflows at ~24.8)', () => {
    expect(flipDelay(DAY_ONE_MS - 96 * DAY)).toBe(MAX_TIMER_MS)
    expect(MAX_TIMER_MS).toBeLessThan(2 ** 31 - 1)
  })

  it('stops once DAY_ONE has passed', () => {
    expect(flipDelay(DAY_ONE_MS)).toBeNull()
    expect(flipDelay(DAY_ONE_MS + 1)).toBeNull()
  })
})
