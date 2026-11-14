// /manifesto (board 28; copy.md → Pages → Manifesto: verbatim from the brand book, as the prototype has it)

export const manifestoCopy = {
  eyebrow: 'THE MANIFESTO · HERMES MOTORS',
  open: { title: ['WE HAVE NO', 'TROPHIES.'], sub: 'No archive. No legends in the lobby.' },
  firstDay: {
    title: ['WE HAVE A FIRST DAY,', 'AND WE INTEND TO USE ALL OF IT.'],
    myth: 'Hermes was born at dawn. By midday he had invented the lyre. By evening he had outwitted Apollo. A debut team has no history to sell, only a first day.',
    /** new: the band, for screen readers */
    label: 'Day One, hour by hour',
    beats: [
      { time: '06:00', when: 'DAWN · DAY ONE', myth: 'He was born.', line: ['THE HM‑27 MEETS', 'FIRST LIGHT.'] },
      { time: '12:00', when: 'MIDDAY · DAY ONE', myth: 'He had invented the lyre.', line: ['THE TEST DRIVE', 'OPENS TO EVERYONE.'] },
      { time: 'D+28', when: 'EVENING · THE OPENER', myth: 'He had outwitted Apollo.', line: ['THE FIRST RACE,', 'BAHRAIN.'] },
    ],
  },
  build: {
    title: 'WE BUILD THE WAY HE MOVED:',
    words: [
      { word: 'PRECISELY,', line: 'Every number earned. If it is on this site, it was measured or it comes from the rules.' },
      { word: 'QUIETLY,', line: 'A rookie’s nerve, a veteran’s calm. We let the car make the noise.' },
      { word: 'QUICKLY.', line: 'Fewer words, faster laps. This page is the longest thing we will write.' },
    ],
  },
  lap: {
    title: ['WE WON’T TELL YOU', 'WHAT WE ARE.'],
    answer: ['WE’LL SHOW YOU,', 'ONE LAP AT A TIME.'],
    altDay: 'The HM‑27 in the First Light race livery',
    altNight: 'The HM‑27 before dawn, a graphite car lit from behind by a red glow',
  },
  close: {
    statement: ['SPEED IS', 'THE', 'MESSAGE.'],
    /** the CTA for the hour (copy.md) */
    night: 'Be here at 06:00',
    day: 'Beat the messenger',
  },
} as const
