// What the Proving Ground's builder needs (ARCHITECTURE §7.1): kerbs on apexes and exits where the
// curvature is above its 70th percentile, run-off on the outside of the fast corners, walls beyond,
// and the centre line resampled evenly. Pure; the scene passes the result to <Track layout />.

import { HALF_WIDTH, WALL, type Circuit } from './circuit'
import { ghostSpeed } from './ghost'

export type Side = 'left' | 'right'
export type Span = { side: Side; from: number; to: number }

export type Corner = {
  /** The bend, metres along the lap: where the smoothed curvature passes its median */
  from: number
  to: number
  /** Which way it turns */
  turns: Side
  /** Its tight part, above the 70th percentile (none for the fast sweepers) */
  apex: [number, number] | null
  /** The messenger's slowest speed through it, km/h */
  minKmh: number
}

/** Same shape as ProvingGround's TrackLayout (kept structural so lib/game stays free of three.js). */
export type CircuitLayout = {
  points: [number, number, number][]
  closed: boolean
  halfWidth: number
  kerbs: Span[]
  runoff: Span[]
  walls: { left: number; right: number }
}

const SMOOTH_M = 12 // the map's points are rounded to 0.1 unit (≈ 0.4 m): smooth before reading corners
const MIN_RUN_M = 15
const MERGE_GAP_M = 15
const FAST_KMH = 150 // a corner he takes above this is fast: run-off on its outside
const EXIT_KERB_M = 30
const RUNOFF_BEFORE_M = 20
const RUNOFF_AFTER_M = 60

/** |curvature| above this share of the lap (by distance) is a corner / a corner's tight part. */
const BEND_PERCENTILE = 0.5
const APEX_PERCENTILE = 0.7

function smoothedCurvature(c: Circuit): number[] {
  const n = Math.floor(c.length)
  const raw = Array.from({ length: n }, (_, s) => c.frameAt(s).curvature)
  return raw.map((_, s) => {
    let sum = 0
    for (let q = -SMOOTH_M; q <= SMOOTH_M; q++) sum += raw[(s + q + n) % n]
    return sum / (2 * SMOOTH_M + 1)
  })
}

function runsAbove(k: number[], threshold: number): [number, number][] {
  const runs: [number, number][] = []
  let start = -1
  for (let s = 0; s <= k.length; s++) {
    const on = s < k.length && Math.abs(k[s]) > threshold
    if (on && start < 0) start = s
    if (!on && start >= 0) {
      const last = runs.at(-1)
      // the same bend, interrupted for a few metres
      if (last && start - last[1] < MERGE_GAP_M && Math.sign(k[start]) === Math.sign(k[last[1] - 1])) last[1] = s
      else runs.push([start, s])
      start = -1
    }
  }
  return runs.filter(([a, b]) => b - a >= MIN_RUN_M)
}

const percentile = (values: number[], p: number) => [...values].map(Math.abs).sort((a, b) => a - b)[Math.floor(p * values.length)]

/** The circuit's corners, in lap order. */
export function corners(c: Circuit): Corner[] {
  const k = smoothedCurvature(c)
  const apexes = runsAbove(k, percentile(k, APEX_PERCENTILE))
  return runsAbove(k, percentile(k, BEND_PERCENTILE)).map(([from, to]) => {
    const turns: Side = k[(from + to) >> 1] > 0 ? 'left' : 'right'
    const apex = apexes.find(([a, b]) => a < to && b > from) ?? null
    let minKmh = Infinity
    for (let s = from; s < to; s++) minKmh = Math.min(minKmh, ghostSpeed(c, c.ghostTimeAt(s)) * 3.6)
    return { from, to, turns, apex, minKmh }
  })
}

const other = (side: Side): Side => (side === 'left' ? 'right' : 'left')

/** Kerbs: inside along each apex, outside from the apex's middle to 30 m past it. */
export function kerbs(c: Circuit, list = corners(c)): Span[] {
  return list.flatMap(({ apex, turns }) => {
    if (!apex) return []
    const [a, b] = apex
    return [
      { side: turns, from: a, to: b },
      { side: other(turns), from: (a + b) / 2, to: Math.min(c.length, b + EXIT_KERB_M) },
    ]
  })
}

/** Run-off on the outside of the corners he takes above 150 km/h. */
export function runoff(c: Circuit, list = corners(c)): Span[] {
  return list
    .filter((corner) => corner.minKmh >= FAST_KMH)
    .map(({ from, to, turns }) => ({
      side: other(turns),
      from: Math.max(0, from - RUNOFF_BEFORE_M),
      to: Math.min(c.length, to + RUNOFF_AFTER_M),
    }))
}

/**
 * The layout for ProvingGround's <Track>: the centre line every ~2 m (three.js maps distance to the
 * curve with only 200 samples, which is exact enough only when the points are evenly spaced).
 */
export function circuitLayout(c: Circuit, spacing = 2): CircuitLayout {
  const count = Math.round(c.length / spacing)
  const points: [number, number, number][] = Array.from({ length: count }, (_, i) => {
    const f = c.frameAt((i * c.length) / count)
    return [f.x, 0, f.z]
  })
  const list = corners(c)
  return {
    points,
    closed: true,
    halfWidth: HALF_WIDTH,
    kerbs: kerbs(c, list),
    runoff: runoff(c, list),
    walls: { left: WALL, right: -WALL },
  }
}

/**
 * The builder measures the lap from 200 chords (THREE.Curve.getLength), about 2 m short of ours, and
 * places spans by its own metres: rescale them so kerbs and run-off land where we put them.
 */
export function forBuilder(layout: CircuitLayout, builderLength: number, length: number): CircuitLayout {
  const k = builderLength / length
  const scale = (spans: Span[]) => spans.map((s) => ({ ...s, from: s.from * k, to: s.to * k }))
  return { ...layout, kerbs: scale(layout.kerbs), runoff: scale(layout.runoff) }
}

export type BrakingBoard = {
  /** Metres along the lap */
  s: number
  /** The verge it stands on: the outside of the approach */
  side: Side
  /** 3, 2, 1: counting down to the corner */
  stripes: 3 | 2 | 1
}

/** Boards before a corner never sit closer together than this */
const MIN_BOARD_RUN_M = 45

/**
 * Braking boards (3-2-1) before each tight corner: "3" where the messenger starts to slow (his last speed
 * peak before the corner's slowest point), then "2" and "1" counting down to where the corner begins.
 */
export function brakingBoards(c: Circuit, list = corners(c)): BrakingBoard[] {
  const speedAt = (s: number) => ghostSpeed(c, c.ghostTimeAt(Math.min(c.length, Math.max(0, s))))
  return list
    .filter((k) => k.apex)
    .flatMap((k) => {
      // his slowest point in the corner, then back to where he was still speeding up
      let slowest = k.from
      for (let s = k.from; s <= k.to; s += 2) if (speedAt(s) < speedAt(slowest)) slowest = s
      let peak = slowest
      while (peak > 2 && speedAt(peak - 2) >= speedAt(peak)) peak -= 2
      const first = Math.min(peak, k.from - MIN_BOARD_RUN_M)
      const step = (k.from - first) / 3
      const side = other(k.turns)
      return ([3, 2, 1] as const).map((stripes, i) => ({ s: first + i * step, side, stripes }))
    })
}
