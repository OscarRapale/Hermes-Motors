// /drivers (board 25; copy.md → Pages → Drivers). Day after 06:00 on Day One, night before.

import type { Driver } from '@/content/drivers'

export const driversCopy = {
  eyebrow: 'DRIVERS · SEASON 2027',
  day: {
    headline: ['TWO SEATS.', 'TWO NAMES.', 'ONE MESSAGE.'],
    intro: 'Two rookies for a rookie team, and a test driver nobody has named. You can race him right now.',
  },
  night: {
    headline: ['TWO SEATS.', 'NO NAMES', 'BEFORE 06:00.'],
    intro: 'The drivers are revealed at first light, with the car. Until then, their helmets wait in the dark.',
  },
  /** new: the cards, for screen readers */
  cardsLabel: 'Race drivers',
  seat: (d: Driver) => `CAR ${d.number} · ${d.nationality}`,
  seatNight: (i: number) => `CAR ${i + 1} · REVEALED AT 06:00`,
  /** new: the bars where the names will be, for screen readers */
  sealedName: 'Name revealed at 06:00',
  bioNight: 'Two seats, two names. They are revealed at first light, with the car.',
  stats: { rounds: 'ROUNDS', season: 'F1 SEASON', nationality: 'NATIONALITY' },
  first: '1st',
  none: '—',
  helmetAlt: (d: Driver) => `${d.name}'s helmet: ${d.look}, number ${d.number} on the chin, three red feathers along the side`,
  helmetAltNight: 'A helmet in the dark, its livery hidden until 06:00',
  messenger: {
    label: 'The messenger',
    eyebrow: 'TEST DRIVER · NAME WITHHELD',
    title: 'THE MESSENGER',
    day: 'He set the lap at the Proving Ground before the car was revealed, and he hasn’t said a word since. His lap is the ghost in the test drive.',
    night: 'He has already driven the HM‑27 in the dark. At 06:00 his lap becomes the ghost you race.',
    lapLabel: 'THE LAP TO BEAT · PROVING GROUND',
    cta: 'Beat the messenger',
    ctaNight: 'Opens at 06:00',
    helmetAlt: 'The messenger’s helmet: see-through, its edges and the three feathers glowing red',
  },
} as const
