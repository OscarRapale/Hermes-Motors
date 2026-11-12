'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { messenger } from '@/content/facts'
import { driveCopy } from '@/content/copy/drive'
import { GAME_KEYS, PAUSE_KEY, inputFromKeys } from '@/lib/drive/keys'
import { frameAt, type Frame } from '@/lib/drive/pose'
import { circuit } from '@/lib/game/circuit'
import { advance, startLoop, type Loop } from '@/lib/game/loop'
import { createRace, lapTime, lightsLit, liveGap, type Phase } from '@/lib/game/race'
import { formatGap, formatLap, gapsToMessenger, type LapResult } from '@/lib/game/timing'
import { T } from '@/lib/game/tuning'
import styles from './Game.module.css'

const DriveScene = dynamic(() => import('../DriveScene/DriveScene'), { ssr: false })

const GO_SHOWN_S = 1.2 // "LIGHTS OUT AND AWAY" stays up this long
const newSeed = () => Math.floor(Math.random() * 2 ** 31)
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const hasWebgl2 = () => {
  try {
    return document.createElement('canvas').getContext('webgl2') !== null
  } catch {
    return false
  }
}

/** Lap time as on the board: m:ss.mmm, ticking with the lap; a dash before the line */
const lapClock = (t: number | null) => (t === null ? '—' : formatLap(Math.floor(t * 1000)))

type Ui = { lit: number; phase: Phase; go: boolean; result: LapResult | null }

/**
 * The test drive (ARCHITECTURE §7, board 13): the full-screen stage, the fixed-step loop, the keys, the
 * start, pause and the result. The HUD comes with the next step (M3 PR 4); this shows the lap clock and
 * the gap to the messenger.
 */
