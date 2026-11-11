import { describe, expect, it } from 'vitest'
import { chapters, powerPanel, wheelbase } from '@/content/copy/specs'
import { hm27, rules } from '@/content/facts'
import {
  CHAPTER_FRAME,
  PHONE_ZOOM_OUT_BY,
  anchorsAt,
  chapterAt,
  frameOpacity,
  placeInBox,
  scrollingProgress,
  sectionProgress,
  tweenMs,
  wipeClip,
  zoomAt,
} from '@/lib/specs/chapters'

describe('scroll → chapter (ARCHITECTURE §6)', () => {
  it('maps progress through the pinned section to five chapters', () => {
    expect(sectionProgress(0, 1000, 5000, 1000)).toBe(0)
    expect(sectionProgress(3000, 1000, 5000, 1000)).toBe(0.5)
    expect(sectionProgress(9000, 1000, 5000, 1000)).toBe(1)
    // each slot top lands in its own chapter
    for (let c = 0; c < 5; c++) expect(chapterAt(c / 4, 0, 0)).toBe(c)
  })

  it('holds the current chapter inside a 10% band (no flicker on a boundary)', () => {
    expect(chapterAt(0.205, 0)).toBe(0) // raw 1.025: within 0.1 past chapter 0's end
    expect(chapterAt(0.225, 0)).toBe(1) // raw 1.125: out of the band
    expect(chapterAt(0.195, 1)).toBe(1) // raw 0.975: within 0.1 below chapter 1's start
    expect(chapterAt(0.17, 1)).toBe(0)
  })

  it('on phones, starts a chapter as its text scrolls into view, and rests inside it', () => {
    // 390 × 844: 560 px slots, text resting 314 px below each slot's top
    const at = (scrollY: number, current = 0) => chapterAt(scrollingProgress(scrollY, 1000, 560, 314, 844), current)
    for (let c = 0; c < 5; c++) expect(at(1000 + c * 560, c)).toBe(c) // each slot top is its chapter
    // chapter 2 starts when its text's top reaches 72% of the screen (y = 608)
    const start = 1000 + 560 + 314 - 0.72 * 844
    expect(at(start - 100)).toBe(0)
    expect(at(start + 100)).toBe(1)
    // 750 × 340 landscape, 400 px slots, text at 118 px: slot tops still land in their own chapter
    for (let c = 0; c < 5; c++) expect(chapterAt(scrollingProgress(c * 400, 0, 400, 118, 340), c === 0 ? 0 : c - 1)).toBe(c)
    expect(scrollingProgress(0, 1000, 0, 314, 844)).toBe(0)
  })
})

describe('the frames', () => {
  it('tween for min(1500, 380 + 120 × Δframes) ms, and 600 ms to close', () => {
    expect(tweenMs(0, 1)).toBe(380 + 120 * 6)
    expect(tweenMs(0, 3)).toBe(1500)
    expect(tweenMs(18, 4)).toBe(600)
    expect(tweenMs(0, 4)).toBe(380)
  })

  it('cross-fade neighbours and zoom out as the car opens', () => {
    expect(frameOpacity(6, 6)).toBe(1)
    expect(frameOpacity(6.25, 6)).toBe(0.75)
    expect(frameOpacity(6.25, 7)).toBe(0.25)
    expect(frameOpacity(6.25, 8)).toBe(0)
    expect(zoomAt(0)).toBeCloseTo(1.28)
    expect(zoomAt(18)).toBe(1)
    // phones: gone by frame 6, chapter 2 (03-specs)
    expect(zoomAt(3, undefined, PHONE_ZOOM_OUT_BY)).toBeCloseTo(1 + 0.28 / 8)
    expect(zoomAt(6, undefined, PHONE_ZOOM_OUT_BY)).toBe(1)
    expect(zoomAt(12, undefined, PHONE_ZOOM_OUT_BY)).toBe(1)
  })

  it('place anchors in the box around the zoom pivot', () => {
    expect(placeInBox([790, 408.5], 0)).toEqual({ x: expect.closeTo(52.667, 2), y: expect.closeTo(54.394, 2) })
    const open = placeInBox([750, 375.5], 18) // zoom 1: the box centre stays the centre
    expect(open.x).toBeCloseTo(50)
    expect(open.y).toBeCloseTo(50)
    for (const frame of CHAPTER_FRAME) expect(anchorsAt(frame)).toBeTruthy()
  })

  it('wipe the text in with a slanted edge', () => {
    expect(wipeClip(1, 400)).toBe('none')
    expect(wipeClip(0, 400)).toMatch(/^polygon\(/)
  })
})

describe('copy uses the facts (ARCHITECTURE §9)', () => {
  // Every number written in the specs copy must be a figure from facts.ts.
  const facts = new Set<string>()
  const add = (v: number) => {
    facts.add(String(v))
    facts.add(v.toLocaleString('en-US'))
  }
  for (const v of [...Object.values(rules), ...Object.values(hm27)]) if (typeof v === 'number') add(v)
  facts.add('2026') // the rules' year
  facts.add('06') // 06:00, the reveal (content/launch.ts)
  facts.add('00')
  add(rules.frontWingElements + rules.rearWingElements)

  const text = [
    ...chapters.flatMap((c) => [
      ...c.headline,
      c.body,
      ...(c.night ? [...c.night.headline, c.night.body] : []),
      ...c.figures.flatMap((f) => [String(f.value), f.label]),
      ...c.callouts.flatMap((k) => [k.text, k.phone]),
      c.carAlt,
    ]),
    wheelbase.text,
    powerPanel.combustion,
    powerPanel.electric,
  ]
    .join(' ')
    // names, not figures: the car (HM‑27, with or without the non-breaking hyphen) and the engine (V6)
    .replace(/HM[‑-]27|\bV6\b/g, '')

  it('has no number that is not in facts.ts', () => {
    const numbers = text.match(/\d[\d,]*(\.\d+)?/g) ?? []
    const unknown = numbers.filter((x) => !/^0\d$/.test(x) && !facts.has(x))
    expect([...new Set(unknown)]).toEqual([])
  })

  it('splits system power into combustion and electric (53.3 / 46.7)', () => {
    expect(powerPanel.split[0]).toBeCloseTo(53.3, 1)
    expect(powerPanel.split[1]).toBeCloseTo(46.7, 1)
  })

  it('seals the Before Dawn figures and gives chapter 5 a night version (D19, D21)', () => {
    expect(chapters[0].figures.find((f) => f.label === 'MINIMUM MASS')?.sealed).toBe(true)
    expect(chapters[4].night?.headline.join(' ')).not.toMatch(/\d{3}/)
    expect(chapters[4].night?.body).not.toMatch(/\bkW\b/)
  })
})
