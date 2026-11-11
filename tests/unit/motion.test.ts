import { describe, expect, it } from 'vitest'
import { easeOut, parseCssTime } from '@/lib/motion'

describe('parseCssTime', () => {
  it('reads both units, including the minifier’s ".45s"', () => {
    expect(parseCssTime('450ms', 0)).toBe(450)
    expect(parseCssTime(' .45s', 0)).toBe(450)
    expect(parseCssTime('0.45s', 0)).toBe(450)
    expect(parseCssTime('2.6s', 0)).toBe(2600)
  })

  it('falls back on anything else', () => {
    expect(parseCssTime('', 450)).toBe(450)
    expect(parseCssTime('fast', 450)).toBe(450)
  })
})

describe('easeOut', () => {
  it('is the cubic ease-out', () => {
    expect(easeOut(0)).toBe(0)
    expect(easeOut(1)).toBe(1)
    expect(easeOut(0.5)).toBeCloseTo(0.875)
  })
})
