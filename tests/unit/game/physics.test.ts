import { describe, expect, it } from 'vitest'
import { hm27 } from '@/content/facts'
import { HALF_WIDTH, WALL, circuit } from '@/lib/game/circuit'
import {
  NO_INPUT,
  aeroMode,
  brakeDecel,
  carPose,
  createCar,
  gearFor,
  lateralGrip,
  maxYawRate,
  rpmFor,
  shiftLeds,
  stepCar,
  type CarInput,
  type CarState,
} from '@/lib/game/car'
import { DT, T } from '@/lib/game/tuning'

const c = circuit()
const FLAT: CarInput = { throttle: 1, brake: 0, steer: 0, boost: false }
const run = (car: CarState, input: CarInput, seconds: number) => {
  let s = car
  for (let k = 0; k < Math.round(seconds / DT); k++) s = stepCar(c, s, input, DT)
  return s
}

/** Terminal speed, km/h: where the drive force meets drag */
function topSpeed(powerW: number): number {
  let v = 50
  for (let it = 0; it < 200; it++) v = Math.cbrt((powerW / T.massKg - T.rollingDecel * v) / T.dragK)
  return v * 3.6
}

describe('the car against the facts', () => {
  it('weighs 800 kg (768 kg + driver) on 750 kW', () => {
    expect(T.massKg).toBe(800)
    expect(T.powerW).toBe(750_000)
  })

  it('does 0–100 km/h in 2.6 s (facts §B)', () => {
    let car = createCar(100) // on the start straight
    let t = 0
    while (car.v < 100 / 3.6) {
      car = stepCar(c, car, FLAT, DT)
      t += DT
    }
    expect(t).toBeCloseTo(hm27.zeroToHundredS, 1)
  })

  it('tops out near 330 km/h, and 352 with Boost (facts §B)', () => {
    expect(topSpeed(T.powerW)).toBeGreaterThan(327)
    expect(topSpeed(T.powerW)).toBeLessThan(331)
    expect(topSpeed(T.powerW + T.boostW)).toBeGreaterThan(hm27.topSpeedKmh - 4)
    expect(topSpeed(T.powerW + T.boostW)).toBeLessThan(hm27.topSpeedKmh + 1)
  })

  it('brakes at 25 m/s² below 100 km/h and 40 above 200', () => {
    expect(brakeDecel(20)).toBe(25)
    expect(brakeDecel(60)).toBe(40)
    expect(brakeDecel(150 / 3.6)).toBeCloseTo(32.5, 5)
  })
})

describe('steering and grip', () => {
  it('grows grip with speed (downforce)', () => {
    expect(lateralGrip(60)).toBeGreaterThan(lateralGrip(30))
    expect(lateralGrip(0)).toBeCloseTo(T.g * T.gripBase, 9)
  })

  it('turns at most 1.6 rad/s, not at all standing still, and never past grip', () => {
    expect(maxYawRate(0)).toBe(0)
    for (const v of [1, 3, 5, 8, 12]) expect(maxYawRate(v)).toBeLessThanOrEqual(T.yawMax)
    expect(maxYawRate(8)).toBeGreaterThan(1) // walking pace and up: a tight turn is possible
    for (const v of [8, 30, 50, 80]) expect(maxYawRate(v) * v).toBeLessThanOrEqual(lateralGrip(v) + 1e-9)
  })

  it('eases the steering in (keyboards are on/off) and back out faster', () => {
    const car = { ...createCar(100), v: 30 }
    const once = stepCar(c, car, { ...FLAT, steer: 1 }, DT)
    expect(once.steer).toBeCloseTo(T.steerRate * DT, 9)
    const full = run(car, { ...FLAT, steer: 1 }, 1)
    expect(full.steer).toBe(1)
    expect(stepCar(c, full, FLAT, DT).steer).toBeCloseTo(1 - T.steerReturn * DT, 9)
  })

  it('steers left with positive input: offset and heading to the left', () => {
    const car = run({ ...createCar(100), v: 30 }, { ...FLAT, steer: 0.3 }, 0.6)
    expect(car.psi).toBeGreaterThan(0)
    expect(car.d).toBeGreaterThan(0)
    const pose = carPose(c, car)
    expect(pose.x).toBeGreaterThan(0) // the start straight runs along +Z: left is +X
  })
})

