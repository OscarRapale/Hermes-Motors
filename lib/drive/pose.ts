// What the scene draws each frame: the physics' last two states blended (rules/game.md: render
// interpolates), turned into poses for the car package (metres, heading 0 = +Z, positive left).

import type { Circuit } from '@/lib/game/circuit'
import { carPose, type CarState } from '@/lib/game/car'
import { ghostPose, ghostSpeed, ghostVisible, type Pose } from '@/lib/game/ghost'
import { lapTime, type RaceState } from '@/lib/game/race'

/** Front-wheel angle at full steering, radians (for the model's wheels only) */
const WHEEL_LOCK = 0.32

export type Frame = {
  player: Pose
  /** m/s, spins the wheels */
  speed: number
  /** radians, turns the front wheels */
  wheels: number
  /** The messenger, or null while he's hidden */
  ghost: Pose | null
  ghostSpeed: number
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function blendCar(a: CarState, b: CarState, t: number): CarState {
  return { ...b, s: lerp(a.s, b.s, t), d: lerp(a.d, b.d, t), psi: lerp(a.psi, b.psi, t), v: lerp(a.v, b.v, t), steer: lerp(a.steer, b.steer, t) }
}

export function frameAt(c: Circuit, prev: RaceState, state: RaceState, alpha: number): Frame {
  const car = blendCar(prev.car, state.car, alpha)
  const tPrev = lapTime(prev)
  const tNow = lapTime(state)
  const t = tNow === null ? null : tPrev === null ? tNow : lerp(tPrev, tNow, alpha)
  const show = t !== null && ghostVisible(t, state.phase === 'finished')
  return {
    player: carPose(c, car),
    speed: car.v,
    wheels: car.steer * WHEEL_LOCK,
    ghost: show ? ghostPose(c, t) : null,
    ghostSpeed: show ? ghostSpeed(c, t) : 0,
  }
}
