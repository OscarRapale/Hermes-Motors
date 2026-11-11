// The specs section's maths (ARCHITECTURE §6, docs/design/03-specs.md). Pure: unit-tested.

import layout from '@/content/specs-layout.json'

export const CHAPTERS = 5
/** The frame (of 18) each chapter settles on: wings, halo, everything apart, then back together. */
export const CHAPTER_FRAME = [0, 6, 12, 18, 0] as const
export const LAST_FRAME = 18
export const FRAME_SIZE = { w: layout.size[0], h: layout.size[1] } // 1500 × 751
export const ZOOM_ASSEMBLED = 1.28
/** The zoom pivot, in frame pixels */
export const PIVOT = { x: 790, y: 408.5 }

export const HYSTERESIS = 0.1
export const TEXT_WIPE_MS = 450
export const COUNT_DELAY_MS = 150
export const COUNT_MS = 800
export const PLAY_STEP_MS = 2700
export const CLOSE_MS = 600

/** How far through the pinned section the reader is: 0 at its top, 1 when its end meets the viewport's. */
export function sectionProgress(scrollY: number, sectionTop: number, sectionHeight: number, viewport: number): number {
  const range = sectionHeight - viewport
  if (range <= 0) return 0
  return Math.min(1, Math.max(0, (scrollY - sectionTop) / range))
}

/**
 * The chapter (0-based) for a scroll progress: floor(progress × 5), held within a 10% band around
 * the current chapter so a reader resting on a boundary doesn't make it flicker.
 */
export function chapterAt(progress: number, current: number, hysteresis = HYSTERESIS): number {
  const raw = progress * CHAPTERS
  if (raw >= current - hysteresis && raw < current + 1 + hysteresis) return current
  return Math.min(CHAPTERS - 1, Math.max(0, Math.floor(raw)))
}

/** Phones: a chapter starts when the top of its text has scrolled up to 72% of the screen's height. */
export const PHONE_REVEAL = 0.72

/**
 * Phones, where the chapter text scrolls under the pinned car (ARCHITECTURE §6): the progress at
 * which each chapter starts as its text comes into view, not when its slot reaches the top. `textTop`
 * is where a chapter's text rests below its slot's top; `slot` is one chapter's scroll length.
 */
export function scrollingProgress(scrollY: number, sectionTop: number, slot: number, textTop: number, viewport: number): number {
  if (slot <= 0) return 0
  const raw = (scrollY - sectionTop - textTop + PHONE_REVEAL * viewport) / slot
  return Math.min(1, Math.max(0, raw / CHAPTERS))
}

/** The scroll position of a chapter's slot (each chapter is one viewport of scroll). */
export function chapterScrollY(chapter: number, sectionTop: number, viewport: number): number {
  return sectionTop + chapter * viewport
}

/** Tween length: min(1500, 380 + 120 × |Δframes|) ms; closing the car for chapter 5 is a quick 600 ms. */
export function tweenMs(fromFrame: number, toChapter: number): number {
  const to = CHAPTER_FRAME[toChapter]
  if (toChapter === CHAPTERS - 1 && fromFrame > 0) return CLOSE_MS
  return Math.min(1500, 380 + 120 * Math.abs(to - fromFrame))
}

/** Frame i's opacity at frame position f: the stack cross-fades neighbours (plus-lighter). */
export function frameOpacity(f: number, i: number): number {
  return Math.max(0, 1 - Math.abs(f - i))
}

/** Phones: the zoom is gone by frame 6 (chapter 2), so the open car never crosses the screen edge. */
export const PHONE_ZOOM_OUT_BY = 6

/**
 * The pull-back: zoom 1.28 while assembled, easing to 1.0 as the car opens: over the whole run on
 * desktop, by frame 6 on phones (03-specs: `Z = 1 + 0.28 × max(0, 1 − f/6)³`).
 */
export function zoomAt(f: number, assembled = ZOOM_ASSEMBLED, zoomOutBy = LAST_FRAME): number {
  return 1 + (assembled - 1) * Math.max(0, 1 - f / zoomOutBy) ** 3
}

/** A frame-pixel point → % of the car box, after the zoom around the pivot. */
export function placeInBox(point: readonly [number, number], f: number, zoom = zoomAt(f)): { x: number; y: number } {
  const px = PIVOT.x / FRAME_SIZE.w
  const py = PIVOT.y / FRAME_SIZE.h
  const x = (point[0] / FRAME_SIZE.w - px) * zoom + px
  const y = (point[1] / FRAME_SIZE.h - py) * zoom + py
  return { x: 100 * x, y: 100 * y }
}

type Anchors = Record<string, [number, number]>
/** The callout anchors projected for frame `frame` (content/specs-layout.json). */
export function anchorsAt(frame: number): Anchors {
  // JSON arrays type as number[]; each anchor is an [x, y] pair (checked in tests/unit/specs.test.ts)
  return (layout.anchors as unknown as Record<string, Anchors>)[String(Math.round(frame))]
}

/** The text wipe's clip at progress t (0…1): a 14° edge moving left to right across a `width` px block. */
export function wipeEdgeX(t: number, width: number, slant = 96): number {
  const e = 1 - (1 - t) ** 3
  return -slant + (width + 2 * slant) * e
}

export function wipeClip(t: number, width: number, slant = 96): string {
  if (t >= 1) return 'none'
  const x = wipeEdgeX(t, width, slant)
  return `polygon(-24px -24px, ${(x + slant / 2).toFixed(1)}px -24px, ${(x - slant / 2).toFixed(1)}px calc(100% + 24px), -24px calc(100% + 24px))`
}
