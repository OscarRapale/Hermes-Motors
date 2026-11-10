import { describe, expect, it } from 'vitest'
import { DAY_ONE, PROVING_GROUND_TZ } from '@/content/launch'
import { DAY_ONE_MS, isPreviewing, phase, resolveTheme, themeForPhase } from '@/lib/clock'

describe('phase', () => {
  it('DAY_ONE is one valid instant with an explicit offset', () => {
    expect(Number.isFinite(DAY_ONE_MS)).toBe(true)
    expect(DAY_ONE).toMatch(/[+-]\d{2}:\d{2}$/)
    expect(PROVING_GROUND_TZ).toBeTruthy()
  })

  it('is Before Dawn until the instant and First Light from it', () => {
    expect(phase(DAY_ONE_MS - 1)).toBe('before')
    expect(phase(DAY_ONE_MS)).toBe('firstLight')
    expect(phase(DAY_ONE_MS + 1)).toBe('firstLight')
  })

  it('is 06:00 at the Proving Ground, the same instant for every visitor', () => {
    const local = new Intl.DateTimeFormat('en-GB', {
      timeZone: PROVING_GROUND_TZ,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(DAY_ONE_MS)
    expect(local).toBe('06:00')
  })
})

describe('theme and preview', () => {
  it('maps each phase to its theme', () => {
    expect(themeForPhase('before')).toBe('night')
    expect(themeForPhase('firstLight')).toBe('day')
  })

  it('previews the other state only', () => {
    expect(resolveTheme('before', null)).toBe('night')
    expect(resolveTheme('before', 'day')).toBe('day')
    expect(resolveTheme('firstLight', 'night')).toBe('night')
    expect(isPreviewing('before', 'day')).toBe(true)
    expect(isPreviewing('before', 'night')).toBe(false)
    expect(isPreviewing('firstLight', 'day')).toBe(false)
    expect(isPreviewing('firstLight', null)).toBe(false)
  })
})
