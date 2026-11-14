// The race drivers (Decision D4: PLACEHOLDER names and numbers, fictional; helmets only, no faces).
// The helmet stills carry 9 and 19: if the numbers change, re-render them (rules/three.md).

export type Driver = {
  number: string
  first: string
  last: string
  /** As in a sentence (alt text) */
  name: string
  nationality: string
  bio: string
  /** HermesHelmet look (HELMET_LIVERIES) and which way the helmet faces on its card */
  livery: 'gallery' | 'graphite'
  facing: 'right' | 'left'
  /** the card: Gallery White or Carbon (board 25) */
  card: 'light' | 'dark'
  /** the helmet's colours, for its alt text (copy.md → Drivers) */
  look: string
}

export const drivers: readonly Driver[] = [
  {
    number: '9',
    first: 'LENA',
    last: 'BRANDT',
    name: 'Lena Brandt',
    nationality: 'GER',
    bio: 'Came up through junior single-seaters in Europe and two seasons as a simulator driver. Her first Grand Prix season starts at the Hermes debut.',
    livery: 'gallery',
    facing: 'right',
    card: 'light',
    look: 'white with black trim',
  },
  {
    number: '19',
    first: 'MATEO',
    last: 'RÍOS',
    name: 'Mateo Ríos',
    nationality: 'PUR',
    bio: 'Karting champion in Puerto Rico before a move to Europe at sixteen. He shares the debut season, and the garage, with Lena.',
    livery: 'graphite',
    facing: 'left',
    card: 'dark',
    look: 'graphite with white trim',
  },
]
