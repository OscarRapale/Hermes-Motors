import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { cardText } from '@/lib/card/cards'
import { CARD_TOKENS, paletteFrom } from '@/lib/card/palette'

const tokens = readFileSync(join(__dirname, '../../styles/tokens.css'), 'utf8')

describe('the share cards', () => {
  it('take their colours from tokens.css (next/og can’t read CSS variables), var() resolved', () => {
    const p = paletteFrom(tokens)
    expect(Object.keys(p)).toEqual(Object.keys(CARD_TOKENS))
    for (const v of Object.values(p)) expect(v).toMatch(/^(#[0-9a-f]{6}|rgba(.+))$/)
    expect(paletteFrom(':root { --carbon: #000; --redline: var(--carbon); } .x { --carbon: #fff; }'.concat(
      Object.values(CARD_TOKENS).filter((n) => n !== '--carbon' && n !== '--redline').map((n) => `${n}: #111;`).join(' '),
    )).redline).toBe('#000')
    expect(() => paletteFrom(':root { --carbon: #000; }')).toThrow(/--redline/)
  })

  it('say "beat by" when faster, "chased to" when not, the gap without a sign (copy.md)', () => {
    const won = cardText({ lapMs: 71692, sectorsMs: [19842, 26323, 25527], attempt: 4, jumpStart: false })
    expect(won).toMatchObject({ won: true, headline: ['I BEAT THE', 'MESSENGER BY'], gap: '0.214', you: 'YOU 1:11.692', messenger: 'MESSENGER 1:11.906', jumpStart: null })
    const lost = cardText({ lapMs: 72058, sectorsMs: [19701, 26311, 26046], attempt: 1, jumpStart: false })
    expect(lost).toMatchObject({ won: false, headline: ['I CHASED THE', 'MESSENGER TO'], gap: '0.152' })
  })

  it('count a jump start in the time, and say so', () => {
    const t = cardText({ lapMs: 68000, sectorsMs: [19000, 25000, 24000], attempt: 2, jumpStart: true })
    expect(t).toMatchObject({ won: false, gap: '1.094', you: 'YOU 1:13.000', jumpStart: 'INCLUDES 5 S JUMP-START PENALTY' })
  })
})
