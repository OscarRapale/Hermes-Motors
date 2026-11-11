import { describe, expect, it } from 'vitest'
import { messenger } from '@/content/facts'
import { circuit } from '@/lib/game/circuit'
import { advance, startLoop } from '@/lib/game/loop'
import { IDLE, createRace, lapTime, lightsLit, liveGap, overtakeReady, step, type Input, type RaceState } from '@/lib/game/race'
import { decodeInput, encodeInput } from '@/lib/game/replay'
import { seeded } from '@/lib/game/rng'
import { formatGap, formatLap, formatSector, gapsToMessenger, lapResult } from '@/lib/game/timing'
import { DT, T } from '@/lib/game/tuning'

const c = circuit()
const FLAT: Input = { ...IDLE, throttle: 1 }
const run = (state: RaceState, input: Input, seconds: number) => {
  let s = state
  for (let k = 0; k < Math.round(seconds / DT); k++) s = step(c, s, input, DT)
  return s
}

describe('the start (ARCHITECTURE §7.4)', () => {
  it('lights one red light a second, then all go out 0.2–1.0 s after the fifth', () => {
    const race = createRace(42)
    expect(race.lightsOutAt).toBeGreaterThanOrEqual(5.2)
    expect(race.lightsOutAt).toBeLessThanOrEqual(6.0)
    expect(lightsLit(run(race, IDLE, 0.5))).toBe(0)
    expect(lightsLit(run(race, IDLE, 1.01))).toBe(1)
    expect(lightsLit(run(race, IDLE, 3.01))).toBe(3)
    expect(lightsLit(run(race, IDLE, 5.01))).toBe(5)
    const out = run(race, IDLE, race.lightsOutAt + 0.01)
    expect(out.phase).toBe('running')
    expect(lightsLit(out)).toBe(0)
  })

  it('draws the delay from the seed: the same seed, the same start', () => {
    expect(createRace(7).lightsOutAt).toBe(createRace(7).lightsOutAt)
    expect(createRace(7).lightsOutAt).not.toBe(createRace(8).lightsOutAt)
    const r = seeded(1)
    for (let k = 0; k < 1000; k++) {
      const x = r()
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
    }
  })

  it('holds the car on the grid, 65 m behind the line (Decision D26)', () => {
    const race = createRace(1)
    expect(race.car.s).toBe(-T.gridBehindM)
    const held = run(race, IDLE, 3)
    expect(held.car.s).toBe(-T.gridBehindM)
    expect(held.car.v).toBe(0)
  })

  it('throttle once the first light is on is a jump start: +5 s on the result (Decision D9)', () => {
    const early = run(createRace(1), FLAT, 0.9) // before the first light: just revving
    expect(early.jumpStart).toBe(false)
    const jumped = run(createRace(1), FLAT, 2)
    expect(jumped.jumpStart).toBe(true)
    expect(run(jumped, IDLE, 1).jumpStart).toBe(true)
  })
})

describe('the lap', () => {
  it('starts timing at the line, not at lights out, and the messenger starts with it', () => {
    let race = run(createRace(1), IDLE, createRace(1).lightsOutAt + 0.01)
    expect(lapTime(race)).toBeNull()
    expect(liveGap(c, race)).toBeNull()
    while (race.car.s < 0) race = step(c, race, FLAT, DT)
    const t = lapTime(race)!
    expect(t).toBeGreaterThanOrEqual(0)
    expect(t).toBeLessThan(DT)
    // the start line is crossed between two steps: the lap starts at the interpolated moment
    expect(race.lapStart).toBeGreaterThan(race.clock - DT)
  })

  it('times the sectors and the lap at the lines, and stops at the flag', () => {
    const lap = {
      phase: 'running',
      clock: 100,
      lapStart: 30,
      crossings: [19.4204, 45.8311],
      car: { ...createRace(1).car, s: c.length - 0.5, v: 60 },
    } as const
    const race: RaceState = { ...createRace(1), ...lap, crossings: [...lap.crossings] }
    let s = race
    while (s.phase === 'running') s = step(c, s, IDLE, DT)
    expect(s.phase).toBe('finished')
    expect(s.result).not.toBeNull()
    expect(s.result!.sectorsMs.reduce((a, b) => a + b, 0)).toBe(s.result!.lapMs)
    expect(s.crossings[2]).toBeCloseTo(100 - 30 + 0.5 / 60, 3)
    expect(liveGap(c, s)).toBeNull()
    // after the flag the car coasts down whatever is pressed
    expect(run(s, FLAT, 2).car.v).toBeLessThan(s.car.v)
  })

  it('adds the jump-start penalty to the result', () => {
    const r = lapResult([19.42, 45.831, 71.906], T.jumpPenaltyS)
    expect(r.penaltyMs).toBe(5000)
    expect(r.totalMs).toBe(76906)
    expect(r.lapMs).toBe(71906)
  })
})

