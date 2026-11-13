// Board 16's thumb controls, as input (pure). The pads are held like keys; Boost is a tap on a phone, since
// the thumb that would hold it is on the throttle (Decision D29): a tap deploys it for 2 s, another tap
// adds 2 s more, and braking cancels it. Times are on the race clock, so a pause stops them too.

import type { Input } from '@/lib/game/race'

/** The pads held down */
export type Pad = 'left' | 'right' | 'throttle' | 'brake' | 'overtake'

/** Seconds of Boost per tap */
export const BOOST_TAP_S = 2

/** When Boost ends after a tap at `now`: 2 s more, from now or from the end of the current burst */
export const boostTap = (until: number, now: number): number => Math.max(until, now) + BOOST_TAP_S

/** The keys' input with the pads and the Boost burst added: either hand can drive */
export function withTouch(keys: Input, pads: ReadonlySet<Pad>, boostUntil: number, now: number): Input {
  const left = pads.has('left')
  const right = pads.has('right')
  const padSteer = left === right ? 0 : left ? 1 : -1
  const brake = Math.max(keys.brake, pads.has('brake') ? 1 : 0)
  return {
    throttle: Math.max(keys.throttle, pads.has('throttle') ? 1 : 0),
    brake,
    steer: keys.steer !== 0 ? keys.steer : padSteer,
    boost: keys.boost || (brake === 0 && now < boostUntil),
    overtake: keys.overtake || pads.has('overtake'),
  }
}
