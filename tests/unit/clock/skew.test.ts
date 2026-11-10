import { describe, expect, it } from 'vitest'
import { computeSkew, parsePreview } from '@/lib/clock'

describe('computeSkew', () => {
  it('measures the device error against the midpoint of the round trip', () => {
    expect(computeSkew(1_000, 1_200, 1_100)).toBe(0)
    expect(computeSkew(1_000, 1_200, 61_100)).toBe(60_000) // device a minute slow
    expect(computeSkew(1_000, 1_200, -58_900)).toBe(-60_000) // device a minute fast
  })
})

describe('parsePreview', () => {
  it('accepts only the two themes', () => {
    expect(parsePreview('day')).toBe('day')
    expect(parsePreview('night')).toBe('night')
    expect(parsePreview('1')).toBeNull()
    expect(parsePreview(null)).toBeNull()
  })
})
