// The fixed timestep (rules/game.md): physics at 1/120 s with an accumulator; the scene draws between the
// last two states. Never step the physics with the raw frame delta.

import type { Circuit } from './circuit'
import { step, type Input, type RaceState } from './race'
import { DT } from './tuning'

/** Longest frame we catch up on (a tab that stalled shouldn't fast-forward the lap) */
const MAX_FRAME_S = 0.25

export type Loop = {
  prev: RaceState
  state: RaceState
  /** Unspent time, s */
  acc: number
}

export function startLoop(state: RaceState): Loop {
  return { prev: state, state, acc: 0 }
}

/** Advance by one rendered frame; returns the new loop and how far between prev and state to draw (0…1). */
export function advance(c: Circuit, loop: Loop, input: Input, frameS: number): { loop: Loop; alpha: number } {
  let acc = loop.acc + Math.min(Math.max(frameS, 0), MAX_FRAME_S)
  let { prev, state } = loop
  while (acc >= DT) {
    prev = state
    state = step(c, state, input, DT)
    acc -= DT
  }
  return { loop: { prev, state, acc }, alpha: acc / DT }
}
