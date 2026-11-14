// /store (board 27, page 4; copy.md → Pages → Store). A lookbook, no cart (Decision D7).

export const storeCopy = {
  eyebrow: 'STORE · TEAM KIT',
  headline: ['THE STORE', 'OPENS ON', 'DAY ONE.'],
  intro: 'Team kit and a 1:18 HM‑27, released at 06:00 with the car. Three pieces to start; more as the season runs.',
  /** new: the tiles, for screen readers */
  label: 'Team kit',
  products: [
    {
      n: '01 · SCALE MODEL',
      title: 'HM‑27 · 1:18',
      body: 'Die-cast, First Light livery, 31 cm long.',
      alt: 'The HM‑27 scale model in the First Light livery',
    },
    {
      n: '02 · CAP',
      title: 'TEAM CAP',
      body: 'Carbon, with the winged H embroidered in white and Redline.',
      alt: 'The winged H, embroidered on the cap',
    },
    {
      n: '03 · TEE',
      title: 'MESSENGER TEE',
      body: 'Gallery White, the line from the brand printed on the back.',
      alt: 'Printed on the back: Speed is the message.',
    },
  ],
  /** the line printed on the tee (the brand's statement) */
  tee: ['SPEED IS', 'THE', 'MESSAGE.'],
  /** before Day One / after (new, Decision D7) */
  opens: 'OPENS 06:00 · DAY ONE',
  lookbook: 'LOOKBOOK · NOT FOR SALE',
} as const
