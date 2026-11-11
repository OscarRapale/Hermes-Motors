// The Proving Ground (ARCHITECTURE §7.1): the map's 120 points as a closed centripetal Catmull-Rom
// centre line, scaled so the messenger's speeds integrate to his lap, and placed in the car package's
// world: metres, +Y up, the start at the origin heading +Z, +X on the driver's left (ProvingGround.tsx).
// Pure: no React, no DOM, no three.js.

import { MAP_POINTS, MESSENGER_KMH } from './data'
import { messenger } from '@/content/facts'

export const HALF_WIDTH = 7 // the road is 14 m wide
export const RUNOFF = 12 // asphalt run-off on the outside of fast corners reaches ±12 m
export const WALL = 13.5 // walls beyond the run-off, both sides, all the way round

/** How finely each map segment is sampled for the arc-length table. */
const SUBSTEPS = 64

type P2 = readonly [number, number]

/** One point of the centripetal Catmull-Rom segment p1 → p2 (Barry–Goldman), t in 0…1. */
function catmullRom(p0: P2, p1: P2, p2: P2, p3: P2, t: number): [number, number] {
  const knot = (a: P2, b: P2) => Math.max(Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])), 1e-6)
  const t1 = knot(p0, p1)
  const t2 = t1 + knot(p1, p2)
  const t3 = t2 + knot(p2, p3)
  const u = t1 + (t2 - t1) * t
  const lerp = (a: P2, b: P2, ta: number, tb: number): [number, number] => [
    ((tb - u) * a[0] + (u - ta) * b[0]) / (tb - ta),
    ((tb - u) * a[1] + (u - ta) * b[1]) / (tb - ta),
  ]
  const a1 = lerp(p0, p1, 0, t1)
  const a2 = lerp(p1, p2, t1, t2)
  const a3 = lerp(p2, p3, t2, t3)
  return lerp(lerp(a1, a2, 0, t2), lerp(a2, a3, t1, t3), t1, t2)
}

export type TrackFrame = {
  /** World position, metres */
  x: number
  z: number
  /** Heading of the centre line: 0 = +Z, positive turns left (toward +X) */
  heading: number
  /** dHeading/ds, 1/m: positive in left-handers */
  curvature: number
}

export type Circuit = {
  /** Lap length, metres */
  length: number
  /** Metres per map unit (derived from the messenger's speeds) */
  scale: number
  /** Distance along the centre line at each of the 120 map points (the first is 0) */
  knots: number[]
  /** The messenger's lap time at each map point, seconds (plus the full lap at the end: 121 entries) */
  ghostTimes: number[]
  /** The two sector lines, metres: where the messenger passes his S1 and S1 + S2 times */
  sectors: [number, number]
  /** Where the messenger is at lap time t (0…lap), metres along the lap */
  ghostDistanceAt(t: number): number
  /** When the messenger passes distance s (0…length), seconds into his lap */
  ghostTimeAt(s: number): number
  /** The centre line at distance s (any s: wraps around the lap) */
  frameAt(s: number): TrackFrame
  /** A point beside the centre line: d metres to the left (negative: right) */
  toWorld(s: number, d: number): { x: number; z: number }
}

const wrap = (s: number, length: number) => ((s % length) + length) % length
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

