// The messenger (ARCHITECTURE §7.2): his pose and speed at any lap time, and the gap to the player.
// Pure: built on the circuit's time-at-distance table.

import type { Circuit } from './circuit'

/** His ghost is hidden for the first half second after lights out (and after the player finishes). */
export const GHOST_HIDDEN_S = 0.5

export type Pose = { x: number; z: number; heading: number }

/** The messenger at lap time t: on the centre line (lateral offset 0), facing along it. */
export function ghostPose(c: Circuit, t: number): Pose {
  const f = c.frameAt(c.ghostDistanceAt(t))
  return { x: f.x, z: f.z, heading: f.heading }
}

/** Whether to draw him: not in the first 0.5 s, not after the player's lap ends. */
export function ghostVisible(t: number, finished: boolean): boolean {
  return !finished && t >= GHOST_HIDDEN_S
}

/** His speed at lap time t, m/s: the mean speed of the map segment he is on (matches his timing). */
export function ghostSpeed(c: Circuit, t: number): number {
  const at = Math.min(Math.max(t, 0), c.ghostTimes[c.ghostTimes.length - 1])
  let i = 0
  while (i < c.knots.length - 1 && c.ghostTimes[i + 1] <= at) i++
  const end = i + 1 < c.knots.length ? c.knots[i + 1] : c.length
  return (end - c.knots[i]) / (c.ghostTimes[i + 1] - c.ghostTimes[i])
}

/**
 * The live gap: how far behind the messenger the player is, in seconds, having reached distance s
 * at lap time t. Positive: behind (his time there was earlier); negative: ahead.
 */
export function gapAt(c: Circuit, s: number, t: number): number {
  return t - c.ghostTimeAt(s)
}
