import { describe, expect, it } from 'vitest'
import { driveOpen, previewBanner } from '@/lib/drive/access'
import { driveCopy } from '@/content/copy/drive'
import { KEYBOARD, KEYBOARD_H, KEYBOARD_W } from '@/lib/drive/keyboard'
import { CONTROLS, GAME_KEYS, PAUSE_KEY, controlFor, inputFromKeys } from '@/lib/drive/keys'
import { frameAt } from '@/lib/drive/pose'
import { BOOST_TAP_S, boostTap, withTouch, type Pad } from '@/lib/drive/touch'
import { circuit } from '@/lib/game/circuit'
import { GHOST_HIDDEN_S } from '@/lib/game/ghost'
import { createRace, step, IDLE, type RaceState } from '@/lib/game/race'
import { DT, T } from '@/lib/game/tuning'

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

describe('the controls sheet (before the first start)', () => {
  it('draws every key the game owns, each with a legend and the right control', () => {
    const drawn = new Set(KEYBOARD.map((k) => k.code))
    for (const code of [...GAME_KEYS, PAUSE_KEY]) {
      expect(drawn.has(code)).toBe(true)
      expect(driveCopy.controls.keycaps[code]).toBeTruthy()
    }
    expect(controlFor('ShiftRight')).toBe('throttle')
    expect(controlFor('ControlRight')).toBe('brake')
    expect(controlFor('KeyE')).toBe('boost')
    expect(controlFor('ShiftLeft')).toBeNull()
    expect(controlFor('KeyQ')).toBeNull()
    expect(CONTROLS.map((c) => c.id)).toEqual(Object.keys(driveCopy.controls.items))
  })

  it('lays the keyboard out without overlaps, inside the drawing', () => {
    expect(new Set(KEYBOARD.map((k) => k.code)).size).toBe(KEYBOARD.length)
    for (const a of KEYBOARD) {
      expect(a.x + a.w).toBeLessThanOrEqual(KEYBOARD_W)
      expect(a.y + 1).toBeLessThanOrEqual(KEYBOARD_H)
      for (const b of KEYBOARD) {
        if (a === b || a.y !== b.y) continue
        expect(a.x + a.w <= b.x + 1e-9 || b.x + b.w <= a.x + 1e-9).toBe(true)
      }
    }
    // the main block's rows are all 15 keys wide, as on a real keyboard
    for (const y of [1.5, 2.5, 3.5, 4.5, 5.5]) {
      const main = KEYBOARD.filter((k) => k.y === y && k.x < 15)
      expect(main.reduce((w, k) => w + k.w, 0)).toBeCloseTo(15, 9)
    }
  })
})

describe('desktop keys (rules/game.md)', () => {
  const keys = (...codes: string[]) => inputFromKeys(new Set(codes))

  it('maps W/↑/Right Shift, S/↓/Right Ctrl, A/D and ←/→, Space and E', () => {
    expect(keys('KeyW')).toEqual({ throttle: 1, brake: 0, steer: 0, boost: false, overtake: false })
    expect(keys('ArrowUp').throttle).toBe(1)
    expect(keys('KeyS').brake).toBe(1)
    expect(keys('ArrowDown').brake).toBe(1)
    expect(keys('KeyA').steer).toBe(1) // left is positive
    expect(keys('ArrowRight').steer).toBe(-1)
    expect(keys('Space').overtake).toBe(true)
    expect(keys('ShiftRight')).toEqual({ throttle: 1, brake: 0, steer: 0, boost: false, overtake: false })
    expect(keys('ControlRight').brake).toBe(1)
    expect(keys('KeyE').boost).toBe(true)
    expect(keys('ControlLeft')).toEqual(IDLE) // Ctrl+key browser shortcuts stay with the left hand
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
  it('holds the car on the centre line until 30 m past the line, whatever the steering', () => {
    let s = createRace(1)
    while (s.phase === 'grid') s = step(c, s, IDLE, DT)
    while (s.car.s < T.guidedUntilM - 1) {
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

describe('the thumb controls (board 16, Decision D29)', () => {
  const pads = (...p: Pad[]) => new Set<Pad>(p)

  it('drives with the pads as with the keys; the keys still work alongside', () => {
    expect(withTouch(IDLE, pads('throttle', 'left'), 0, 10)).toEqual({ ...IDLE, throttle: 1, steer: 1 })
    expect(withTouch(IDLE, pads('brake', 'right'), 0, 10)).toMatchObject({ brake: 1, steer: -1 })
    expect(withTouch(IDLE, pads('left', 'right'), 0, 10).steer).toBe(0)
    expect(withTouch({ ...IDLE, steer: -1 }, pads('left'), 0, 10).steer).toBe(-1)
    expect(withTouch(IDLE, pads('overtake'), 0, 10).overtake).toBe(true)
  })

  it('deploys Boost for 2 s a tap, extends it with another, and cancels it on the brake', () => {
    const until = boostTap(0, 10)
    expect(until).toBe(10 + BOOST_TAP_S)
    expect(withTouch(IDLE, pads('throttle'), until, 11.9).boost).toBe(true)
    expect(withTouch(IDLE, pads('throttle'), until, 12).boost).toBe(false)
    expect(boostTap(until, 11)).toBe(14) // from the end of the burst, not from now
    expect(boostTap(until, 20)).toBe(22)
    expect(withTouch(IDLE, pads('brake'), until, 11).boost).toBe(false)
  })
})
