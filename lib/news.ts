// The news list's rules (06-news), pure: what a story's date says, which stories show, the featured one.

import { DAY_ONE, DAY_ONE_FINAL } from '@/content/launch'
import type { Category, Story } from '@/content/news/stories'
import { beatDate, dayOneOffsetMinutes, parseBeat } from '@/lib/clock/beats'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const MINUS = '−'
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * "D−42", "DAY ONE · 06:00" while Day One isn't final (D1); after, the date at the Proving Ground:
 * "3 JAN 2027", "14 FEB 2027 · 06:00".
 */
export function storyDate(beat: string, final: boolean = DAY_ONE_FINAL, dayOne: string = DAY_ONE): string {
  const { days, time } = parseBeat(beat)
  const at = time ? ` · ${pad(time.hh)}:${pad(time.mm)}` : ''
  if (!final) return days === 0 ? `DAY ONE${at}` : `D${days < 0 ? MINUS : '+'}${Math.abs(days)}${at}`
  // the calendar date where the Proving Ground is (its offset is DAY_ONE's)
  const local = new Date(beatDate(beat, dayOne) + dayOneOffsetMinutes(dayOne) * 60_000)
  return `${local.getUTCDate()} ${MONTHS[local.getUTCMonth()]} ${local.getUTCFullYear()}${at}`
}

/** A story shows from its beat on; previewing shows them all (Oscar, 2026-11-13) */
export function visibleStories(all: readonly Story[], now: number, previewing: boolean, dayOne: string = DAY_ONE): Story[] {
  return previewing ? [...all] : all.filter((s) => beatDate(s.beat, dayOne) <= now)
}

/** The lead story, for All and its own category: First Light once it is out (board 26), else the newest */
export function featured(visible: readonly Story[], filter: Category | 'ALL'): Story | null {
  const lead = visible.find((s) => s.featured) ?? visible[0] ?? null
  return lead && (filter === 'ALL' || filter === lead.category) ? lead : null
}

/** Counts per filter; only categories with stories get a pill */
export function filterCounts(visible: readonly Story[], categories: readonly Category[]) {
  return [
    { key: 'ALL' as const, n: visible.length },
    ...categories.map((key) => ({ key, n: visible.filter((s) => s.category === key).length })).filter((c) => c.n > 0),
  ]
}

/** When the first story arrives (the empty state) */
export function firstBeat(all: readonly Story[], dayOne: string = DAY_ONE): number {
  return Math.min(...all.map((s) => beatDate(s.beat, dayOne)))
}
