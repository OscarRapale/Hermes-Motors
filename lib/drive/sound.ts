// The test drive's engine note (ARCHITECTURE §7.7): the loop's playback rate follows the revs, so the note
// climbs through each gear and drops on the upshift; its level follows the throttle. Pure, so it's tested.

import { rpmFor } from '@/lib/game/car'
import type { Input, RaceState } from '@/lib/game/race'

/** The revs at which the loop plays as recorded (rate 1): mid-range, so the gears span about 0.76–1.24 */
export const ENGINE_REF_RPM = 9500
/** On the grid the engine idles, and the throttle revs it (the car doesn't move until lights out) */
export const IDLE_RPM = 4200
export const GRID_REV_RPM = 10500
/** Boost lifts the note a touch (the electric motor's whine on top) */
export const BOOST_LIFT = 1.04
/** The level off the throttle, as a share of full throttle */
const COAST = 0.45
const OFF_TRACK = 0.85

export type EngineNote = { rate: number; gain: number }

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))

/** The note for this moment of the race; silent once the lap is done */
export function engineNote(state: RaceState, input: Input): EngineNote {
  if (state.result) return { rate: IDLE_RPM / ENGINE_REF_RPM, gain: 0 }
  const { car } = state
  if (state.phase === 'grid' && car.v < 1) {
    const rpm = IDLE_RPM + input.throttle * (GRID_REV_RPM - IDLE_RPM)
    return { rate: rpm / ENGINE_REF_RPM, gain: COAST + (1 - COAST) * input.throttle }
  }
  const rate = (rpmFor(car.v * 3.6) / ENGINE_REF_RPM) * (car.boosting ? BOOST_LIFT : 1)
  const gain = (COAST + (1 - COAST) * car.throttle) * (car.offTrack ? OFF_TRACK : 1)
  return { rate: clamp(rate, 0.3, 1.6), gain }
}
