import { describe, expect, it } from 'vitest'
import { resultView } from '@/lib/drive/result'

// The prototype's two laps (board 14 won, board 17 lost)
const won = resultView({ lapMs: 71692, sectorsMs: [19842, 26323, 25527], attempt: 4, jumpStart: false })
const lost = resultView({ lapMs: 72058, sectorsMs: [19701, 26311, 26046], attempt: 4, jumpStart: false })

describe('the finish (boards 14, 17)', () => {
  it('says who won, by how much, sector by sector', () => {
    expect(won).toMatchObject({ won: true, headline: ['YOU BEAT THE', 'MESSENGER.'], gap: '−0.214', you: '1:11.692', his: '1:11.906' })
    expect(won.sectors).toEqual([
      { name: 'S1', you: '19.842', his: '19.420', gap: '+0.422', state: 'slower' },
      { name: 'S2', you: '26.323', his: '26.411', gap: '−0.088', state: 'faster' },
      { name: 'S3', you: '25.527', his: '26.075', gap: '−0.548', state: 'faster' },
    ])
    expect(lost).toMatchObject({ won: false, headline: ['THE MESSENGER', 'HOLDS ON.'], gap: '+0.152' })
    expect(lost.sectors.map((s) => s.gap)).toEqual(['+0.281', '−0.100', '−0.029'])
  })

  it('sums it up in one sentence, with the figures (D30)', () => {
    expect(won.summary).toBe(
      "Your lap: 1:11.692. The test driver's: 1:11.906. You lost 0.422 s in sector 1 and gained 0.636 s in sectors 2 and 3.",
    )
    const allFaster = resultView({ lapMs: 70000, sectorsMs: [19000, 26000, 25000], attempt: 1, jumpStart: false })
    expect(allFaster.summary).toContain('You gained 1.906 s in sectors 1, 2 and 3.')
    const jumped = resultView({ lapMs: 70000, sectorsMs: [19000, 26000, 25000], attempt: 1, jumpStart: true })
    expect(jumped).toMatchObject({ won: false, you: '1:15.000', gap: '+3.094' })
    expect(jumped.summary).toMatch(/It includes the 5 s jump-start penalty\.$/)
  })

  it('reads the result to a screen reader once, sector by sector', () => {
    expect(won.live).toBe(
      'Lap complete. 1:11.692, 0.214 seconds faster than the messenger. Sector 1 slower by 0.422. Sector 2 faster by 0.088. Sector 3 faster by 0.548.',
    )
  })

  it('shares the link and says what the card says', () => {
    expect(won.query).toBe('lap=71692&s=19842.26323.25527&a=4')
    expect(won.said).toBe('I beat the messenger by 0.214 s')
    expect(lost.shareText).toBe('I chased the messenger to 0.152 s at the Proving Ground.')
  })
})
