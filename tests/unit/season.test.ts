import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { seasonCopy } from '@/content/copy/pages/season'
import { roundDates, season, seasonStats } from '@/content/season'
import { beatDate } from '@/lib/clock/beats'
import { DAY_ONE } from '@/content/launch'

// facts.md §D, the table: | R | Dates | Grand Prix | Venue | Sprint |
const facts = readFileSync(join(__dirname, '../../docs/content/facts.md'), 'utf8')
const table = [...facts.matchAll(/^\| (\d+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|([^|]*)\|$/gm)].map((m) => ({
  round: Number(m[1]),
  dates: m[2].trim(),
  grandPrix: m[3].trim(),
  venue: m[4].trim(),
  sprint: m[5].trim() === 'yes',
}))

describe('the 2027 season (facts.md §D)', () => {
  it('has the 24 rounds of facts.md, row for row', () => {
    expect(table).toHaveLength(24)
    season.rounds.forEach((r, i) => {
      const f = table[i]
      expect({ round: r.round, grandPrix: r.grandPrix, venue: r.venue, sprint: r.sprint }).toEqual({
        round: f.round,
        grandPrix: f.grandPrix,
        venue: f.venue,
        sprint: f.sprint,
      })
      // facts.md writes "12–14 Mar", "30 Apr–2 May"
      expect(roundDates(r)).toBe(f.dates.toUpperCase())
    })
  })

  it('counts 24 races, 10 Sprints, 10 months (board 27)', () => {
    expect(seasonStats()).toEqual({ races: 24, sprints: 10, months: 10 })
  })

  it('opens 28 days after Day One, as the tag and the intro say (D1, D10)', () => {
    // race day is the Sunday; D+28 is a date at the Proving Ground
    const raceDay = beatDate('D+28')
    expect(new Date(raceDay).toISOString().slice(0, 10)).toBe(season.rounds[0].to)
    expect(seasonCopy.opener).toContain('D+28')
    expect(DAY_ONE).toBeTruthy()
  })
})
