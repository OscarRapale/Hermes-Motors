// What board 13's HUD shows, from the race state (pure; the Hud component writes it to the DOM).
// Logic as in the prototype (TestDrive-Lap.dc.html → renderVals), on the physics' numbers.

import { messenger } from '@/content/facts'
import { driveCopy } from '@/content/copy/drive'
import type { Circuit } from '@/lib/game/circuit'
import { aeroMode, gearFor, rpmFor, shiftLeds } from '@/lib/game/car'
import { MAP_POINTS } from '@/lib/game/data'
import { lapTime, liveGap, overtakeReady, type Input, type RaceState } from '@/lib/game/race'
import { formatLap, formatSector } from '@/lib/game/timing'
import { T } from '@/lib/game/tuning'

export type SectorCell = {
  state: 'idle' | 'live' | 'faster' | 'slower'
  /** How much of the bar is filled, 0…100 */
  fill: number
  /** "19.420" when done, the running time when live, "—" before */
  time: string
  /** "−0.088" / "+0.422" when done, "LIVE" while running */
  tag: string
}

export type HudView = {
  clock: string
  /** "+0.244" / "−0.214" (3 decimals), "—" before the line */
  delta: string
  deltaState: 'none' | 'ahead' | 'behind'
  /** The tag over the ghost: "+0.24 S" (2 decimals) */
  tag: string
  overtakeReady: boolean
  /** "ON THE GRID" / "42% · CHASING" / "LEADING" */
  progress: string
  /** The map's trace, 0…1000 of the outline */
  trace: number
  /** Map positions, in the prototype's 280 × 190 map units */
  me: [number, number]
  ghost: [number, number]
  sectors: SectorCell[]
  speed: number
  /** The dial's arc: 0…270 degrees for 0…360 km/h */
  speedArc: number
  rpm: string
  gear: string
  leds: number
  /** 0…100 */
  throttle: number
  brake: number
  ers: number
  aero: 'straight' | 'corner'
  overtake: 'off' | 'ready' | 'active'
  boost: boolean
}

const MINUS = '−'
const signed = (seconds: number, decimals: number) => (seconds < 0 ? MINUS : '+') + Math.abs(seconds).toFixed(decimals)

/** The prototype's map position for a distance along the lap: straight between the 120 map points */
export function mapPoint(c: Circuit, s: number): [number, number] {
  const at = ((s % c.length) + c.length) % c.length
  let i = 0
  while (i < c.knots.length - 1 && c.knots[i + 1] <= at) i++
  const end = i + 1 < c.knots.length ? c.knots[i + 1] : c.length
  const f = (at - c.knots[i]) / (end - c.knots[i])
  const a = MAP_POINTS[i]
  const b = MAP_POINTS[(i + 1) % MAP_POINTS.length]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
}

function sectors(c: Circuit, state: RaceState, t: number | null): SectorCell[] {
  const lines = [0, ...c.sectors, c.length]
  const his = messenger.sectorsMs
  // sector times rounded as the result is (rules/game.md): the gaps add up to the lap gap
  const ms = state.crossings.map((x) => Math.round(x * 1000))
  return [0, 1, 2].map((k) => {
    if (k < ms.length) {
      const mine = ms[k] - (k > 0 ? ms[k - 1] : 0)
      const gap = mine - his[k]
      return { state: gap < 0 ? 'faster' : 'slower', fill: 100, time: formatSector(mine), tag: signed(gap / 1000, 3) }
    }
    const s = state.car.s
    if (t !== null && state.phase === 'running' && k === ms.length && s >= lines[k]) {
      const startT = k > 0 ? state.crossings[k - 1] : 0
      const fill = Math.min(100, Math.round((100 * (s - lines[k])) / (lines[k + 1] - lines[k])))
      return { state: 'live', fill, time: formatSector(Math.max(0, Math.floor((t - startT) * 1000))), tag: driveCopy.hud.live }
    }
    return { state: 'idle', fill: 0, time: '—', tag: '' }
  })
}

export function hudView(c: Circuit, state: RaceState, input: Input): HudView {
  const t = lapTime(state)
  const gap = liveGap(c, state)
  const car = state.car
  const kmh = Math.max(0, Math.round(car.v * 3.6))
  const onGrid = state.phase === 'grid'
  const rpm = onGrid ? 9800 : rpmFor(kmh) // the prototype revs at 9,800 on the grid
  const gear = onGrid ? 'N' : String(gearFor(kmh))
  const progress = t === null ? 0 : Math.min(1, Math.max(0, car.s / c.length))
  const ready = overtakeReady(c, state)
  const active = t !== null && t < state.overtakeUntil
  return {
    clock: t === null ? '—' : formatLap(Math.floor(t * 1000)),
    delta: gap === null ? '—' : signed(gap, 3),
    deltaState: gap === null ? 'none' : gap < 0 ? 'ahead' : 'behind',
    tag: gap === null ? '' : `${signed(gap, 2)} S`,
    overtakeReady: ready,
    progress: t === null ? driveCopy.hud.grid : driveCopy.hud.progress(Math.round(progress * 100), gap !== null && gap < 0),
    trace: Math.round(progress * 1000),
    me: mapPoint(c, car.s),
    ghost: mapPoint(c, t === null ? 0 : c.ghostDistanceAt(t)),
    sectors: sectors(c, state, t),
    speed: kmh,
    speedArc: Math.min(1, kmh / 360) * 270,
    rpm: rpm.toLocaleString('en-US'),
    gear,
    leds: shiftLeds(rpm),
    throttle: Math.round(input.throttle * 100),
    brake: Math.round(input.brake * 100),
    ers: Math.round((100 * car.energy) / T.storeJ),
    aero: onGrid ? 'corner' : aeroMode(car, input),
    overtake: active ? 'active' : ready ? 'ready' : 'off',
    boost: car.boosting,
  }
}

/** The prototype's track-map outline (board 13), in the map points' own units (viewBox 280 × 190) */
export const MAP_PATH =
  'M52,160 L196,160 C236,160 256,146 252,124 C249,108 230,104 214,106 C196,108 186,96 192,82 C198,68 222,66 238,56 C254,46 252,24 232,20 C204,14 168,30 148,44 C130,56 112,54 100,40 C88,26 64,18 44,30 C28,40 30,62 46,74 C60,84 60,100 44,110 C28,120 22,140 30,152 C35,159 42,160 52,160 Z'
