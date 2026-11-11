// One attempt (ARCHITECTURE §7.4): the grid, five lights, lights out, the lap, the finish.
// `step(c, state, input, dt) → state`, pure and deterministic for a seed and an input log.

import type { Circuit } from './circuit'
import { NO_INPUT, createCar, stepCar, type CarInput, type CarState } from './car'
import { gapAt } from './ghost'
import { seeded } from './rng'
import { lapResult, type LapResult } from './timing'
import { T } from './tuning'

export type Input = CarInput & {
  /** Overtake button (Space): acts on the press, when within 1 s of the messenger */
  overtake: boolean
}

export const IDLE: Input = { ...NO_INPUT, overtake: false }

export type Phase = 'grid' | 'running' | 'finished'

export type RaceState = {
  phase: Phase
  /** Seconds since the grid appeared */
  clock: number
  /** When the lights go out (clock), drawn from the seed: 5 s of lights + 0.2…1.0 s */
  lightsOutAt: number
  jumpStart: boolean
  car: CarState
  /** Clock time when the car crossed the line; null on the grid and on the run to it */
  lapStart: number | null
  /** Lap times (s) at the S1 line, the S2 line and the finish, as they are crossed */
  crossings: number[]
  result: LapResult | null
  overtakeUsed: boolean
  /** Lap time until which the Overtake effect shows */
  overtakeUntil: number
  /** The button's state last step (Overtake acts on the press) */
  overtakeHeld: boolean
}

export function createRace(seed: number): RaceState {
  const delay = T.lightsOutMinS + seeded(seed)() * (T.lightsOutMaxS - T.lightsOutMinS)
  return {
    phase: 'grid',
    clock: 0,
    lightsOutAt: T.lightsCount * T.lightIntervalS + delay,
    jumpStart: false,
    car: createCar(-T.gridBehindM),
    lapStart: null,
    crossings: [],
    result: null,
    overtakeUsed: false,
    overtakeUntil: -Infinity,
    overtakeHeld: false,
  }
}

/** Red lights lit: one more each second, all five until lights out, then none */
export function lightsLit(state: RaceState): number {
  if (state.phase !== 'grid') return 0
  return Math.min(T.lightsCount, Math.floor(state.clock / T.lightIntervalS))
}

/** Seconds into the lap (null before the line) */
export function lapTime(state: RaceState): number | null {
  if (state.lapStart === null) return null
  if (state.result) return state.crossings[2]
  return state.clock - state.lapStart
}

/** The live gap to the messenger, s (positive: behind); null before the line and after the finish */
export function liveGap(c: Circuit, state: RaceState): number | null {
  const t = lapTime(state)
  if (t === null || state.phase !== 'running') return null
  return gapAt(c, state.car.s, t)
}

/** Overtake can be used: running, once per lap, within 1 s behind the messenger */
export function overtakeReady(c: Circuit, state: RaceState): boolean {
  const gap = liveGap(c, state)
  return !state.overtakeUsed && gap !== null && gap > 0 && gap <= T.overtakeWindowS
}

export function step(c: Circuit, state: RaceState, input: Input, dt: number): RaceState {
  const clock = state.clock + dt

  if (state.phase === 'grid') {
    // the car is held; throttle once the first light is on is a jump start
    const jump = state.jumpStart || (state.clock >= T.lightIntervalS && input.throttle >= T.jumpThrottle)
    if (clock < state.lightsOutAt) return { ...state, clock, jumpStart: jump }
    return { ...state, clock, jumpStart: jump, phase: 'running' }
  }

  const running = state.phase === 'running'
  const carInput: CarInput = running ? input : { ...NO_INPUT, brake: 0.25 } // after the flag: coast down
  let car = state.car
  let energyBonus = 0
  let { overtakeUsed, overtakeUntil } = state
  if (running && input.overtake && !state.overtakeHeld && overtakeReady(c, state)) {
    overtakeUsed = true
    overtakeUntil = (lapTime(state) ?? 0) + T.overtakeShowS
    energyBonus = T.overtakeJ
  }
  if (energyBonus) car = { ...car, energy: Math.min(T.storeJ, car.energy + energyBonus) }
  const next = stepCar(c, car, carInput, dt)

  // line crossings, timed within the step
  const at = (line: number) => state.clock + dt * ((line - state.car.s) / (next.s - state.car.s))
  const crossed = (line: number) => state.car.s < line && next.s >= line
  let { lapStart, result, phase } = state
  const crossings = [...state.crossings]
  if (lapStart === null && crossed(0)) lapStart = at(0)
  if (lapStart !== null && running) {
    const lines = [...c.sectors, c.length]
    for (let k = crossings.length; k < 3; k++) {
      if (!crossed(lines[k])) break
      crossings.push(at(lines[k]) - lapStart)
    }
    if (crossings.length === 3) {
      result = lapResult(crossings as [number, number, number], state.jumpStart ? T.jumpPenaltyS : 0)
      phase = 'finished'
    }
  }

  return { ...state, clock, phase, car: next, lapStart, crossings, result, overtakeUsed, overtakeUntil, overtakeHeld: input.overtake }
}
