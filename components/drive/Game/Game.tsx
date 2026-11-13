'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { messenger } from '@/content/facts'
import { driveCopy } from '@/content/copy/drive'
import { hudView } from '@/lib/drive/hud'
import { GAME_KEYS, PAUSE_KEY, inputFromKeys } from '@/lib/drive/keys'
import { COMPACT_QUERY, ROTATE_QUERY, TOUCH_QUERY, useMedia } from '@/lib/drive/media'
import { frameAt, type Frame } from '@/lib/drive/pose'
import { boostTap, withTouch, type Pad } from '@/lib/drive/touch'
import { countAttempt, recordLap, type DriveRecord } from '@/lib/drive/storage'
import { circuit } from '@/lib/game/circuit'
import { advance, startLoop, type Loop } from '@/lib/game/loop'
import { createRace, lightsLit, type Phase } from '@/lib/game/race'
import { sharedFromResult } from '@/lib/game/share'
import { formatLap, type LapResult } from '@/lib/game/timing'
import { T } from '@/lib/game/tuning'
import { ControlsKeyboard, ControlsList } from '../Controls/Controls'
import { Hud, type HudHandle } from '../Hud/Hud'
import { Result } from '../Result/Result'
import { Rotate } from '../Rotate/Rotate'
import { TouchControls, type TouchHandle } from '../TouchControls/TouchControls'
import styles from './Game.module.css'

const DriveScene = dynamic(() => import('../DriveScene/DriveScene'), { ssr: false })

const GO_SHOWN_S = 1.2 // "LIGHTS OUT AND AWAY" stays up this long
const newSeed = () => Math.floor(Math.random() * 2 ** 31)
/** A keyboard and a mouse: the controls sheet shows the keys first (phones get their own controls) */
const hasKeyboard = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const hasWebgl2 = () => {
  try {
    return document.createElement('canvas').getContext('webgl2') !== null
  } catch {
    return false
  }
}

/** Haptics (rules/game.md): only at lights out and the finish, never needed; phones without it ignore it */
const buzz = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // not allowed here: fine
  }
}

const HUD_INTERVAL_S = 1 / 30 // the HUD's DOM is written at 30 Hz, as in the prototype

type Ui = { lit: number; phase: Phase; go: boolean; jump: boolean; result: LapResult | null }

/**
 * The test drive (ARCHITECTURE §7, board 13): the full-screen stage, the fixed-step loop, the keys, the
 * start, the HUD, pause and the result. Your best lap and attempt count stay on this device.
 */
