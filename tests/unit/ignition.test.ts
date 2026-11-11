import { describe, expect, it } from 'vitest'
import { dashboard, firstLight, hotspots } from '@/content/copy/landing'
import { hm27, rules } from '@/content/facts'
import {
  DAY_LEDS,
  dayLedsAt,
  dialReading,
  formatReading,
  ignitionPhases,
  needleAt,
  needleDeg,
  tickDashes,
  valueAt,
  type DialId,
} from '@/lib/landing/ignition'

const sum = (dashes: string) => dashes.split(' ').reduce((a, b) => a + Number(b), 0)

describe('ignition timing (11-motion: 2600 ms, sweep 42%, settle 58%)', () => {
  it('sweeps every needle to full scale, then settles on its value', () => {
    expect(needleAt(0.5, 0)).toBe(0)
    expect(needleAt(0.5, 0.42)).toBeCloseTo(1)
    expect(needleAt(0.5, 1)).toBeCloseTo(0.5)
    expect(ignitionPhases(0.2).settle).toBe(0)
    expect(ignitionPhases(1)).toEqual({ sweep: 1, settle: 1 })
  })

  it('counts the numbers up only while settling', () => {
    expect(valueAt(1006, 0.3)).toBe(0)
    expect(valueAt(1006, 0.7)).toBeGreaterThan(0)
    expect(valueAt(1006, 1)).toBe(1006)
  })

  it('lights the LEDs left to right, then drains them', () => {
    expect(dayLedsAt(0)).toBe(0)
    expect(dayLedsAt(0.42)).toBe(DAY_LEDS)
    expect(dayLedsAt(1)).toBe(0)
  })

  it('turns needles across 270° from 135°', () => {
    expect(needleDeg(0)).toBe(135)
    expect(needleDeg(1)).toBe(405)
  })
})

describe('dials', () => {
  it('read their values from facts.ts and fit their scales', () => {
    const ids: DialId[] = ['zeroToHundred', 'topSpeed', 'power', 'minMass', 'mguk']
    for (const id of ids) {
      const r = dialReading(id)
      expect(r.value / r.max, id).toBeGreaterThan(0)
      expect(r.value / r.max, id).toBeLessThan(1)
    }
    expect(dialReading('zeroToHundred').value).toBe(hm27.zeroToHundredS)
    expect(dialReading('power', 'kw').value).toBe(rules.systemPowerKw)
    expect(formatReading(1006, 0)).toBe('1,006')
    expect(formatReading(2.6, 1)).toBe('2.6')
  })

  it('tick patterns fill exactly one circle of 360 units', () => {
    expect(sum(tickDashes(5, 0.4))).toBeCloseTo(360)
    expect(sum(tickDashes(27, 0.8))).toBeCloseTo(360)
  })
})

describe('power figures are consistent (facts.md §A)', () => {
  it('750 kW = 400 kW combustion + 350 kW electric = 1,006 hp at 1.341', () => {
    expect(rules.combustionKw + rules.mgukKw).toBe(rules.systemPowerKw)
    expect(Math.round(rules.systemPowerKw * 1.341)).toBe(rules.systemPowerHp)
  })

  it('the copy shows the facts, not retyped numbers', () => {
    expect(firstLight.body).toContain(rules.systemPowerHp.toLocaleString('en-US'))
    expect(dashboard.dials.power.subHp).toBe('750 KW · 50/50')
    expect(dashboard.dials.power.subKw).toBe('≈ 1,006 HP · 50/50')
    expect(hotspots.map((h) => h.label)).toContain('750 kW POWER UNIT')
  })
})
