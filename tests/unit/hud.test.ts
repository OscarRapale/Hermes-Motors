import { beforeEach, describe, expect, it } from 'vitest'
import { driveCopy } from '@/content/copy/drive'
import { hudView, mapPoint } from '@/lib/drive/hud'
import { countAttempt, parseRecord, readRecord, recordLap } from '@/lib/drive/storage'
import { circuit } from '@/lib/game/circuit'
import { MAP_POINTS } from '@/lib/game/data'
import { IDLE, createRace, type RaceState } from '@/lib/game/race'
import { T } from '@/lib/game/tuning'

const c = circuit()
const grid = createRace(1)
/** On the lap at distance s, `behind` seconds after the messenger passed it */
const at = (s: number, behind: number, extra: Partial<RaceState> = {}): RaceState => {
  const t = c.ghostTimeAt(s) + behind
  return { ...grid, phase: 'running', clock: 50 + t, lapStart: 50, car: { ...grid.car, s, v: 300 / 3.6 }, ...extra }
}

describe('the HUD (board 13)', () => {
  it('on the grid: no clock, no delta, neutral, revving at 9,800', () => {
    const v = hudView(c, grid, IDLE)
    expect(v.clock).toBe('—')
    expect(v.delta).toBe('—')
    expect(v.deltaState).toBe('none')
    expect(v.progress).toBe(driveCopy.hud.grid)
    expect(v.gear).toBe('N')
    expect(v.rpm).toBe('9,800')
    expect(v.sectors.map((s) => s.state)).toEqual(['idle', 'idle', 'idle'])
    expect(v.me).toEqual(mapPoint(c, -T.gridBehindM))
  })

  it('on the lap: the clock, the signed delta, progress, and the live sector', () => {
    const v = hudView(c, at(600, 0.244), { ...IDLE, throttle: 1 })
    expect(v.delta).toBe('+0.244')
    expect(v.deltaState).toBe('behind')
    expect(v.tag).toBe('+0.24 S')
    expect(v.progress).toBe(driveCopy.hud.progress(Math.round((100 * 600) / c.length), false))
    expect(v.sectors[0]).toMatchObject({ state: 'live', tag: driveCopy.hud.live })
    expect(v.sectors[0].fill).toBe(Math.round((100 * 600) / c.sectors[0]))
    expect(v.speed).toBe(300)
    expect(v.speedArc).toBeCloseTo(225, 6) // 300 of 360 km/h on a 270° arc
    expect(v.throttle).toBe(100)
    const ahead = hudView(c, at(600, -0.214), IDLE)
    expect(ahead.delta).toBe('−0.214')
    expect(ahead.deltaState).toBe('ahead')
    expect(ahead.progress).toContain('LEADING')
  })

  it('colours finished sectors on rounded times: purple faster, yellow slower', () => {
    const s = at(c.sectors[1] + 10, 0.1, { crossings: [19.842, 19.842 + 26.323] })
    const v = hudView(c, s, IDLE)
    expect(v.sectors[0]).toMatchObject({ state: 'slower', time: '19.842', tag: '+0.422', fill: 100 })
    expect(v.sectors[1]).toMatchObject({ state: 'faster', time: '26.323', tag: '−0.088' })
    expect(v.sectors[2].state).toBe('live')
  })

  it('shows Overtake ready within 1 s behind, active for 2 s after the press', () => {
    expect(hudView(c, at(1500, 0.6), IDLE).overtake).toBe('ready')
    expect(hudView(c, at(1500, 0.6), IDLE).overtakeReady).toBe(true)
    expect(hudView(c, at(1500, 1.6), IDLE).overtake).toBe('off')
    const used = at(1500, 0.6, { overtakeUsed: true })
    expect(hudView(c, { ...used, overtakeUntil: c.ghostTimeAt(1500) + 2 }, IDLE).overtake).toBe('active')
  })

  it('puts both dots on the prototype map: the start line at the start, the ghost where he is', () => {
    expect(mapPoint(c, 0)).toEqual([...MAP_POINTS[0]])
    const p60 = mapPoint(c, c.knots[60])
    expect(p60[0]).toBeCloseTo(MAP_POINTS[60][0], 9)
    expect(p60[1]).toBeCloseTo(MAP_POINTS[60][1], 9)
    const v = hudView(c, at(1500, 0.5), IDLE)
    expect(v.ghost).toEqual(mapPoint(c, c.ghostDistanceAt(c.ghostTimeAt(1500) + 0.5)))
  })
})

describe('best lap and attempts (localStorage hermes.drive.v1)', () => {
  const store = new Map<string, string>()
  beforeEach(() => {
    store.clear()
    globalThis.localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    } as Storage
  })

  it('counts attempts and keeps the best lap', () => {
    expect(readRecord()).toEqual({ bestMs: null, attempts: 0 })
    countAttempt()
    countAttempt()
    recordLap(72_381)
    recordLap(73_000)
    expect(readRecord()).toEqual({ bestMs: 72_381, attempts: 2 })
    recordLap(71_692)
    expect(readRecord().bestMs).toBe(71_692)
  })

  it('ignores anything it didn’t write', () => {
    expect(parseRecord('not json')).toEqual({ bestMs: null, attempts: 0 })
    expect(parseRecord('{"bestMs": 3, "attempts": -1}')).toEqual({ bestMs: null, attempts: 0 })
    expect(parseRecord('{"bestMs": 71692.5, "attempts": "4"}')).toEqual({ bestMs: null, attempts: 0 })
    expect(parseRecord('{"bestMs": 71692, "attempts": 4}')).toEqual({ bestMs: 71692, attempts: 4 })
  })

  it('works without storage (private mode, blocked)', () => {
    globalThis.localStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    } as unknown as Storage
    expect(countAttempt()).toEqual({ bestMs: null, attempts: 1 })
    expect(readRecord()).toEqual({ bestMs: null, attempts: 0 })
  })
})
