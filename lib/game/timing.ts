// Lap and sector times (rules/game.md): gaps are computed on times rounded to the millisecond, so the
// three shown sector gaps add up to the shown lap gap.

import { messenger } from '@/content/facts'

export type LapResult = {
  /** Sector times, ms: S1, S2, S3 (they sum to lapMs exactly) */
  sectorsMs: [number, number, number]
  /** The lap as driven, ms */
  lapMs: number
  /** Jump-start penalty included, ms (Decision D9) */
  penaltyMs: number
  /** What counts: lap + penalty */
  totalMs: number
}

/** From the lap times (s) at the S1 line, the S2 line and the finish */
export function lapResult(crossings: readonly [number, number, number], penaltyS = 0): LapResult {
  const [a, b, lap] = crossings.map((t) => Math.round(t * 1000))
  const penaltyMs = Math.round(penaltyS * 1000)
  return { sectorsMs: [a, b - a, lap - b], lapMs: lap, penaltyMs, totalMs: lap + penaltyMs }
}

/** Gaps to the messenger, ms: per sector and for the lap (negative: faster) */
export function gapsToMessenger(r: LapResult): { sectorsMs: [number, number, number]; lapMs: number } {
  const his = messenger.sectorsMs
  return {
    sectorsMs: [r.sectorsMs[0] - his[0], r.sectorsMs[1] - his[1], r.sectorsMs[2] - his[2]],
    lapMs: r.totalMs - messenger.lapMs,
  }
}

const MINUS = '−'

/** 71906 → "1:11.906" */
export function formatLap(ms: number): string {
  const m = Math.floor(ms / 60000)
  const rest = ms - m * 60000
  const s = Math.floor(rest / 1000)
  return `${m}:${String(s).padStart(2, '0')}.${String(rest % 1000).padStart(3, '0')}`
}

/** 19420 → "19.420" */
export const formatSector = (ms: number) => `${Math.floor(ms / 1000)}.${String(ms % 1000).padStart(3, '0')}`

/** −214 → "−0.214", 152 → "+0.152" (the copy's minus sign) */
export function formatGap(ms: number): string {
  const sign = ms < 0 ? MINUS : '+'
  return sign + formatSector(Math.abs(ms))
}
