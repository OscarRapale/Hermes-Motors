// /team (board 27, page 1; copy.md → Pages → Team; trait lines from the prototype, Site-Pages.dc.html)

export const teamCopy = {
  eyebrow: 'TEAM · HERMES MOTORS',
  headline: ['BUILT FOR', 'A FIRST', 'DAY.'],
  intro:
    'A new Grand Prix team with one car, two rookies and no history to hide behind. We started from a blank sheet and the 2026 rules, and we let the lap times talk.',
  traitsLabel: 'How we work',
  traits: [
    { n: '01', title: 'PRECISE', body: 'Every number earned. If it is on this site, it was measured or it comes from the rules.' },
    { n: '02', title: 'QUIETLY AUDACIOUS', body: 'A rookie’s nerve, a veteran’s calm. We entered a sport with no past to lean on, on purpose.' },
    { n: '03', title: 'SWIFT', body: 'Fewer words, faster laps. We would rather show you the car than tell you about it.' },
  ],
  track: {
    eyebrow: 'OUR TRACK',
    title: ['THE PROVING', 'GROUND'],
    body: 'Where the HM‑27 first turned a wheel, and where the messenger set his lap. Open to everyone from 06:00 on Day One, one lap at a time.',
    cta: 'Take it for a lap',
    /** from the prototype */
    alt: 'The Proving Ground at dawn: the start gantry over the straight, the HM‑27 and the messenger’s ghost car ahead',
  },
} as const
