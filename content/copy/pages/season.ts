// /season (board 27, page 2; copy.md → Pages → Season 2027). The rounds are in content/season.ts.

export const seasonCopy = {
  eyebrow: 'SEASON 2027 · OUR DEBUT',
  headline: ['24 ROUNDS.', 'ONE FIRST', 'SEASON.'],
  intro:
    'Bahrain in March to Abu Dhabi in December, with ten Sprint weekends on the way. Day One is 28 days before the first race.',
  stats: { races: 'RACES', sprints: 'SPRINTS', months: 'MONTHS' },
  /** new: the stats and the grid, for screen readers */
  statsLabel: 'The season in numbers',
  gridLabel: 'The 2027 calendar',
  round: (n: number) => `R${String(n).padStart(2, '0')}`,
  /** new: "Round 1, 12–14 March" reads better than "R01" */
  roundLabel: (n: number) => `Round ${n}`,
  sprint: 'SPRINT',
  /** the opener is D+28 (a campaign beat; tests/unit/season.test.ts checks it against DAY_ONE) */
  opener: 'OPENER · D+28',
  finale: 'FINALE',
  note: 'Dates as Formula 1 published them in September 2026. Bahrain and Abu Dhabi weekends open and close the season; the race calendar can still change.',
} as const
