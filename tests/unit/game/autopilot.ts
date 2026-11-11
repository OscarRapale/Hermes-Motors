// A test driver for the reference laps (ARCHITECTURE §7.3): follows the centre line or a minimum-curvature
// racing line at a share of the grip-limited speed, and records what it pressed as an input log. Tests replay the logs, not this file,
// so changing the autopilot can't move the recorded lap times.

import type { Circuit } from '@/lib/game/circuit'
import { brakeDecel, lateralGrip, maxYawRate } from '@/lib/game/car'
import { createRace, overtakeReady, step, type Input } from '@/lib/game/race'
import { LOG_HZ, encodeInput, type InputLog } from '@/lib/game/replay'
import { DT, T } from '@/lib/game/tuning'

export type Style = {
  /** Drive a racing line (outside, apex, outside, within ±5.5 m) instead of the centre line */
  line: boolean
  /** Share of the grip-limited corner speed */
  pace: number
  /** Braking zones drawn for this share of the car's braking */
  brakeMargin: number
  /** One corner taken too fast (to put the car in the wall): from…to metres, at this pace */
  overcook?: { from: number; to: number; pace: number }
  useBoost: boolean
}

const SMOOTH_M = 10
const START = -T.gridBehindM - 5
const STEPS = Math.round(1 / LOG_HZ / DT)
const LINE_W = 5.5 // the 7 m half-width less the car and a margin
const GRID_M = 12
const ITERATIONS = 60_000

/**
 * A racing line: the minimum-curvature path within ±5.5 m of the centre line (projected gradient descent
 * on the squared second differences of the path, on a 12 m grid), as lateral offsets per metre of the lap.
 */
export function racingLine(c: Circuit): Float64Array {
  const n = Math.round(c.length / GRID_M)
  const h = c.length / n
  const bx = new Float64Array(n)
  const bz = new Float64Array(n)
  const nx = new Float64Array(n)
  const nz = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const f = c.frameAt(i * h)
    bx[i] = f.x
    bz[i] = f.z
    nx[i] = Math.cos(f.heading)
    nz[i] = -Math.sin(f.heading)
  }
  const d = new Float64Array(n)
  const ex = new Float64Array(n)
  const ez = new Float64Array(n)
  const w = (i: number) => (i + n) % n
  for (let it = 0; it < ITERATIONS; it++) {
    for (let i = 0; i < n; i++) {
      const a = w(i - 1)
      const b = w(i + 1)
      ex[i] = bx[a] + nx[a] * d[a] - 2 * (bx[i] + nx[i] * d[i]) + bx[b] + nx[b] * d[b]
      ez[i] = bz[a] + nz[a] * d[a] - 2 * (bz[i] + nz[i] * d[i]) + bz[b] + nz[b] * d[b]
    }
    for (let i = 0; i < n; i++) {
      const a = w(i - 1)
      const b = w(i + 1)
      const gx = ex[a] - 2 * ex[i] + ex[b]
      const gz = ez[a] - 2 * ez[i] + ez[b]
      d[i] = Math.max(-LINE_W, Math.min(LINE_W, d[i] - 0.1 * (gx * nx[i] + gz * nz[i])))
    }
  }
  const len = Math.ceil(c.length)
  const line = new Float64Array(len)
  for (let m = 0; m < len; m++) {
    const u = m / h
    const i = Math.floor(u) % n
    line[m] = d[i] + (d[w(i + 1)] - d[i]) * (u - Math.floor(u))
  }
  return line
}

const lineAt = (line: Float64Array | null, s: number) => (line ? line[((Math.round(s) % line.length) + line.length) % line.length] : 0)

