import { describe, expect, it } from 'vitest'
import { driveOpen, previewBanner } from '@/lib/drive/access'
import { GAME_KEYS, inputFromKeys } from '@/lib/drive/keys'
import { frameAt } from '@/lib/drive/pose'
import { circuit } from '@/lib/game/circuit'
import { GHOST_HIDDEN_S } from '@/lib/game/ghost'
import { createRace, step, IDLE, type RaceState } from '@/lib/game/race'
import { DT } from '@/lib/game/tuning'

const c = circuit()

describe('who can drive (ARCHITECTURE §3, §4.4, Decision D3)', () => {
  it('opens from 06:00 on Day One, or while previewing First Light, with a banner only then', () => {
    expect(driveOpen({ phase: 'before', theme: 'night', previewing: false })).toBe(false)
    expect(driveOpen({ phase: 'before', theme: 'day', previewing: true })).toBe(true)
    expect(driveOpen({ phase: 'firstLight', theme: 'day', previewing: false })).toBe(true)
    // after Day One, revisiting Before Dawn doesn't lock the drive again
    expect(driveOpen({ phase: 'firstLight', theme: 'night', previewing: true })).toBe(true)
    expect(previewBanner({ phase: 'before', theme: 'day', previewing: true })).toBe(true)
    expect(previewBanner({ phase: 'firstLight', theme: 'day', previewing: false })).toBe(false)
  })
})

describe('desktop keys (rules/game.md)', () => {
  const keys = (...codes: string[]) => inputFromKeys(new Set(codes))

  it('maps W/↑, S/↓, A/D and ←/→, Space and Shift', () => {
    expect(keys('KeyW')).toEqual({ throttle: 1, brake: 0, steer: 0, boost: false, overtake: false })
    expect(keys('ArrowUp').throttle).toBe(1)
    expect(keys('KeyS').brake).toBe(1)
    expect(keys('ArrowDown').brake).toBe(1)
    expect(keys('KeyA').steer).toBe(1) // left is positive
    expect(keys('ArrowRight').steer).toBe(-1)
    expect(keys('Space').overtake).toBe(true)
    expect(keys('ShiftRight').boost).toBe(true)
  })

  it('cancels out both steering directions, and owns only its keys', () => {
    expect(keys('KeyA', 'KeyD').steer).toBe(0)
    expect(keys('KeyQ')).toEqual(IDLE)
    expect(GAME_KEYS.has('Escape')).toBe(false)
    expect(GAME_KEYS.has('Tab')).toBe(false)
  })
})

describe('what the scene draws', () => {
  it('blends the last two physics states, and hides the ghost until 0.5 s into the lap', () => {
    const a: RaceState = { ...createRace(1), phase: 'running', clock: 20, lapStart: 20 + 0 - GHOST_HIDDEN_S / 2, car: { ...createRace(1).car, s: 10, v: 30 } }
    const b: RaceState = { ...a, clock: 20 + DT, car: { ...a.car, s: 10.25, v: 30.1 } }
    const mid = frameAt(c, a, b, 0.5)
    const p0 = c.toWorld(10.125, 0)
    expect(mid.player.x).toBeCloseTo(p0.x, 6)
    expect(mid.player.z).toBeCloseTo(p0.z, 6)
    expect(mid.speed).toBeCloseTo(30.05, 9)
    expect(mid.ghost).toBeNull()
    const later = { ...b, clock: b.clock + 1 }
    expect(frameAt(c, later, later, 0).ghost).not.toBeNull()
  })
})

describe('the run-up (Decision D26)', () => {
  it('holds the car on the centre line until the line, whatever the steering', () => {
    let s = createRace(1)
    while (s.phase === 'grid') s = step(c, s, IDLE, DT)
    while (s.car.s < -1) {
      s = step(c, s, { ...IDLE, throttle: 1, steer: 1 }, DT)
      expect(s.car.d).toBe(0)
      expect(s.car.psi).toBe(0)
    }
    // across the line, the steering is the player's
    for (let k = 0; k < 60; k++) s = step(c, s, { ...IDLE, throttle: 1, steer: 1 }, DT)
    expect(s.lapStart).not.toBeNull()
    expect(s.car.d).toBeGreaterThan(0)
  })
})