describe('off the road and the walls', () => {
  it('slows harder off the road', () => {
    const on = stepCar(c, { ...createCar(200), v: 40 }, NO_INPUT, DT)
    const off = stepCar(c, { ...createCar(200), v: 40, d: HALF_WIDTH + 2, offTrack: true }, NO_INPUT, DT)
    expect(off.v).toBeLessThan(on.v)
    expect(off.offTrack).toBe(true)
  })

  it('a hit stops the car sideways, costs 30% of its speed and counts once', () => {
    const limit = WALL - T.halfCarWidth
    const car: CarState = { ...createCar(200), v: 40, d: limit - 0.05, psi: 0.3 }
    const hit = stepCar(c, car, NO_INPUT, DT)
    expect(hit.wallHits).toBe(1)
    expect(hit.psi).toBe(0)
    expect(hit.d).toBeCloseTo(limit, 9)
    expect(hit.v).toBeLessThan(car.v * 0.71)
    expect(stepCar(c, hit, NO_INPUT, DT).wallHits).toBe(1)
  })

  it('a gentle touch slides along without a hit; the car can always drive away', () => {
    const limit = WALL - T.halfCarWidth
    const touch = stepCar(c, { ...createCar(200), v: 10, d: limit, psi: 0.05 }, NO_INPUT, DT)
    expect(touch.wallHits).toBe(0)
    const away = run({ ...createCar(500), d: limit, v: 0 }, { ...FLAT, steer: -1 }, 2)
    expect(away.v).toBeGreaterThan(10)
    expect(away.d).toBeLessThan(limit - 3)
    expect(away.wallHits).toBe(0)
  })

  it('never points backwards against the track', () => {
    const car = run({ ...createCar(200), v: 15 }, { ...FLAT, throttle: 0.3, steer: 1 }, 5)
    expect(Math.abs(car.psi)).toBeLessThanOrEqual(T.headingErrorMax)
  })
})

describe('energy', () => {
  it('starts at 64%; Boost spends it, braking harvests it, within the store', () => {
    const car = { ...createCar(200), v: 60 }
    expect(car.energy).toBeCloseTo(0.64 * T.storeJ, 6)
    const boosted = stepCar(c, car, { ...FLAT, boost: true }, DT)
    expect(boosted.boosting).toBe(true)
    expect(boosted.energy).toBeCloseTo(car.energy - T.boostW * DT, 3)
    const braked = stepCar(c, car, { ...NO_INPUT, brake: 1 }, DT)
    expect(braked.energy).toBeCloseTo(car.energy + T.harvestW * DT, 3)
    expect(stepCar(c, { ...car, energy: 0 }, { ...FLAT, boost: true }, DT).boosting).toBe(false)
    expect(stepCar(c, { ...car, energy: T.storeJ }, { ...NO_INPUT, brake: 1 }, DT).energy).toBe(T.storeJ)
  })
})

describe('the dashboard', () => {
  it('shifts like the prototype: 8 gears, up at 95, 128 … 300 km/h', () => {
    expect(gearFor(0)).toBe(1)
    expect(gearFor(94)).toBe(1)
    expect(gearFor(95)).toBe(2)
    expect(gearFor(299)).toBe(7)
    expect(gearFor(330)).toBe(8)
  })

  it('runs 7,200 → 11,800 rpm across each gear; 15 LEDs from 7,000 to 12,000', () => {
    expect(rpmFor(95)).toBe(7200)
    expect(rpmFor(127.99)).toBe(11800)
    expect(shiftLeds(7000)).toBe(0)
    expect(shiftLeds(12000)).toBe(15)
  })

  it('shows Straight mode flat out and straight at speed, Corner mode otherwise', () => {
    const car = { ...createCar(200), v: 60 }
    expect(aeroMode(car, FLAT)).toBe('straight')
    expect(aeroMode(car, { ...FLAT, brake: 0.5 })).toBe('corner')
    expect(aeroMode({ ...car, v: 20 }, FLAT)).toBe('corner')
  })
})
