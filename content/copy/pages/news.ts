// /news and /news/[slug] (board 26; copy.md → Pages → News)

export const newsCopy = {
  /** "NEWS · 7 STORIES" (count from data) */
  eyebrow: (n: number) => `NEWS · ${n} ${n === 1 ? 'STORY' : 'STORIES'}`,
  headline: ['NEWS FROM', 'THE PROVING', 'GROUND.'],
  intro: 'Every message we have sent, newest first. Short, factual, on time.',
  filters: { ALL: 'All', CAR: 'Car', 'TEST DRIVE': 'Test drive', TEAM: 'Team' },
  /** new: the filters' group name */
  filtersLabel: 'Filter stories',
  latest: 'LATEST',
  read: 'Read the story',
  /** new: the grid's name */
  gridLabel: 'Stories',
  /** new (Oscar, 2026-11-13): before the first beat, without preview */
  empty: {
    title: 'THE FIRST MESSAGE IS ON ITS WAY.',
    body: (date: string) => `The first story arrives on ${date}. Preview first light with the sun button to read them all now.`,
  },
  article: {
    back: 'All news',
    /** new */
    copy: 'Copy link',
    copied: 'Link copied',
    previous: 'Previous story',
    next: 'Next story',
    /** new: the newer and older stories, for screen readers */
    pager: 'More stories',
  },
} as const
