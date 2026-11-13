// The 2027 calendar (docs/content/facts.md §D), as Formula 1 published it in September 2026. If the
// calendar changes, change this data and `asOf`, not the components (rules/content.md).
// tests/unit/season.test.ts checks every row against the table in facts.md.

export type Round = {
  round: number
  /** Friday and Sunday of the weekend, ISO dates */
  from: string
  to: string
  grandPrix: string
  venue: string
  sprint: boolean
}

export const season = {
  asOf: 'September 2026',
  rounds: [
    { round: 1, from: '2027-03-12', to: '2027-03-14', grandPrix: 'Bahrain', venue: 'Sakhir', sprint: true },
    { round: 2, from: '2027-03-19', to: '2027-03-21', grandPrix: 'Saudi Arabia', venue: 'Jeddah', sprint: false },
    { round: 3, from: '2027-04-02', to: '2027-04-04', grandPrix: 'Australia', venue: 'Melbourne', sprint: true },
    { round: 4, from: '2027-04-09', to: '2027-04-11', grandPrix: 'Japan', venue: 'Suzuka', sprint: true },
    { round: 5, from: '2027-04-16', to: '2027-04-18', grandPrix: 'China', venue: 'Shanghai', sprint: false },
    { round: 6, from: '2027-04-30', to: '2027-05-02', grandPrix: 'Miami', venue: 'Miami', sprint: false },
    { round: 7, from: '2027-05-21', to: '2027-05-23', grandPrix: 'Canada', venue: 'Montréal', sprint: true },
    { round: 8, from: '2027-06-04', to: '2027-06-06', grandPrix: 'Monaco', venue: 'Monte Carlo', sprint: true },
    { round: 9, from: '2027-06-18', to: '2027-06-20', grandPrix: 'Portugal', venue: 'Portimão', sprint: false },
    { round: 10, from: '2027-07-02', to: '2027-07-04', grandPrix: 'Great Britain', venue: 'Silverstone', sprint: true },
    { round: 11, from: '2027-07-09', to: '2027-07-11', grandPrix: 'Austria', venue: 'Spielberg', sprint: false },
    { round: 12, from: '2027-07-23', to: '2027-07-25', grandPrix: 'Belgium', venue: 'Spa-Francorchamps', sprint: false },
    { round: 13, from: '2027-07-30', to: '2027-08-01', grandPrix: 'Hungary', venue: 'Budapest', sprint: false },
    { round: 14, from: '2027-09-03', to: '2027-09-05', grandPrix: 'Italy', venue: 'Monza', sprint: true },
    { round: 15, from: '2027-09-10', to: '2027-09-12', grandPrix: 'Spain', venue: 'Madrid', sprint: false },
    { round: 16, from: '2027-09-24', to: '2027-09-26', grandPrix: 'Azerbaijan', venue: 'Baku', sprint: false },
    { round: 17, from: '2027-10-01', to: '2027-10-03', grandPrix: 'Türkiye', venue: 'Istanbul', sprint: false },
    { round: 18, from: '2027-10-08', to: '2027-10-10', grandPrix: 'Singapore', venue: 'Marina Bay', sprint: false },
    { round: 19, from: '2027-10-22', to: '2027-10-24', grandPrix: 'United States', venue: 'Austin', sprint: false },
    { round: 20, from: '2027-10-29', to: '2027-10-31', grandPrix: 'Mexico', venue: 'Mexico City', sprint: false },
    { round: 21, from: '2027-11-05', to: '2027-11-07', grandPrix: 'Brazil', venue: 'São Paulo', sprint: true },
    { round: 22, from: '2027-11-18', to: '2027-11-20', grandPrix: 'Las Vegas', venue: 'Las Vegas', sprint: false },
    { round: 23, from: '2027-12-03', to: '2027-12-05', grandPrix: 'Qatar', venue: 'Lusail', sprint: true },
    { round: 24, from: '2027-12-10', to: '2027-12-12', grandPrix: 'Abu Dhabi', venue: 'Yas Marina', sprint: true },
  ] satisfies Round[],
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const parts = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number)
  return { d, m: MONTHS[m - 1] }
}

/** "12–14 MAR", "30 APR–2 MAY" (board 27) */
export function roundDates(r: Round): string {
  const a = parts(r.from)
  const b = parts(r.to)
  return a.m === b.m ? `${a.d}–${b.d} ${a.m}` : `${a.d} ${a.m}–${b.d} ${b.m}`
}

/** The stats beside the intro: races, Sprint weekends, and the months the season spans */
export function seasonStats(rounds: readonly Round[] = season.rounds) {
  const month = (iso: string) => Number(iso.slice(0, 4)) * 12 + Number(iso.slice(5, 7))
  return {
    races: rounds.length,
    sprints: rounds.filter((r) => r.sprint).length,
    months: month(rounds[rounds.length - 1].to) - month(rounds[0].from) + 1,
  }
}
