// Your best lap and attempt count, on this device only (rules/game.md, docs/legal/privacy.md):
// localStorage "hermes.drive.v1", wrapped in try/catch; the game works without it.

const KEY = 'hermes.drive.v1'

export type DriveRecord = {
  /** Best counted lap (penalty included), ms; null before the first finish */
  bestMs: number | null
  attempts: number
}

const EMPTY: DriveRecord = { bestMs: null, attempts: 0 }

/** Accept only what we wrote: integers in range (the store is the visitor's, so it may hold anything). */
export function parseRecord(raw: string | null): DriveRecord {
  if (!raw) return EMPTY
  try {
    const v: unknown = JSON.parse(raw)
    if (typeof v !== 'object' || v === null) return EMPTY
    const { bestMs, attempts } = v as Record<string, unknown>
    const best = Number.isInteger(bestMs) && (bestMs as number) >= 60_000 && (bestMs as number) <= 600_000 ? (bestMs as number) : null
    const tries = Number.isInteger(attempts) && (attempts as number) >= 0 && (attempts as number) <= 99_999 ? (attempts as number) : 0
    return { bestMs: best, attempts: tries }
  } catch {
    return EMPTY
  }
}

export function readRecord(): DriveRecord {
  try {
    return parseRecord(localStorage.getItem(KEY))
  } catch {
    return EMPTY
  }
}

function write(record: DriveRecord): DriveRecord {
  try {
    localStorage.setItem(KEY, JSON.stringify(record))
  } catch {
    // private mode, blocked storage: keep playing
  }
  return record
}

/** A new attempt starts (each time the lights do) */
export function countAttempt(): DriveRecord {
  const r = readRecord()
  return write({ ...r, attempts: r.attempts + 1 })
}

/** A finished lap: keep it if it's the best */
export function recordLap(totalMs: number): DriveRecord {
  const r = readRecord()
  return write({ ...r, bestMs: r.bestMs === null ? totalMs : Math.min(r.bestMs, totalMs) })
}