export function Game({ preview }: { preview: boolean }) {
  const c = circuit()
  const [status, setStatus] = useState<'checking' | 'nowebgl' | 'loading' | 'ready'>('checking')
  const [paused, setPaused] = useState(false)
  // the controls sheet: before the first start on this device, or from the pause sheet
  const [controls, setControls] = useState<'off' | 'first' | 'paused'>('off')
  const [keyboard, setKeyboard] = useState(false)
  const rotate = useMedia(ROTATE_QUERY) // a phone held upright: the drive waits for landscape
  const compact = useMedia(COMPACT_QUERY)
  const touch = useMedia(TOUCH_QUERY) // board 16's thumb controls
  const [ui, setUi] = useState<Ui>({ lit: 0, phase: 'grid', go: false, jump: false, result: null })
  const [motion, setMotion] = useState(true)
  const [record, setRecord] = useState<DriveRecord>({ bestMs: null, attempts: 0 })

  // the first attempt, made once (the lights-out delay is random)
  const [first] = useState(() => {
    const l = startLoop(createRace(newSeed()))
    return { loop: l, frame: frameAt(c, l.state, l.state, 0) }
  })
  const loop = useRef<Loop>(first.loop)
  const frame = useRef<Frame>(first.frame)
  const held = useRef(new Set<string>())
  // keys pressed since the last step: a quick tap (down and up between two frames) still counts once
  const taps = useRef(new Set<string>())
  // the thumb controls, the same way, and when a BST tap's Boost ends (race clock)
  const pads = useRef(new Set<Pad>())
  const padTaps = useRef(new Set<Pad>())
  const boostUntil = useRef(0)
  const touchPads = useRef<TouchHandle>(null)
  const snap = useRef(0)
  const running = useRef(false) // ready and not paused: the loop advances
  const forLandscape = useRef(false) // ready, held upright: the lights start once the phone turns
  const uiRef = useRef(ui)
  const hud = useRef<HudHandle>(null)
  const hudClock = useRef(0)
  const ghostTag = useRef<HTMLDivElement>(null)
  const pauseDialog = useRef<HTMLDialogElement>(null)
  const controlsDialog = useRef<HTMLDialogElement>(null)
  const runItBack = useRef<HTMLButtonElement>(null)

  // device checks after hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-time device check after hydration
    setStatus(hasWebgl2() ? 'loading' : 'nowebgl')
    setMotion(!reducedMotion())
    setKeyboard(hasKeyboard())
  }, [])

  const pushUi = useCallback((next: Ui) => {
    const prev = uiRef.current
    if (prev.lit === next.lit && prev.phase === next.phase && prev.go === next.go && prev.jump === next.jump && prev.result === next.result) return
    uiRef.current = next
    setUi(next)
    if (prev.phase === 'grid' && next.phase === 'running') buzz(40) // lights out
    // a finished lap: keep it if it's the best on this device
    if (next.result && !prev.result) {
      setRecord(recordLap(next.result.totalMs))
      buzz([60, 40, 60])
    }
  }, [])

  // One rendered frame: advance the physics at its fixed step, then what the scene and the clock show.
  const onFrame = useCallback(
    (dt: number) => {
      if (!running.current) return
      const keys = inputFromKeys(taps.current.size ? new Set([...held.current, ...taps.current]) : held.current)
      const onPads = padTaps.current.size ? new Set([...pads.current, ...padTaps.current]) : pads.current
      const input = withTouch(keys, onPads, boostUntil.current, loop.current.state.clock)
      if (input.brake > 0) boostUntil.current = 0 // braking cancels a BST tap's Boost
      const { loop: next, alpha } = advance(c, loop.current, input, dt)
      if (next.state !== loop.current.state) {
        // a step has seen them
        taps.current.clear()
        padTaps.current.clear()
      }
      loop.current = next
      frame.current = frameAt(c, next.prev, next.state, alpha)
      const s = next.state
      hudClock.current += dt
      if (hudClock.current >= HUD_INTERVAL_S || s.phase !== uiRef.current.phase) {
        hudClock.current = 0
        const view = hudView(c, s, input)
        hud.current?.update(view)
        touchPads.current?.update(view)
      }
      pushUi({
        lit: lightsLit(s),
        jump: s.jumpStart,
        phase: s.phase,
        go: s.phase !== 'grid' && s.clock - s.lightsOutAt < GO_SHOWN_S,
        result: s.result,
      })
    },
    [c, pushUi],
  )

  const pause = useCallback(() => {
    if (!running.current || uiRef.current.result) return
    running.current = false
    held.current.clear()
    taps.current.clear()
    pads.current.clear()
    padTaps.current.clear()
    boostUntil.current = 0
    setPaused(true)
  }, [])

  const resume = useCallback(() => {
    setPaused(false)
    running.current = true
  }, [])

  const restart = useCallback(() => {
    loop.current = startLoop(createRace(newSeed()))
    frame.current = frameAt(c, loop.current.state, loop.current.state, 0)
    snap.current += 1
    held.current.clear()
    taps.current.clear()
    pads.current.clear()
    padTaps.current.clear()
    boostUntil.current = 0
    uiRef.current = { lit: 0, phase: 'grid', go: false, jump: false, result: null }
    setUi(uiRef.current)
    hud.current?.update(hudView(c, loop.current.state, inputFromKeys(held.current)))
    setRecord(countAttempt())
    setPaused(false)
    running.current = true
  }, [c])

  // keys: the game's own (no page scroll), Esc pauses; leaving the tab or the window pauses
  useEffect(() => {
    if (status !== 'ready') return
    const down = (e: KeyboardEvent) => {
      if (e.code === PAUSE_KEY) {
        // the same Escape would cancel the sheet it just opened
        if (!pauseDialog.current?.open && !controlsDialog.current?.open) {
          e.preventDefault()
          pause()
        }
        return
      }
      if (!GAME_KEYS.has(e.code) || !running.current) return
      e.preventDefault()
      held.current.add(e.code)
      taps.current.add(e.code)
    }
    const up = (e: KeyboardEvent) => held.current.delete(e.code)
    const hidden = () => document.visibilityState === 'hidden' && pause()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', pause)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', pause)
      document.removeEventListener('visibilitychange', hidden)
    }
  }, [status, pause])

  // Right Ctrl is a brake: Right Ctrl + W closes the tab, and no page can stop that shortcut. While a lap
  // is on, the browser asks first.
  const lapOn = ui.phase === 'running' && !ui.result
  useEffect(() => {
    if (!lapOn) return
    const ask = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', ask)
    return () => window.removeEventListener('beforeunload', ask)
  }, [lapOn])

  // the pause sheet is a modal dialog: focus moves in, Esc resumes
  useEffect(() => {
    const d = pauseDialog.current
    if (!d) return
    const show = paused && !rotate
    if (show && !d.open) d.showModal()
    if (!show && d.open) d.close()
  }, [paused, rotate])

  // turned upright mid-lap: pause (the sheet waits behind the rotate screen); turned back before the start:
  // the lights begin
  useEffect(() => {
    if (rotate) pause()
    else if (forLandscape.current && status === 'ready') {
      forLandscape.current = false
      running.current = true
    }
  }, [rotate, status, pause])

  // while driving, the stage owns the screen: the header hides (it comes back on pause), no page scroll.
  // The finish (board 14) has its own bar, so the header stays away then too
  useEffect(() => {
    if (status === 'checking' || status === 'nowebgl') return
    const html = document.documentElement
    window.scrollTo(0, 0)
    // the rotate screen has its own home link and close button: the header stays away
    html.dataset.drive = paused && !rotate && !ui.result ? 'paused' : 'on'
    return () => {
      delete html.dataset.drive
    }
  }, [status, paused, ui.result, rotate])

  // the controls sheet: a modal dialog (over the pause sheet when opened from it)
  useEffect(() => {
    const d = controlsDialog.current
    if (!d) return
    if (controls !== 'off' && !d.open) d.showModal()
    if (controls === 'off' && d.open) d.close()
  }, [controls])

  // Start (the first time), or Back to the pause sheet
  const closeControls = useCallback(() => {
    if (controls === 'first') running.current = true
    setControls('off')
  }, [controls])

  useEffect(() => {
    if (ui.result) runItBack.current?.focus()
  }, [ui.result])

  const onReady = useCallback(() => {
    setStatus('ready')
    const record = countAttempt() // the first attempt starts with the lights
    setRecord(record)
    // the first time on this device, with a keyboard, the controls come first; the lights wait for Start
    if (hasKeyboard() && record.attempts <= 1) setControls('first')
    else if (window.matchMedia(ROTATE_QUERY).matches) forLandscape.current = true
    else running.current = true
  }, [])


  if (status === 'nowebgl') {
    return <p className={styles.noWebgl}>{driveCopy.noWebgl(formatLap(messenger.lapMs))}</p>
  }

  const result = ui.result

  return (
    <>
      <div className={styles.stage} data-status={status} data-phase={ui.phase} data-compact={compact ? '' : undefined} inert={rotate && !result}>
        <div className={styles.sky} aria-hidden="true" />
        {status !== 'checking' && (
          <DriveScene
            frame={frame}
            onFrame={onFrame}
            reducedMotion={!motion}
            snap={snap}
            onReady={onReady}
            ghostTag={ghostTag}
            paused={paused}
            label={driveCopy.sceneLabel}
          />
        )}

        {preview && <p className={`label ${styles.banner}`}>{driveCopy.previewBanner}</p>}

        {status === 'ready' && <Hud ref={hud} attempt={Math.max(1, record.attempts)} bestMs={record.bestMs} tagRef={ghostTag} compact={compact} />}

        {status === 'ready' && touch && (
          <TouchControls
            ref={touchPads}
            held={pads}
            taps={padTaps}
            onBoost={() => (boostUntil.current = boostTap(boostUntil.current, loop.current.state.clock))}
          />
        )}

        <button type="button" className={styles.pauseButton} onClick={pause} aria-label={driveCopy.pause.button}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
          </svg>
        </button>

        {status === 'ready' && (ui.phase === 'grid' || ui.go) && (
          <div
            className={styles.lights}
            data-go={ui.phase !== 'grid' ? '' : undefined}
            data-jump={ui.jump ? '' : undefined}
            role="status"
            aria-label={[driveCopy.lightsLabel(ui.lit), ui.jump ? driveCopy.jumpLabel(T.jumpPenaltyS) : ''].join(' ').trim()}
          >
            <span className={styles.lamps} aria-hidden="true">
              {Array.from({ length: T.lightsCount }, (_, i) => (
                <i key={i} data-on={ui.phase === 'grid' && i < ui.lit ? '' : undefined} />
              ))}
            </span>
            <span className={`label ${styles.caption}`}>{ui.jump ? driveCopy.lights.jump(T.jumpPenaltyS) : ui.phase === 'grid' ? driveCopy.lights.wait : driveCopy.lights.go}</span>
          </div>
        )}

        <p className={styles.keys} aria-hidden="true">
          {driveCopy.keys.map((k) => (
            <span key={k.label} className={styles.key}>
              {k.keys.map((key) => (
                <kbd key={key}>{key}</kbd>
              ))}
              {k.label}
            </span>
          ))}
        </p>

        {status !== 'ready' && <p className={`label ${styles.loading}`}>{driveCopy.loading}</p>}

        <dialog
          ref={controlsDialog}
          className={`${styles.sheet} ${styles.controls}`}
          aria-labelledby="drive-controls"
          onCancel={(e) => (e.preventDefault(), closeControls())}
        >
          {controls === 'first' && <p className={`label ${styles.title}`}>{driveCopy.controls.kicker}</p>}
          <h2 id="drive-controls" className={`display ${styles.sheetTitle}`}>
            {driveCopy.controls.title}
          </h2>
          {controls !== 'off' && (
            <>
              <ControlsKeyboard />
              <ControlsList />
            </>
          )}
          <p className={styles.tip}>{driveCopy.controls.startTip(T.jumpPenaltyS)}</p>
          <p className={styles.tip}>{driveCopy.controls.tip}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={closeControls} autoFocus>
              {controls === 'paused' ? driveCopy.controls.back : driveCopy.controls.start}
            </button>
            {controls === 'first' && (
              <Link href="/" className={styles.secondary}>
                {driveCopy.pause.exit}
              </Link>
            )}
          </div>
        </dialog>

        <dialog ref={pauseDialog} className={styles.sheet} aria-labelledby="drive-paused" onCancel={(e) => (e.preventDefault(), resume())}>
          <h2 id="drive-paused" className={`display ${styles.sheetTitle}`}>
            {driveCopy.pause.title}
          </h2>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={resume} autoFocus>
              {driveCopy.pause.resume}
            </button>
            <button type="button" className={styles.secondary} onClick={restart}>
              {driveCopy.pause.restart}
            </button>
            {keyboard && (
              <button type="button" className={styles.secondary} onClick={() => setControls('paused')}>
                {driveCopy.pause.controls}
              </button>
            )}
            <Link href="/" className={styles.secondary}>
              {driveCopy.pause.exit}
            </Link>
          </div>
        </dialog>

        {result && <Result lap={sharedFromResult(result, record.attempts)} mode="finish" onRunItBack={restart} firstRef={runItBack} />}
      </div>
      {/* after the finish the rotate screen stays away: the result works either way up */}
      {rotate && !result && status !== 'checking' && <Rotate />}
    </>
  )
}
