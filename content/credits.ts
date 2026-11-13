// Sources and licences behind the credit lines (docs/legal/credits.md). Used by the footer and /credits.

export const CC_BY_4 = 'https://creativecommons.org/licenses/by/4.0/'

export const carModel = {
  source: 'https://sketchfab.com/3d-models/2026-f1-car-2ab508a1dc614e9d9c82e29a7c05dfe2',
  author: 'https://sketchfab.com/abuhossain844',
} as const

// The helmet credit names the author and links the source, never the source's title (credits.md).
export const helmetModel = {
  source: 'https://sketchfab.com/3d-models/f1-helmet-zhouguanyu-24-1124fa1f754645d7b9d54de84009d463',
  author: 'https://sketchfab.com/miopass',
} as const

/** The public sources behind the rule figures and the calendar (docs/content/facts.md) */
export const factSources = [
  { name: 'Honda: the 2026 regulations', href: 'https://global.honda/en/F1/features/2026_Commentary/regulations/' },
  {
    name: 'Motor Sport: inside F1’s 2026 tech revolution',
    href: 'https://www.motorsportmagazine.com/special-article/f1-26-new-season-guide/6/inside-f1s-2026-tech-revolution-active-aero-50-50-hybrid-power-and-lighter-cars',
  },
  { name: 'The Race: 2026 terms explained', href: 'https://www.the-race.com/formula-1/boost-overtake-mode-active-aero-recharge-key-2026-terms-explained' },
  { name: 'FIA: how to make an F1 halo', href: 'https://www.fia.com/news/how-make-f1-halo' },
  { name: 'McLaren: the 2027 calendar', href: 'https://www.mclaren.com/racing/formula-1/2026/2027-calendar-announced/' },
  {
    name: 'Formula 1: the 2027 calendar',
    href: 'https://www.formula1.com/en/latest/article/everything-you-need-to-know-about-the-2027-f1-calendar.B8HW7bYE1DhRm4Ib1nlqT',
  },
] as const
