import { describe, expect, it } from 'vitest'
import { footerCopy } from '@/content/copy/shared'
import { messenger } from '@/content/facts'
import { formatLapTime } from '@/lib/format/lapTime'

describe('the messenger (facts.md §C)', () => {
  it('his sectors add up to his lap', () => {
    expect(messenger.sectorsMs.reduce((a, b) => a + b, 0)).toBe(messenger.lapMs)
  })

  it('is shown as 1:11.906, the figure in facts.md and copy.md', () => {
    expect(formatLapTime(messenger.lapMs)).toBe('1:11.906')
    expect(footerCopy.statusDay).toBe('TEST DRIVE OPEN · BEAT 1:11.906')
  })
})

describe('formatLapTime', () => {
  it('pads seconds and milliseconds', () => {
    expect(formatLapTime(60_000)).toBe('1:00.000')
    expect(formatLapTime(71_692)).toBe('1:11.692')
    expect(formatLapTime(125_007)).toBe('2:05.007')
    expect(formatLapTime(9_050)).toBe('0:09.050')
  })
})