/** Signed curvature of the driven path at each metre from START */
function pathCurvature(c: Circuit, line: Float64Array | null, n: number): Float64Array {
  const k = new Float64Array(n)
  const p = (i: number) => c.toWorld(START + i, lineAt(line, START + i))
  for (let i = 1; i < n - 1; i++) {
    const a = p(i - 1)
    const b = p(i)
    const d = p(i + 1)
    const h1 = Math.atan2(b.x - a.x, b.z - a.z)
    const h2 = Math.atan2(d.x - b.x, d.z - b.z)
    const len = (Math.hypot(b.x - a.x, b.z - a.z) + Math.hypot(d.x - b.x, d.z - b.z)) / 2
    k[i] = Math.atan2(Math.sin(h2 - h1), Math.cos(h2 - h1)) / Math.max(len, 1e-6)
  }
  k[0] = k[1]
  k[n - 1] = k[n - 2]
  return k
}

/** Target speed per metre from START to past the finish */
export function speedProfile(c: Circuit, style: Style, line: Float64Array | null): Float64Array {
  const n = Math.ceil(c.length - START) + 120
  const k = pathCurvature(c, line, n).map(Math.abs)
  const v = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    let sum = 0
    for (let q = -SMOOTH_M; q <= SMOOTH_M; q++) sum += k[Math.min(n - 1, Math.max(0, i + q))]
    const kappa = sum / (2 * SMOOTH_M + 1)
    // fastest v with v² · κ ≤ lateralGrip(v)
    let lim = 120
    for (let it = 0; it < 30; it++) lim = Math.min(120, Math.sqrt(lateralGrip(lim) / Math.max(kappa, 1e-6)))
    const s = START + i
    const o = style.overcook
    const pace = o && s >= o.from && s <= o.to ? o.pace : style.pace
    v[i] = lim * pace
  }
  for (let i = n - 2; i >= 0; i--) v[i] = Math.min(v[i], Math.sqrt(v[i + 1] ** 2 + 2 * brakeDecel(v[i + 1]) * style.brakeMargin))
  return v
}

/** Drive one lap from the grid; returns the log (to one second past the flag). */
export function drive(c: Circuit, style: Style, seed: number): InputLog {
  const line = style.line ? racingLine(c) : null
  const profile = speedProfile(c, style, line)
  const at = (s: number) => profile[Math.min(profile.length - 1, Math.max(0, Math.round(s - START)))]
  const curv = pathCurvature(c, line, profile.length)
  const pathCurvatureAt = (s: number) => curv[Math.min(curv.length - 1, Math.max(0, Math.round(s - START)))]
  let state = createRace(seed)
  const frames: InputLog['frames'] = []
  let after = 0
  while (after < LOG_HZ && frames.length < LOG_HZ * 200) {
    let input: Input = { throttle: 0, brake: 0, steer: 0, boost: false, overtake: false }
    if (state.phase !== 'grid') {
      const car = state.car
      const target = at(car.s + car.v * 0.25)
      const throttle = car.v < target - 0.5 ? 1 : car.v > target + 0.8 ? 0 : 0.55
      const brake = car.v > target + 0.8 ? Math.min(1, Math.max(0.25, (car.v - target) / 4)) : 0
      const ahead = c.frameAt(car.s + car.v * 0.12)
      const pathK = pathCurvatureAt(car.s + car.v * 0.12)
      const psiWanted = Math.max(-0.25, Math.min(0.25, 0.06 * (lineAt(line, car.s + car.v * 0.3) - car.d)))
      const yaw = pathK * car.v + 4 * (psiWanted - car.psi)
      const steer = Math.max(-1, Math.min(1, yaw / maxYawRate(Math.max(car.v, 1))))
      const straight = Math.abs(ahead.curvature) < 0.002 && car.v > 50
      input = { throttle, brake, steer, boost: style.useBoost && straight && throttle === 1, overtake: overtakeReady(c, state) }
    }
    frames.push(encodeInput(input))
    for (let k = 0; k < STEPS; k++) state = step(c, state, input, DT)
    if (state.phase === 'finished') after++
  }
  return { seed, frames }
}