export function Game({ preview }: { preview: boolean }) {
  const c = circuit()
  const [status, setStatus] = useState<'checking' | 'nowebgl' | 'loading' | 'ready'>('checking')
  const [paused, setPaused] = useState(false)
  const [ui, setUi] = useState<Ui>({ lit: 0, phase: 'grid', go: false, result: null })
  const [motion, setMotion] = useState(true)

  // the first attempt, made once (the lights-out delay is random)
  const [first] = useState(() => {
    const l = startLoop(createRace(newSeed()))
    return { loop: l, frame: frameAt(c, l.state, l.state, 0) }
  })
  const loop = useRef<Loop>(first.loop)
  const frame = useRef<Frame>(first.frame)
  const held = useRef(new Set<string>())
  const snap = useRef(0)
  const running = useRef(false) // ready and not paused: the loop advances
  const uiRef = useRef(ui)
  const clockEl = useRef<HTMLSpanElement>(null)
  const gapEl = useRef<HTMLSpanElement>(null)
  const pauseDialog = useRef<HTMLDialogElement>(null)
  const runItBack = useRef<HTMLButtonElement>(null)

  // device checks after hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-time device check after hydration
    setStatus(hasWebgl2() ? 'loading' : 'nowebgl')
    setMotion(!reducedMotion())
  }, [])

  const pushUi = useCallback((next: Ui) => {
    const prev = uiRef.current
    if (prev.lit === next.lit && prev.phase === next.phase && prev.go === next.go && prev.result === next.result) return
    uiRef.current = next
    setUi(next)
  }, [])

  // One rendered frame: advance the physics at its fixed step, then what the scene and the clock show.
  const onFrame = useCallback(
    (dt: number) => {
      if (!running.current) return
      const { loop: next, alpha } = advance(c, loop.current, inputFromKeys(held.current), dt)
      loop.current = next
      frame.current = frameAt(c, next.prev, next.state, alpha)
      const s = next.state
      if (clockEl.current) clockEl.current.textContent = lapClock(lapTime(s))
      if (gapEl.current) {
        const gap = liveGap(c, s)
        gapEl.current.textContent = gap === null ? '—' : formatGap(Math.round(gap * 1000))
        if (gap !== null && gap < 0) gapEl.current.dataset.ahead = ''
        else delete gapEl.current.dataset.ahead
      }
      pushUi({
        lit: lightsLit(s),
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
    uiRef.current = { lit: 0, phase: 'grid', go: false, result: null }
    setUi(uiRef.current)
    if (clockEl.current) clockEl.current.textContent = lapClock(null)
    if (gapEl.current) gapEl.current.textContent = '—'
    setPaused(false)
    running.current = true
  }, [c])

  // keys: the game's own (no page scroll), Esc pauses; leaving the tab or the window pauses
  useEffect(() => {
    if (status !== 'ready') return
    const down = (e: KeyboardEvent) => {
      if (e.code === PAUSE_KEY) {
        // the same Escape would cancel the sheet it just opened
        if (!pauseDialog.current?.open) {
          e.preventDefault()
          pause()
        }
        return
      }
      if (!GAME_KEYS.has(e.code) || !running.current) return
      e.preventDefault()
      held.current.add(e.code)
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

  // the pause sheet is a modal dialog: focus moves in, Esc resumes
  useEffect(() => {
    const d = pauseDialog.current
    if (!d) return
    if (paused && !d.open) d.showModal()
    if (!paused && d.open) d.close()
  }, [paused])

  // while driving, the stage owns the screen: the header hides (it comes back on pause), no page scroll
  useEffect(() => {
    if (status === 'checking' || status === 'nowebgl') return
    const html = document.documentElement
    window.scrollTo(0, 0)
    html.dataset.drive = paused || ui.result ? 'paused' : 'on'
    return () => {
      delete html.dataset.drive
    }
  }, [status, paused, ui.result])

  useEffect(() => {
    if (ui.result) runItBack.current?.focus()
  }, [ui.result])

  const onReady = useCallback(() => {
    setStatus('ready')
    running.current = true
  }, [])

  if (status === 'nowebgl') {
    return <p className={styles.noWebgl}>{driveCopy.noWebgl(formatLap(messenger.lapMs))}</p>
  }

  const result = ui.result
  const gaps = result ? gapsToMessenger(result) : null

  return (
    <div className={styles.stage} data-status={status} data-phase={ui.phase}>
      <div className={styles.sky} aria-hidden="true" />
      {status !== 'checking' && (
        <DriveScene
          frame={frame}
          onFrame={onFrame}
          reducedMotion={!motion}
          snap={snap}
          onReady={onReady}
          paused={paused}
          label={driveCopy.sceneLabel}
        />
      )}

      {preview && <p className={`label ${styles.banner}`}>{driveCopy.previewBanner}</p>}

      <div className={`${styles.panel} ${styles.timing}`}>
        <p className={`label ${styles.title}`}>{driveCopy.hud.title}</p>
        <span ref={clockEl} className={`tnum ${styles.clock}`}>
          {lapClock(null)}
        </span>
        <p className={`label ${styles.row}`}>
          <span>{driveCopy.hud.messenger}</span>
          <span className="tnum">{formatLap(messenger.lapMs)}</span>
        </p>
        <p className={`label ${styles.row}`}>
          <span>{driveCopy.hud.delta}</span>
          <span ref={gapEl} className={`tnum ${styles.gap}`}>
            —
          </span>
        </p>
      </div>

      <button type="button" className={styles.pauseButton} onClick={pause} aria-label={driveCopy.pause.button}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
        </svg>
      </button>

      {status === 'ready' && (ui.phase === 'grid' || ui.go) && (
        <div className={styles.lights} role="status" aria-label={driveCopy.lightsLabel(ui.lit)}>
          <span className={styles.lamps} aria-hidden="true">
            {Array.from({ length: T.lightsCount }, (_, i) => (
              <i key={i} data-on={ui.phase === 'grid' && i < ui.lit ? '' : undefined} />
            ))}
          </span>
          <span className={`label ${styles.caption}`}>{ui.phase === 'grid' ? driveCopy.lights.wait : driveCopy.lights.go}</span>
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
          <Link href="/" className={styles.secondary}>
            {driveCopy.pause.exit}
          </Link>
        </div>
      </dialog>

      {result && gaps && (
        <section className={`${styles.panel} ${styles.finish}`} aria-labelledby="drive-finish" aria-live="polite">
          <p className={`label ${styles.title}`}>{driveCopy.finish.complete}</p>
          <h2 id="drive-finish" className={`display ${styles.finishTitle}`}>
            {(gaps.lapMs < 0 ? driveCopy.finish.won : driveCopy.finish.lost).map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
          <p className={`tnum ${styles.finishGap}`} data-ahead={gaps.lapMs < 0 ? '' : undefined}>
            {formatGap(gaps.lapMs)} S
          </p>
          <p className={`label tnum ${styles.row}`}>
            {driveCopy.finish.you} {formatLap(result.totalMs)} · {driveCopy.finish.messenger} {formatLap(messenger.lapMs)}
          </p>
          {result.penaltyMs > 0 && <p className={`label ${styles.row}`}>{driveCopy.finish.jumpStart}</p>}
          <div className={styles.actions}>
            <button ref={runItBack} type="button" className={styles.primary} onClick={restart}>
              {driveCopy.finish.runItBack}
            </button>
            <Link href="/" className={styles.secondary}>
              {driveCopy.pause.exit}
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