function buildCircuit(): Circuit {
  const n = MAP_POINTS.length
  const P = (k: number) => MAP_POINTS[((k % n) + n) % n]

  // Dense samples in map units, and each map segment's length along the curve.
  const mx: number[] = []
  const my: number[] = []
  const segLen: number[] = []
  for (let i = 0; i < n; i++) {
    let len = 0
    let prev = P(i)
    for (let k = 0; k < SUBSTEPS; k++) {
      const q = catmullRom(P(i - 1), P(i), P(i + 1), P(i + 2), k / SUBSTEPS)
      mx.push(q[0])
      my.push(q[1])
      if (k > 0) len += Math.hypot(q[0] - prev[0], q[1] - prev[1])
      prev = q
    }
    const end = P(i + 1)
    segLen.push(len + Math.hypot(end[0] - prev[0], end[1] - prev[1]))
  }

  // The scale: with segment time = length / mean speed (ARCHITECTURE §7.2), the lap must take his 71.906 s.
  const mps = MESSENGER_KMH.map((v) => v / 3.6)
  const unitTime = segLen.reduce((t, len, i) => t + len / ((mps[i] + mps[(i + 1) % n]) / 2), 0)
  const scale = messenger.lapMs / 1000 / unitTime

  // World: rotate the map so its start heading (+x) points +Z, the start at the origin. Map +y (down,
  // the driver's right on the start straight) becomes −X, the car's right: the map isn't mirrored.
  const [x0, y0] = P(0)
  const count = mx.length
  const wx = new Float64Array(count)
  const wz = new Float64Array(count)
  for (let k = 0; k < count; k++) {
    wx[k] = -(my[k] - y0) * scale
    wz[k] = (mx[k] - x0) * scale
  }
  const cum = new Float64Array(count + 1)
  for (let k = 1; k <= count; k++) {
    const j = k % count
    cum[k] = cum[k - 1] + Math.hypot(wx[j] - wx[k - 1], wz[j] - wz[k - 1])
  }
  const length = cum[count]

  // Headings along the samples (central differences), then curvature from their change.
  const hd = new Float64Array(count)
  for (let k = 0; k < count; k++) {
    const a = (k - 1 + count) % count
    const b = (k + 1) % count
    hd[k] = Math.atan2(wx[b] - wx[a], wz[b] - wz[a])
  }
  const kappa = new Float64Array(count)
  const gap = (k: number) => cum[k + 1] - cum[k] // sample k → k + 1
  for (let k = 0; k < count; k++) {
    const a = (k - 1 + count) % count
    const b = (k + 1) % count
    const ds = gap(a) + gap(k)
    kappa[k] = wrapAngle(hd[b] - hd[a]) / (ds > 0 ? ds : 1)
  }

  const knots = Array.from({ length: n }, (_, i) => cum[i * SUBSTEPS])
  const ghostTimes = [0]
  for (let i = 0; i < n; i++) {
    const len = (i + 1 < n ? knots[i + 1] : length) - knots[i]
    ghostTimes.push(ghostTimes[i] + len / ((mps[i] + mps[(i + 1) % n]) / 2))
  }

  /** Index k with cum[k] ≤ s < cum[k + 1] */
  const find = (s: number) => {
    let lo = 0
    let hi = count - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (cum[mid] <= s) lo = mid
      else hi = mid - 1
    }
    return lo
  }

  const frameAt = (s: number): TrackFrame => {
    const at = wrap(s, length)
    const k = find(at)
    const j = (k + 1) % count
    const f = (at - cum[k]) / (cum[k + 1] - cum[k] || 1)
    return {
      x: wx[k] + (wx[j] - wx[k]) * f,
      z: wz[k] + (wz[j] - wz[k]) * f,
      heading: wrapAngle(hd[k] + wrapAngle(hd[j] - hd[k]) * f),
      curvature: kappa[k] + (kappa[j] - kappa[k]) * f,
    }
  }

  // The messenger's lap: time is linear in distance within each map segment (length / mean speed).
  const knotEnd = (i: number) => (i + 1 < n ? knots[i + 1] : length)
  const ghostDistanceAt = (t: number) => {
    const at = Math.min(Math.max(t, 0), ghostTimes[n])
    let lo = 0
    let hi = n - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (ghostTimes[mid] <= at) lo = mid
      else hi = mid - 1
    }
    return knots[lo] + ((at - ghostTimes[lo]) / (ghostTimes[lo + 1] - ghostTimes[lo])) * (knotEnd(lo) - knots[lo])
  }
  const ghostTimeAt = (s: number) => {
    const at = Math.min(Math.max(s, 0), length)
    let lo = 0
    let hi = n - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (knots[mid] <= at) lo = mid
      else hi = mid - 1
    }
    return ghostTimes[lo] + ((at - knots[lo]) / (knotEnd(lo) - knots[lo])) * (ghostTimes[lo + 1] - ghostTimes[lo])
  }
  // the sector lines sit where he passes his published sector times (facts.md §C), so the ghost and
  // the timing table agree by construction (approved with the M3 plan)
  const [s1, s2] = messenger.sectorsMs
  const sectors: [number, number] = [ghostDistanceAt(s1 / 1000), ghostDistanceAt((s1 + s2) / 1000)]

  return {
    length,
    scale,
    knots,
    ghostTimes,
    sectors,
    ghostDistanceAt,
    ghostTimeAt,
    frameAt,
    toWorld(s, d) {
      const f = frameAt(s)
      // the driver's left, facing heading h, is (cos h, −sin h)
      return { x: f.x + Math.cos(f.heading) * d, z: f.z - Math.sin(f.heading) * d }
    },
  }
}

let built: Circuit | null = null
/** The Proving Ground, built once. */
export function circuit(): Circuit {
  built ??= buildCircuit()
  return built
}