describe('Overtake (facts §A)', () => {
  /** On the lap at distance s, `behind` seconds after the messenger passed it */
  const at = (s: number, behind: number): RaceState => {
    const base = createRace(1)
    const t = c.ghostTimeAt(s) + behind
    return { ...base, phase: 'running', clock: 50 + t, lapStart: 50, car: { ...base.car, s, v: 50 } }
  }

  it('is ready within 1 s behind the messenger, not ahead of him, not further back', () => {
    expect(overtakeReady(c, at(1500, 0.6))).toBe(true)
    expect(overtakeReady(c, at(1500, 1.4))).toBe(false)
    expect(overtakeReady(c, at(1500, -0.2))).toBe(false)
  })

  it('adds 0.5 MJ on the press, once per lap, and shows for 2 s', () => {
    const before = { ...at(1500, 0.6), car: { ...at(1500, 0.6).car, energy: 1e6 } }
    const used = step(c, before, { ...IDLE, overtake: true }, DT)
    expect(used.overtakeUsed).toBe(true)
    expect(used.car.energy).toBeGreaterThan(before.car.energy + 0.49e6)
    expect(used.overtakeUntil).toBeCloseTo(lapTime(before)! + T.overtakeShowS, 9)
    // holding the button, or pressing it again, adds nothing more
    const held = step(c, used, { ...IDLE, overtake: true }, DT)
    const again = step(c, step(c, held, IDLE, DT), { ...IDLE, overtake: true }, DT)
    expect(again.car.energy).toBeLessThanOrEqual(used.car.energy)
    expect(overtakeReady(c, used)).toBe(false)
  })
})

describe('timing (rules/game.md)', () => {
  it('rounds to the millisecond so the sector gaps add up to the lap gap: the design’s winning lap', () => {
    const r = lapResult([19.842, 19.842 + 26.323, 71.692])
    expect(r.sectorsMs).toEqual([19842, 26323, 25527])
    const gaps = gapsToMessenger(r)
    expect(gaps.sectorsMs).toEqual([422, -88, -548])
    expect(gaps.lapMs).toBe(-214)
    expect(gaps.sectorsMs.reduce((a, b) => a + b, 0)).toBe(gaps.lapMs)
  })

  it('formats like the boards', () => {
    expect(formatLap(messenger.lapMs)).toBe('1:11.906')
    expect(formatLap(60_005)).toBe('1:00.005')
    expect(formatSector(19420)).toBe('19.420')
    expect(formatGap(-214)).toBe('−0.214')
    expect(formatGap(152)).toBe('+0.152')
  })
})

describe('the fixed step and the logs', () => {
  it('steps the physics at 1/120 s whatever the frame rate, and says where to draw between states', () => {
    const loop = startLoop(createRace(1))
    const { loop: next, alpha } = advance(c, loop, IDLE, 1 / 60)
    expect(next.state.clock).toBeCloseTo(2 * DT, 9)
    expect(alpha).toBeCloseTo(0, 6)
    const slow = advance(c, next.state === loop.state ? loop : next, IDLE, 0.013)
    expect(slow.alpha).toBeGreaterThan(0)
    expect(slow.alpha).toBeLessThan(1)
    // a stalled tab doesn't fast-forward the lap
    expect(advance(c, loop, IDLE, 5).loop.state.clock).toBeLessThanOrEqual(0.25 + 1e-9)
  })

  it('encodes inputs as integers and back', () => {
    const input: Input = { throttle: 0.55, brake: 0.25, steer: -0.37, boost: true, overtake: true }
    expect(encodeInput(input)).toEqual([55, 25, -37, 3])
    expect(decodeInput(encodeInput(input))).toEqual(input)
  })
})
