// Site navigation (ARCHITECTURE §3, docs/content/copy.md → Shared).
// Routes from later milestones are linked now and 404 until they are built.

export type NavLink = { label: string; href: string }

/**
 * Routes that exist today. Next prefetches links in view; links to routes from later milestones
 * (M3, M5) skip that, so production logs no 404s. Add a route here when its page lands.
 */
export const BUILT_ROUTES: ReadonlySet<string> = new Set(['/', '/drive', '/credits', '/privacy', '/team', '/season', '/partners', '/store', '/drivers', '/news'])
export const prefetchFor = (href: string): false | undefined =>
  BUILT_ROUTES.has(href.split('#')[0] || '/') ? undefined : false

/** Header nav, in board order. HM-27 points at the specs section on the landing page. */
export const primaryNav: readonly NavLink[] = [
  { label: 'Team', href: '/team' },
  { label: 'HM-27', href: '/#specs' },
  { label: 'Drivers', href: '/drivers' },
  { label: 'Season 2027', href: '/season' },
  { label: 'Partners', href: '/partners' },
  { label: 'News', href: '/news' },
]

export const storeHref = '/store'
/** Specs chapters on the landing page (the ids are set in M2). */
export const specsChapterHref = (chapter: number) => `/#specs-${chapter}`
export const driveHref = '/drive'
// PLACEHOLDER — Decision D8 (press office / partners contact): no target yet. Footer Contact, Partner with us,
// Write to us all point here until Oscar gives an address or asks for a form.
export const contactHref = '#'

export type NavColumn = { heading: string; links: readonly NavLink[] }

export const footerColumns: readonly NavColumn[] = [
  {
    heading: 'HM-27',
    links: [
      { label: 'The car', href: '/' },
      { label: 'Specs', href: '/#specs' },
      { label: 'Test drive', href: driveHref },
    ],
  },
  {
    heading: 'TEAM',
    links: [
      { label: 'About', href: '/team' },
      { label: 'Drivers', href: '/drivers' },
      { label: 'Manifesto', href: '/manifesto' },
    ],
  },
  {
    heading: 'SEASON 2027',
    links: [
      { label: 'Calendar', href: '/season' },
      { label: 'News', href: '/news' },
      { label: 'Press kit', href: '/press' },
    ],
  },
  {
    heading: 'MORE',
    links: [
      { label: 'Partners', href: '/partners' },
      { label: 'Store', href: storeHref },
      { label: 'Contact', href: contactHref },
    ],
  },
]

// PLACEHOLDER — social handles are undecided (docs/content/seo.md: footer links point to "#").
export const socialLinks: readonly NavLink[] = [
  { label: 'INSTAGRAM', href: '#' },
  { label: 'TIKTOK', href: '#' },
  { label: 'YOUTUBE', href: '#' },
  { label: 'X', href: '#' },
]

export const legalLinks: readonly NavLink[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Credits', href: '/credits' },
]
