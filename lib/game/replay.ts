// Input logs: a lap is its seed and its inputs, sampled at 30 Hz (each held for four physics steps).
// The reference laps in tests/unit/game/laps/ are replayed with this.

import type { Circuit } from './circuit'
import { createRace, step, type Input, type RaceState } from './race'
import { DT } from './tuning'

export const LOG_HZ = 30
const STEPS_PER_FRAME = Math.round(1 / LOG_HZ / DT) // 4

/** One input frame: throttle, brake and steer × 100 (integers), then flags: 1 = Boost, 2 = Overtake */
export type LogFrame = [number, number, number, number]

export type InputLog = {
  seed: number
  frames: LogFrame[]
}

export function encodeInput(input: Input): LogFrame {
  return [
    Math.round(input.throttle * 100),
    Math.round(input.brake * 100),
    Math.round(input.steer * 100),
    (input.boost ? 1 : 0) | (input.overtake ? 2 : 0),
  ]
}

export function decodeInput([throttle, brake, steer, flags]: LogFrame): Input {
  return { throttle: throttle / 100, brake: brake / 100, steer: steer / 100, boost: (flags & 1) !== 0, overtake: (flags & 2) !== 0 }
}

/** Replay a log from the grid; stops at the end of the log (the lap is finished by then, or not). */
export function replay(c: Circuit, log: InputLog): RaceState {
  let state = createRace(log.seed)
  for (const frame of log.frames) {
    const input = decodeInput(frame)
    for (let k = 0; k < STEPS_PER_FRAME; k++) state = step(c, state, input, DT)
  }
  return state
}
