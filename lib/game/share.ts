// The result in a link (ARCHITECTURE §7.5, rules/game.md): `/drive/r?lap=71692&s=19842.26323.25527&a=4`.
// Integers only, checked against ranges; anything else is no result at all (the page 404s, the card too).
// A jump start adds `j=1` (Decision D9 via M4): the lap stays the lap as driven, so its sectors still add
// up to it, and the 5 s penalty is added to what counts.

import type { LapResult } from './timing'
import { T } from './tuning'

export type SharedLap = {
  /** The lap as driven, ms; the three sectors add up to it (within 3 ms) */
  lapMs: number
  sectorsMs: [number, number, number]
  /** Attempt on that device, 1…999 */
  attempt: number
  jumpStart: boolean
}

export const LAP_MIN_MS = 60_000
export const LAP_MAX_MS = 180_000
const SUM_TOLERANCE_MS = 3
const ATTEMPT_MAX = 999
const INT = /^(0|[1-9]\d{0,6})$/

/** From a finished lap on this device */
export function sharedFromResult(r: LapResult, attempt: number): SharedLap {
  return { lapMs: r.lapMs, sectorsMs: [...r.sectorsMs], attempt: Math.min(ATTEMPT_MAX, Math.max(1, attempt)), jumpStart: r.penaltyMs > 0 }
}

/** Back to a lap result (timing.ts), the penalty included */
export function resultFromShared(s: SharedLap): LapResult {
  const penaltyMs = s.jumpStart ? T.jumpPenaltyS * 1000 : 0
  return { sectorsMs: [...s.sectorsMs], lapMs: s.lapMs, penaltyMs, totalMs: s.lapMs + penaltyMs }
}

/** "lap=71692&s=19842.26323.25527&a=4" (and "&j=1" after a jump start) */
export function shareQuery(s: SharedLap): string {
  return `lap=${s.lapMs}&s=${s.sectorsMs.join('.')}&a=${s.attempt}${s.jumpStart ? '&j=1' : ''}`
}

type Params = URLSearchParams | Record<string, string | string[] | undefined>

/** One value per key, or nothing: a repeated key is as bad as a missing one */
function one(params: Params, key: string): string | null {
  const all = params instanceof URLSearchParams ? params.getAll(key) : [params[key]].flat().filter((v) => v !== undefined)
  return all.length === 1 ? (all[0] as string) : null
}

const int = (v: string | null) => (v !== null && INT.test(v) ? Number(v) : null)

/** The lap in a link, if it is one the game could have made; otherwise null */
export function parseShared(params: Params): SharedLap | null {
  const lapMs = int(one(params, 'lap'))
  const attempt = int(one(params, 'a'))
  const s = one(params, 's')?.split('.') ?? []
  const j = params instanceof URLSearchParams ? params.getAll('j') : [params.j].flat().filter((v) => v !== undefined)
  if (lapMs === null || attempt === null || s.length !== 3) return null
  const sectors = s.map(int)
  if (sectors.some((v) => v === null || v === 0)) return null
  const sectorsMs = sectors as [number, number, number]
  if (lapMs < LAP_MIN_MS || lapMs > LAP_MAX_MS) return null
  if (Math.abs(sectorsMs[0] + sectorsMs[1] + sectorsMs[2] - lapMs) > SUM_TOLERANCE_MS) return null
  if (attempt < 1 || attempt > ATTEMPT_MAX) return null
  if (j.length > 1 || (j.length === 1 && j[0] !== '1')) return null
  return { lapMs, sectorsMs, attempt, jumpStart: j.length === 1 }
}
