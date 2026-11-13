// The arcade car (ARCHITECTURE §7.3), track-relative: distance s along the centre line, lateral offset d
// (positive: the driver's left), heading error ψ against the track, speed v. Pure and deterministic.

import { HALF_WIDTH, WALL, type Circuit } from './circuit'
import { T } from './tuning'

export type CarInput = {
  /** 0…1 */
  throttle: number
  /** 0…1 */
  brake: number
  /** −1…1, positive turns left */
  steer: number
  boost: boolean
}

export type CarState = {
  /** Metres along the lap; negative on the grid, before the line */
  s: number
  /** Metres from the centre line, positive to the left */
  d: number
  /** Heading error against the track, radians, positive to the left */
  psi: number
  /** m/s, never negative (no reverse) */
  v: number
  /** The steering actually applied, −1…1 (follows the input at a limited rate) */
  steer: number
  /** The pedals actually applied, 0…1: a keyboard press squeezes them in over a moment */
  throttle: number
  brake: number
  /** Stored energy, J */
  energy: number
  boosting: boolean
  offTrack: boolean
  wallHits: number
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))

/** Lateral grip at speed v: g · (1.6 + 0.00045 v²) */
export const lateralGrip = (v: number) => T.g * (T.gripBase + T.gripAero * v * v)

/** The yaw rate at full lock: none standing still, up to 1.6 rad/s, then what grip allows */
export const maxYawRate = (v: number) => Math.min(T.yawMax, v / T.minTurnRadius, lateralGrip(v) / Math.max(v, 0.1))

/** Braking: 25 m/s² below 100 km/h, rising to 40 at 200 */
export function brakeDecel(v: number): number {
  const f = clamp((v - T.brakeBlendFrom) / (T.brakeBlendTo - T.brakeBlendFrom), 0, 1)
  return T.brakeLow + (T.brakeHigh - T.brakeLow) * f
}

export function createCar(s: number): CarState {
  return { s, d: 0, psi: 0, v: 0, steer: 0, throttle: 0, brake: 0, energy: T.storeJ * T.startCharge, boosting: false, offTrack: false, wallHits: 0 }
}

export const NO_INPUT: CarInput = { throttle: 0, brake: 0, steer: 0, boost: false }

export function stepCar(c: Circuit, car: CarState, input: CarInput, dt: number): CarState {
  // the pedals follow the input: in over a moment, out quickly (keyboards are on/off)
  const pedal = (now: number, want: number, rise: number) => now + clamp(want - now, -T.pedalRelease * dt, rise * dt)
  const throttle = pedal(car.throttle, clamp(input.throttle, 0, 1), T.throttleRise)
  const brake = pedal(car.brake, clamp(input.brake, 0, 1), T.brakeRise)
  const want = clamp(input.steer, -1, 1)

  // the steering follows the input, back to centre faster than out to lock
  const returning = want === 0 || (car.steer !== 0 && Math.sign(want) !== Math.sign(car.steer))
  const rate = (returning ? T.steerReturn : T.steerRate) * dt
  const steer = car.steer + clamp(want - car.steer, -rate, rate)

  // longitudinal
  const boosting = input.boost && throttle > 0 && car.energy > 0
  const power = T.powerW + (boosting ? T.boostW : 0)
  // the tyres' one budget (friction circle): the more the car is cornering, the less drive it can put down,
  // none at the limit, so a car held flat through a corner keeps its line instead of running wide
  const cornering = car.v > 1 ? Math.min(1, (Math.abs(steer) * maxYawRate(car.v) * car.v) / lateralGrip(car.v)) : 0
  const traction = T.frictionCircle ? Math.sqrt(1 - cornering * cornering) : 1
  const drive = throttle * traction * Math.min(power / (T.massKg * Math.max(car.v, 1)), T.driveMaxAccel)
  const drag =
    T.dragK * (car.offTrack ? T.offTrackDrag : 1) * car.v * car.v + (car.v > 0 ? T.rollingDecel + (car.offTrack ? T.offTrackDecel : 0) : 0)
  const v = Math.max(0, car.v + (drive - drag - brake * brakeDecel(car.v)) * dt)

  // energy: Boost spends, braking harvests
  let energy = car.energy
  if (boosting) energy -= T.boostW * dt
  if (brake > 0 && car.v > 1) energy += T.harvestW * brake * dt
  energy = clamp(energy, 0, T.storeJ)

  // track-relative kinematics (semi-implicit: the new speed moves the car)
  const kappa = c.frameAt(car.s).curvature
  const yaw = steer * maxYawRate(v)
  const sDot = (v * Math.cos(car.psi)) / (1 - kappa * car.d)
  let psi = clamp(car.psi + (yaw - kappa * sDot) * dt, -T.headingErrorMax, T.headingErrorMax)
  let d = car.d + v * Math.sin(psi) * dt
  let speed = v
  let wallHits = car.wallHits

  // the walls: an impact stops the car sideways and costs 30% of its speed; a touch slides along
  const limit = WALL - T.halfCarWidth
  if (Math.abs(d) > limit) {
    const side = Math.sign(d)
    d = side * limit
    if (Math.sign(psi) === side) {
      if (v * Math.abs(Math.sin(psi)) > T.wallImpact) {
        speed *= 1 - T.wallSpeedLoss
        wallHits += 1
      }
      psi = 0
    }
    speed = Math.max(0, speed - T.wallScrape * dt)
  }

  return {
    s: car.s + sDot * dt,
    d,
    psi,
    v: speed,
    steer,
    throttle,
    brake,
    energy,
    boosting,
    offTrack: Math.abs(d) > HALF_WIDTH + T.offTrackMargin,
    wallHits,
  }
}

/** Where to draw the car: world position and heading (0 = +Z, positive left) */
export function carPose(c: Circuit, car: CarState): { x: number; z: number; heading: number } {
  const f = c.frameAt(car.s)
  const p = c.toWorld(car.s, car.d)
  return { x: p.x, z: p.z, heading: f.heading + car.psi }
}

/** The prototype's gearbox: up-shifts at 95, 128, 160, 192, 224, 258, 300 km/h (8 gears) */
const SHIFTS = [0, 95, 128, 160, 192, 224, 258, 300, 345]

export function gearFor(kmh: number): number {
  let g = 1
  while (g < 8 && kmh >= SHIFTS[g]) g++
  return g
}

/** RPM across each gear, 7,200 → 11,800 (prototype); 15 shift LEDs light from 7,000 to 12,000 */
export function rpmFor(kmh: number): number {
  const g = gearFor(kmh)
  const f = clamp((kmh - SHIFTS[g - 1]) / (SHIFTS[g] - SHIFTS[g - 1]), 0, 1)
  return Math.round((7200 + f * 4600) / 10) * 10
}

export const shiftLeds = (rpm: number) => clamp(Math.round(((rpm - 7000) / 5000) * 15), 0, 15)

/** Active aero (display): Straight mode flat out and straight ahead at speed, Corner mode otherwise */
export function aeroMode(car: CarState, input: CarInput): 'straight' | 'corner' {
  return input.throttle >= 0.95 && input.brake === 0 && Math.abs(car.steer) < 0.1 && car.v > 40 ? 'straight' : 'corner'
}
