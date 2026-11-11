// The arcade car's numbers (ARCHITECTURE §7.3). Figures about the car come from content/facts.ts; the
// rest are game tuning, never shown on the site as facts. Tuned so a clean lap by a good driver lands
// within ±0.4 s of the messenger's 71.906 (tests/unit/game/laps.test.ts keeps the reference laps).

import { hm27, rules } from '@/content/facts'

const G = 9.81
const DRIVER_KG = 32 // ARCH §7.3: 768 kg car + driver = 800 kg
const kmh = (v: number) => v / 3.6

const massKg = rules.minMassKg + DRIVER_KG
const powerW = rules.systemPowerKw * 1000
/** Top speed on 750 kW (ARCH §7.3); Boost's extra power reaches the HM-27's 352 km/h (facts §B) */
const baseTopSpeed = kmh(330)
const dragK = powerW / (massKg * baseTopSpeed ** 3) // drag deceleration = dragK · v²
const ROLLING = 0.15 // m/s²

export const T = {
  g: G,
  massKg,
  powerW,
  /** Boost: the extra power that lifts the top speed from 330 to 352 km/h (power ∝ v³ against drag) */
  boostW: powerW * ((kmh(hm27.topSpeedKmh) / baseTopSpeed) ** 3 - 1),
  dragK,
  /** Traction: 0–100 km/h in 2.6 s (facts §B), net of rolling resistance and the mean drag on the way */
  driveMaxAccel: kmh(100) / hm27.zeroToHundredS + ROLLING + (dragK * kmh(100) ** 2) / 3,
  rollingDecel: ROLLING,

  /** Brakes: 40 m/s² at speed, 25 below 100 km/h, blended up to 200 km/h */
  brakeHigh: 40,
  brakeLow: 25,
  brakeBlendFrom: kmh(100),
  brakeBlendTo: kmh(200),

  /** Grip: a_lat_max = g · (base + aero · v²), downforce growing with v². ARCH's starting 1.6 and 0.00045,
      × 0.58: what puts a clean lap on the messenger's time, and his own envelope (≈ 1.2 g at 110 km/h,
      1.75 g at 200, from his speeds and the circuit's curvature) */
  gripBase: 0.926,
  gripAero: 0.00026,

  /** Steering: yaw rate up to 1.6 rad/s at low speed, never more than grip allows; none standing still */
  yawMax: 1.6,
  /** The tightest turn, metres: caps the yaw rate at v / 7 (1.6 rad/s from 40 km/h up) */
  minTurnRadius: 7,
  /** How fast the steering follows the input (per second); keyboards are on/off */
  steerRate: 3.2,
  steerReturn: 5,
  /** The car never points more than this far off the track's direction (radians) */
  headingErrorMax: 1.2,

  /** Off the road (car centre this far past the edge): drag ×3 (ARCH), and 4 m/s² more: ×3 drag alone
      barely slows a car at 100 km/h, so running wide through the run-off would be the fast line */
  offTrackMargin: 1,
  offTrackDrag: 3,
  offTrackDecel: 4,
  /** Walls: an impact (into the wall faster than 1.5 m/s) stops the car sideways and costs 30% of its
      speed; slower contact just slides along */
  halfCarWidth: 0.95,
  wallSpeedLoss: 0.3,
  wallImpact: 1.5,
  /** Scraping along a wall, m/s²: riding the wall must never beat braking for the corner */
  wallScrape: 8,

  /** Energy store: game tuning (the HUD shows a percentage), 64% at the start (ARCH §7.3) */
  storeJ: 4e6,
  startCharge: 0.64,
  /** Harvest under braking, game tuning: 150 kW at full brake, so Boosting on every straight empties the
      store about two thirds of the way round (facts §A's 8.5 MJ per lap is the real power unit's, not
      this Boost-only store) */
  harvestW: 150_000,
  /** Overtake: +0.5 MJ when within 1 s of the messenger (facts §A); once per lap; shown for 2 s */
  overtakeJ: 0.5e6,
  overtakeWindowS: 1,
  overtakeShowS: 2,

  /** The start (Decision D26, placeholder): the grid sits this far behind the line; the lap is timed from it */
  gridBehindM: 65,
  lightsCount: 5,
  lightIntervalS: 1,
  lightsOutMinS: 0.2,
  lightsOutMaxS: 1.0,
  /** Throttle at or above this before lights out is a jump start: +5 s (Decision D9) */
  jumpThrottle: 0.5,
  jumpPenaltyS: 5,
} as const

/** The physics step: 1/120 s, fixed (rules/game.md) */
export const DT = 1 / 120
