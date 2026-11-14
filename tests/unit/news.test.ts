import { describe, expect, it } from 'vitest'
import { categories, stories } from '@/content/news/stories'
import { beatDate } from '@/lib/clock/beats'
import { featured, filterCounts, firstBeat, storyDate, visibleStories } from '@/lib/news'

const DAY_ONE = '2027-02-14T06:00:00-04:00'

describe('the news (06-news)', () => {
  it('has seven stories, newest first, on the campaign beats', () => {
    expect(stories).toHaveLength(7)
    const times = stories.map((s) => beatDate(s.beat, DAY_ONE))
    expect([...times].sort((a, b) => b - a)).toEqual(times)
    expect(new Set(stories.map((s) => s.slug)).size).toBe(7)
  })

  it('prints the beat until Day One is final, then the date at the Proving Ground', () => {
    expect(storyDate('D-42', false)).toBe('D−42')
    expect(storyDate('D0 06:00', false)).toBe('DAY ONE · 06:00')
    expect(storyDate('D0 12:00', true, DAY_ONE)).toBe('14 FEB 2027 · 12:00')
    expect(storyDate('D-42', true, DAY_ONE)).toBe('3 JAN 2027')
  })

  it('shows a story from its beat on, every story while previewing', () => {
    const at = (beat: string) => beatDate(beat, DAY_ONE)
    expect(visibleStories(stories, at('D-43'), false, DAY_ONE)).toEqual([])
    expect(visibleStories(stories, at('D-42'), false, DAY_ONE).map((s) => s.beat)).toEqual(['D-42'])
    expect(visibleStories(stories, at('D0 07:00'), false, DAY_ONE).map((s) => s.beat)).toEqual(['D0 06:00', 'D-1', 'D-7', 'D-28', 'D-42'])
    expect(visibleStories(stories, at('D-43'), true, DAY_ONE)).toHaveLength(7)
    expect(firstBeat(stories, DAY_ONE)).toBe(at('D-42'))
  })

  it('leads with First Light once it is out (board 26), else the newest; under All and its category', () => {
    const all = visibleStories(stories, 0, true, DAY_ONE)
    expect(featured(all, 'ALL')?.slug).toBe('first-light')
    expect(featured(all, 'CAR')?.slug).toBe('first-light')
    expect(featured(all, 'TEAM')).toBeNull()
    expect(featured(visibleStories(stories, beatDate('D-7', DAY_ONE), false, DAY_ONE), 'ALL')?.slug).toBe('every-message-has-a-sender')
    expect(filterCounts(all, categories)).toEqual([
      { key: 'ALL', n: 7 },
      { key: 'CAR', n: 2 },
      { key: 'TEST DRIVE', n: 1 },
      { key: 'TEAM', n: 4 },
    ])
    const teases = visibleStories(stories, beatDate('D-1', DAY_ONE), false, DAY_ONE)
    expect(filterCounts(teases, categories)).toEqual([
      { key: 'ALL', n: 4 },
      { key: 'TEAM', n: 4 },
    ])
  })
})

describe('the story addresses proxy.ts checks', () => {
  it('are exactly the stories', async () => {
    const { storySlugs } = await import('@/content/news/slugs')
    expect(storySlugs).toEqual(stories.map((s) => s.slug))
  })
})
