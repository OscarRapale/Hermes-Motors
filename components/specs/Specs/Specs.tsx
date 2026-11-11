'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import layout from '@/content/specs-layout.json'
import { useClock } from '@/lib/clock/client'
import { canRunLiveCar, canvasPlacement } from '@/lib/specs/live'
import { ArrowIcon, LockIcon } from '@/components/site/icons/icons'
import { testDriveCopy } from '@/content/copy/shared'
import { chapters, powerPanel, specsCopy, wheelbase, type Callout, type SpecFigure } from '@/content/copy/specs'
import { driveHref, prefetchFor } from '@/content/nav'
import { easeOut } from '@/lib/motion'
import {
  CHAPTERS,
  CHAPTER_FRAME,
  COUNT_DELAY_MS,
  COUNT_MS,
  FRAME_SIZE,
  LAST_FRAME,
  PIVOT,
  PLAY_STEP_MS,
  TEXT_WIPE_MS,
  anchorsAt,
  chapterAt,
  frameOpacity,
  placeInBox,
  scrollingProgress,
  sectionProgress,
  tweenMs,
  wipeClip,
  wipeEdgeX,
  zoomAt,
  PHONE_ZOOM_OUT_BY,
} from '@/lib/specs/chapters'
import styles from './Specs.module.css'

// The frame stack: First Light by day, Before Dawn at night (Decision D20, same crop and anchors).
const frameSrc = (set: 'day' | 'night', i: number) =>
  `/images/${set === 'day' ? 'specs' : 'specs-night'}/hm27-specs-${String(i).padStart(2, '0')}.webp`
const INDICES = Array.from({ length: LAST_FRAME + 1 }, (_, i) => i)
const PIVOT_ORIGIN = `${(100 * PIVOT.x) / FRAME_SIZE.w}% ${(100 * PIVOT.y) / FRAME_SIZE.h}%`
const PLACE = canvasPlacement(layout.crop)
const SpecsScene = dynamic(() => import('../SpecsScene/SpecsScene'), { ssr: false })
const isPhoneWidth = () => window.matchMedia('(max-width: 899.98px)').matches
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fmt = (value: number, decimals = 0) => (decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-US'))

function Figure({ figure }: { figure: SpecFigure }) {
  const value = (
    <b className={styles.figValue}>
      <span data-count={figure.value} data-decimals={figure.decimals ?? 0}>
        {fmt(figure.value, figure.decimals)}
      </span>
      <small>{figure.unit}</small>
    </b>
  )
  return (
    <div className={styles.fig}>
      {figure.sealed ? (
        <>
          <span className="day-only">{value}</span>
          <span className={`night-only ${styles.sealedValue}`}>
            <span className={styles.sealedBar} aria-hidden="true" />
            <span className="visually-hidden">{specsCopy.sealed}</span>
          </span>
        </>
      ) : (
        value
      )}
      <span className={`label ${styles.figLabel}`}>{figure.label}</span>
    </div>
  )
}

function PowerPanel() {
  const [combustion, electric] = powerPanel.split
  return (
    <div className={`${styles.glass} ${styles.power}`}>
      <div className={styles.powerTop}>
        <span className={`label ${styles.figLabel}`}>{powerPanel.title}</span>
        <b className={`${styles.figValue} day-only`}>
          <span data-count={powerPanel.value}>{fmt(powerPanel.value)}</span>
          <small>{powerPanel.unit}</small>
        </b>
        <span className={`night-only label ${styles.figLabel}`}>{specsCopy.sealed}</span>
      </div>
      <div className={styles.powerBar} aria-hidden="true">
        <i className="day-only" data-bar={combustion} style={{ width: `${combustion}%` }} />
        <i className="day-only" data-bar={electric} style={{ width: `${electric}%` }} />
      </div>
      <div className={`label day-only ${styles.powerSplit}`}>
        <span>{powerPanel.combustion}</span>
        <span className={styles.electric}>{powerPanel.electric}</span>
      </div>
      <div className={styles.powerFoot}>
        {[powerPanel.energy, powerPanel.fuel].map((f) => (
          <div key={f.label} className={styles.fig}>
            <b className={`${styles.figValue} ${styles.figSmall}`}>
              <span data-count={f.value} data-decimals={'decimals' in f ? f.decimals : 0}>
                {fmt(f.value, 'decimals' in f ? f.decimals : 0)}
              </span>
              <small>{f.unit}</small>
            </b>
            <span className={`label ${styles.figLabel}`}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CalloutChip({ callout, frame, zoomOutBy }: { callout: Callout; frame: number; zoomOutBy: number }) {
  const point = anchorsAt(frame)[callout.anchor]
  const { x, y } = placeInBox(point, frame, zoomAt(frame, undefined, zoomOutBy))
  return (
    <span
      className={`${styles.callout} ${styles[callout.place]} ${callout.placePhone ? styles[`phone-${callout.placePhone}`] : ''} ${callout.sealed ? 'day-only' : ''}`}
      style={{ '--local-x': `${x}%`, '--local-y': `${y}%` } as CSSProperties}
    >
      <i className={styles.dot} />
      <b className={`label ${styles.chip}`}>
        <span className={styles.chipDesktop}>{callout.text}</span>
        <span className={styles.chipPhone}>{callout.phone}</span>
      </b>
    </span>
  )
}

/**
 * The specs section (ARCHITECTURE §6, docs/design/03-specs.md, board 11): five viewport-heights of
 * scroll, a pinned stage; scroll picks the chapter, the car comes apart, the text wipes in, the
 * figures count up, the callouts settle. The car is live 3D where the device can (WebGL2, no data
 * saver), loaded one viewport early; otherwise the 19-frame stack. Both share one frame position and
 * one zoom layer, so they line up with each other and with the callouts. At night: the Before Dawn
 * livery and frames, and the Before Dawn figures stay sealed (Decisions D19, D20).
 */
export function Specs() {
  const root = useRef<HTMLElement>(null)
  const framesLayer = useRef<HTMLDivElement>(null)
  // the frame stack's images: day set at 0…18, night set at 19…37
  const imgs = useRef<(HTMLImageElement | null)[]>([])
  const [chapter, setChapter] = useState(0)
  const [settled, setSettled] = useState(true)
  const [playing, setPlaying] = useState(false)
  // which car: undecided on the server, then live 3D or the frame stack
  const [car, setCar] = useState<'pending' | 'live' | 'frames'>('pending')
  const [near, setNear] = useState(false)
  const [onScreen, setOnScreen] = useState(false)
  const [liveReady, setLiveReady] = useState(false)
  const [lod, setLod] = useState<'hero' | 'game'>('hero')
  // phones zoom out by frame 6, desktops over the whole run (03-specs)
  const [zoomOutBy, setZoomOutBy] = useState(LAST_FRAME)
  const zoomOutByRef = useRef<number>(LAST_FRAME)
  // phones: the chapters already shown (a bitmask) stay in the page as they scroll away
  const [seen, setSeen] = useState(0)
  const seenRef = useRef(0)
  const night = useClock().theme === 'night'
  const current = useRef(0)
  const frame = useRef(0)
  const tweenFrame = useRef(0)
  const playTimer = useRef(0)
  const playingRef = useRef(false)
  // the text wipe to run: which chapter, and a counter so the same chapter can wipe again
  const [wipe, setWipe] = useState<{ i: number; n: number } | null>(null)

  const drawFrames = useCallback((f: number) => {
    frame.current = f
    imgs.current.forEach((img, k) => {
      if (img) img.style.opacity = String(frameOpacity(f, k % (LAST_FRAME + 1)))
    })
    if (framesLayer.current) framesLayer.current.style.transform = `scale(${zoomAt(f, undefined, zoomOutByRef.current)})`
  }, [])

  const goTo = useCallback(
    (next: number, opts: { jump?: boolean } = {}) => {
      if (next === current.current && !opts.jump) return
      current.current = next
      cancelAnimationFrame(tweenFrame.current)
      const to = CHAPTER_FRAME[next]
      if (opts.jump || reducedMotion()) {
        drawFrames(to)
        setChapter(next)
        setSettled(true)
        return
      }
      // desktop: the chapters swap in place, so the new one wipes in (phones: see the scroll measure)
      if (!isPhoneWidth()) setWipe((w) => ({ i: next, n: (w?.n ?? 0) + 1 }))
      setChapter(next)
      setSettled(false)
      const from = frame.current
      const duration = tweenMs(from, next)
      const start = performance.now()
      const step = () => {
        const t = Math.min(1, (performance.now() - start) / duration)
        drawFrames(from + (to - from) * easeOut(t))
        if (t < 1) tweenFrame.current = requestAnimationFrame(step)
        else setSettled(true)
      }
      tweenFrame.current = requestAnimationFrame(step)
    },
    [drawFrames],
  )

  // Scroll → chapter, with hysteresis. Jumps (no tween) on first measure, e.g. a /#specs-3 link.
  useEffect(() => {
    let ticking = false
    let first = true
    const measure = () => {
      ticking = false
      const el = root.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const top = rect.top + window.scrollY
      let progress: number
      if (isPhoneWidth()) {
        // the text scrolls: a chapter starts as its text comes into view (slots may be taller than the screen)
        const slot = (el.firstElementChild as HTMLElement | null)?.offsetHeight ?? window.innerHeight
        const text = el.querySelector<HTMLElement>('[data-chapter="0"]')
        const textTop = text ? text.getBoundingClientRect().top - rect.top : 0
        progress = scrollingProgress(window.scrollY, top, slot, textTop, window.innerHeight)
        // a chapter's text shows from the moment it scrolls into view above the rail, wiping in the
        // first time, and stays (so the screen is never empty between chapters)
        const railTop = el.querySelector('nav')?.getBoundingClientRect().top ?? window.innerHeight
        let fresh = -1
        el.querySelectorAll<HTMLElement>('[data-chapter]').forEach((a, i) => {
          if (seenRef.current & (1 << i)) return
          const r = a.getBoundingClientRect()
          if (r.top < railTop && r.bottom > 0) {
            seenRef.current |= 1 << i
            fresh = i
          }
        })
        if (fresh >= 0) {
          const shown = fresh
          setSeen(seenRef.current)
          if (!first && !reducedMotion()) setWipe((w) => ({ i: shown, n: (w?.n ?? 0) + 1 }))
        }
      } else progress = sectionProgress(window.scrollY, top, rect.height, window.innerHeight)
      const next = chapterAt(progress, current.current)
      if (first) {
        first = false
        goTo(next, { jump: true })
      } else goTo(next)
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(measure)
      }
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(tweenFrame.current)
    }
  }, [goTo])

  // A chapter's text wipes in (450 ms, Redline edge) and its figures count up (800 ms after 150).
  useLayoutEffect(() => {
    if (!wipe) return
    const el = root.current?.querySelector<HTMLElement>(`[data-chapter="${wipe.i}"]`)
    if (!el) return
    const copy = el.querySelector<HTMLElement>('[data-text-wipe]')
    const edge = el.querySelector<HTMLElement>('[data-edge]')
    const counts = [...el.querySelectorAll<HTMLElement>('[data-count]')]
    const bars = [...el.querySelectorAll<HTMLElement>('[data-bar]')]
    const width = copy?.offsetWidth ?? 400
    const slant = zoomOutByRef.current === PHONE_ZOOM_OUT_BY ? 80 : 96 // the phone board's wipe is a little steeper
    let raf = 0
    const start = performance.now()
    const step = () => {
      const elapsed = performance.now() - start
      const t = Math.min(1, elapsed / TEXT_WIPE_MS)
      if (copy) copy.style.clipPath = wipeClip(t, width, slant)
      if (edge) {
        edge.style.opacity = t > 0 && t < 1 ? '1' : '0'
        edge.style.transform = `translateX(${wipeEdgeX(t, width, slant)}px) skewX(calc(-1 * var(--angle)))`
      }
      const n = easeOut(Math.min(1, Math.max(0, (elapsed - COUNT_DELAY_MS) / COUNT_MS)))
      for (const c of counts) c.textContent = fmt(Number(c.dataset.count) * n, Number(c.dataset.decimals ?? 0))
      for (const b of bars) b.style.width = `${Number(b.dataset.bar) * n}%`
      if (elapsed < COUNT_DELAY_MS + COUNT_MS || t < 1) raf = requestAnimationFrame(step)
    }
    step()
    return () => {
      cancelAnimationFrame(raf)
      if (copy) copy.style.clipPath = 'none'
      if (edge) edge.style.opacity = '0'
      for (const c of counts) c.textContent = fmt(Number(c.dataset.count), Number(c.dataset.decimals ?? 0))
      for (const b of bars) b.style.width = `${b.dataset.bar}%`
    }
  }, [wipe])

  // Which car this device gets (client only): live 3D, or the frame stack.
  useEffect(() => {
    const live = canRunLiveCar()
    const phone = isPhoneWidth()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-time device check after hydration
    setCar(live ? 'live' : 'frames')
    setLod(phone ? 'game' : 'hero')
    zoomOutByRef.current = phone ? PHONE_ZOOM_OUT_BY : LAST_FRAME
    setZoomOutBy(zoomOutByRef.current)
  }, [])

  // When the frame stack mounts (fallback devices), draw it at the current frame position.
  useEffect(() => {
    if (car === 'frames') drawFrames(frame.current)
  }, [car, drawFrames])

  // Load the live car one viewport early (rules/three.md); run it only while the section is on screen.
  useEffect(() => {
    const el = root.current
    if (!el || car !== 'live') return
    const nearBy = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        // dynamic: a static import of the car package would put three.js in the page's first load
        void import('@/components/hermes/HermesCar').then((m) => m.preloadHermesCar(lod))
        setNear(true)
        nearBy.disconnect()
      },
      { rootMargin: '100% 0px' },
    )
    const visible = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    nearBy.observe(el)
    visible.observe(el)
    return () => {
      nearBy.disconnect()
      visible.disconnect()
    }
  }, [car, lod])

  // Board 11 underlines HM-27 in the header while the specs are on screen (a location, not a page).
  useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      document.querySelectorAll('header a[href="/#specs"]').forEach((a) => {
        if (entry.isIntersecting) a.setAttribute('aria-current', 'location')
        else if (a.getAttribute('aria-current') === 'location') a.removeAttribute('aria-current')
      })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const scrollToChapter = useCallback((c: number) => {
    const slot = document.getElementById(`specs-${c + 1}`)
    if (!slot) return
    window.scrollTo({ top: slot.getBoundingClientRect().top + window.scrollY, behavior: reducedMotion() ? 'auto' : 'smooth' })
  }, [])

  const stopPlay = useCallback(() => {
    window.clearTimeout(playTimer.current)
    playingRef.current = false
    setPlaying(false)
  }, [])

  // "Play the scroll": one chapter every 2.7 s from the first; any scroll, key or touch stops it.
  const togglePlay = () => {
    if (playingRef.current) return stopPlay()
    playingRef.current = true
    setPlaying(true)
    let k = 0
    const next = () => {
      if (!playingRef.current) return
      scrollToChapter(k)
      k += 1
      playTimer.current = window.setTimeout(k < CHAPTERS ? next : stopPlay, PLAY_STEP_MS)
    }
    next()
  }

  useEffect(() => {
    if (!playing) return
    const stop = () => stopPlay()
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) stopPlay()
    }
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
      window.removeEventListener('keydown', onKey)
    }
  }, [playing, stopPlay])

  useEffect(() => () => window.clearTimeout(playTimer.current), [])

  const settledFrame = CHAPTER_FRAME[chapter]
  const wb = anchorsAt(0)
  const wbMid = placeInBox([(wb.wbFront[0] + wb.wbRear[0]) / 2, (wb.wbFront[1] + wb.wbRear[1]) / 2], 0)

  return (
    <section ref={root} id="specs" aria-label={specsCopy.sectionLabel} className={styles.specs}>
      {chapters.map((c, i) => (
        <div key={c.number} id={`specs-${i + 1}`} className={styles.slot} aria-hidden="true" />
      ))}

      <div className={styles.stage}>
        <div className={styles.bg} aria-hidden="true" />
        <svg className={styles.grid} viewBox="0 0 1440 560" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
          <path d="M720,0 L-1680,560 M720,0 L-1200,560 M720,0 L-720,560 M720,0 L-240,560 M720,0 L240,560 M720,0 L720,560 M720,0 L1200,560 M720,0 L1680,560 M720,0 L2160,560 M720,0 L2640,560 M720,0 L3120,560 M-400,6.9 L1840,6.9 M-400,27.7 L1840,27.7 M-400,62.2 L1840,62.2 M-400,110.6 L1840,110.6 M-400,172.8 L1840,172.8 M-400,248.9 L1840,248.9 M-400,338.8 L1840,338.8 M-400,442.5 L1840,442.5" />
        </svg>
      </div>

      {/* desktop: pinned over the stage, the chapters swap in place (board 11); phones: in the page,
          each chapter in its slot, scrolling under the car (ARCHITECTURE §6) */}
      <div className={styles.text}>
        <div className={styles.column}>
          {chapters.map((c, i) => {
            const active = i === chapter
            return (
              <article
                key={c.number}
                data-chapter={i}
                data-active={active ? '' : undefined}
                data-seen={seen & (1 << i) ? '' : undefined}
                className={styles.chapter}
                style={{ '--local-i': i } as CSSProperties}
              >
                <div className={styles.copyWrap}>
                  <div className={styles.copy} data-text-wipe>
                    <p className={`label ${styles.kicker}`}>
                      <span className={styles.kickerNum}>
                        {c.number} {specsCopy.of}
                      </span>{' '}
                      · {c.label}
                    </p>
                    <h2 className={`display ${styles.h2} ${c.night ? 'day-only' : ''}`}>
                      <span>{c.headline[0]}</span>
                      <span className={styles.dim}>{c.headline[1]}</span>
                      <span>{c.headline[2]}</span>
                    </h2>
                    {c.night && (
                      <h2 className={`display ${styles.h2} night-only`}>
                        <span>{c.night.headline[0]}</span>
                        <span className={styles.dim}>{c.night.headline[1]}</span>
                        <span>{c.night.headline[2]}</span>
                      </h2>
                    )}
                    <p className={`${styles.body} ${c.night ? 'day-only' : ''}`}>{c.body}</p>
                    {c.night && <p className={`${styles.body} night-only`}>{c.night.body}</p>}
                  </div>
                  <span className={styles.edge} data-edge aria-hidden="true" />
                </div>
                {c.figures.length > 0 ? (
                  <div className={`${styles.glass} ${styles.figures}`}>
                    {c.figures.map((f, k) => (
                      <div key={f.label} className={styles.figCell}>
                        {k > 0 && <span className={styles.divider} aria-hidden="true" />}
                        <Figure figure={f} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <PowerPanel />
                )}
                {i === CHAPTERS - 1 && (
                  // board 11: between the text and the panel; board 24 (phone): last, full width
                  <div className={styles.ctaRow}>
                    <Link
                      href={driveHref}
                      prefetch={prefetchFor(driveHref)}
                      className={`${styles.cta} day-only`}
                      tabIndex={active ? 0 : -1}
                    >
                      {specsCopy.cta}
                      <span className={styles.ctaKnob} aria-hidden="true">
                        <ArrowIcon />
                      </span>
                    </Link>
                    {/* at night the drive is locked, as in the header (D19) */}
                    <Link
                      href={driveHref}
                      prefetch={prefetchFor(driveHref)}
                      className={`${styles.ctaLocked} night-only`}
                      tabIndex={active ? 0 : -1}
                    >
                      <LockIcon className={styles.lockIcon} />
                      {testDriveCopy.locked}
                    </Link>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>

      <div className={styles.front}>
        <p className={styles.ghost} aria-hidden="true">
          {chapters[chapter].number}
        </p>

        <div className={styles.carBox} role="img" aria-label={chapters[chapter].carAlt}>
          <div ref={framesLayer} className={styles.frames} style={{ transformOrigin: PIVOT_ORIGIN, transform: `scale(${zoomAt(0)})` }}>
            {car === 'frames' &&
              (['day', 'night'] as const).map((set, s) => (
                // both sets in the page, the theme's shown; lazy, so only the visible set downloads
                <div key={set} className={`${styles.stack} ${set === 'day' ? 'day-only' : 'night-only'}`}>
                  {INDICES.map((i) => (
                    // eslint-disable-next-line @next/next/no-img-element -- pre-rendered frames, crossfaded by opacity
                    <img
                      key={i}
                      ref={(el) => {
                        imgs.current[s * (LAST_FRAME + 1) + i] = el
                      }}
                      src={frameSrc(set, i)}
                      alt=""
                      width={FRAME_SIZE.w}
                      height={FRAME_SIZE.h}
                      loading="lazy"
                      decoding="async"
                      style={{ opacity: i === 0 ? 1 : 0 }}
                    />
                  ))}
                </div>
              ))}
            {car !== 'frames' && !liveReady && (
              // the live car's poster: just the settled frame for this chapter until the canvas draws
              <div className={styles.stack}>
                {(['day', 'night'] as const).map((set) => (
                  // eslint-disable-next-line @next/next/no-img-element -- poster frame
                  <img
                    key={set}
                    className={set === 'day' ? 'day-only' : 'night-only'}
                    src={frameSrc(set, settledFrame)}
                    alt=""
                    width={FRAME_SIZE.w}
                    height={FRAME_SIZE.h}
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
            )}
            {car === 'live' && near && (
              <div
                className={styles.live}
                data-live-ready={liveReady ? '' : undefined}
                style={{ left: `${PLACE.left}%`, top: `${PLACE.top}%`, width: `${PLACE.width}%`, height: `${PLACE.height}%` }}
              >
                <SpecsScene frame={frame} night={night} lod={lod} active={onScreen} onReady={() => setLiveReady(true)} />
              </div>
            )}
            <svg
              className={styles.wheelbase}
              viewBox={`0 0 ${FRAME_SIZE.w} ${FRAME_SIZE.h}`}
              data-show={chapter === 0 && settled ? '' : undefined}
              aria-hidden="true"
            >
              <line x1={wb.wbFront[0]} y1={wb.wbFront[1]} x2={wb.wbRear[0]} y2={wb.wbRear[1]} />
              <line x1={wb.wbFront[0]} y1={wb.wbFront[1] - 9} x2={wb.wbFront[0]} y2={wb.wbFront[1] + 9} />
              <line x1={wb.wbRear[0]} y1={wb.wbRear[1] - 9} x2={wb.wbRear[0]} y2={wb.wbRear[1] + 9} />
            </svg>
          </div>
          <div className={styles.callouts} data-show={settled ? '' : undefined} aria-hidden="true">
            {chapter === 0 ? (
              <span
                className={`label ${styles.chip} ${styles.wheelbaseChip}`}
                style={{ '--local-x': `${wbMid.x}%`, '--local-y': `${wbMid.y}%` } as CSSProperties}
              >
                <span className={styles.chipDesktop}>{wheelbase.text}</span>
                <span className={styles.chipPhone}>{wheelbase.phone}</span>
              </span>
            ) : (
              chapters[chapter].callouts.map((c) => <CalloutChip key={c.anchor} callout={c} frame={settledFrame} zoomOutBy={zoomOutBy} />)
            )}
          </div>
        </div>

        <nav aria-label={specsCopy.railLabel} className={styles.rail}>
          <div className={styles.railTrack}>
            <span className={styles.railLine} aria-hidden="true" />
            <span
              className={styles.railFill}
              aria-hidden="true"
              style={{ '--local-progress': chapter / (CHAPTERS - 1) } as CSSProperties}
            />
            {chapters.map((c, i) => (
              <button
                key={c.number}
                type="button"
                className={styles.stop}
                data-done={i <= chapter ? '' : undefined}
                aria-current={i === chapter ? 'step' : undefined}
                aria-label={c.rail}
                style={{ '--local-i': i } as CSSProperties}
                onClick={() => {
                  stopPlay()
                  scrollToChapter(i)
                }}
              >
                <i className={styles.stopDot} />
                <span className={`label ${styles.stopLabel}`}>
                  <span>{c.number}</span>
                  <span className={styles.stopName}> {c.label}</span>
                </span>
              </button>
            ))}
          </div>
          <button type="button" className={styles.play} onClick={togglePlay}>
            <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.playIcon}>
              {playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5.5v13l11-6.5z" />}
            </svg>
            <span className={styles.playText}>{playing ? specsCopy.pause : specsCopy.play}</span>
            <span className={styles.playTextPhone}>{playing ? specsCopy.pause : specsCopy.playPhone}</span>
          </button>
        </nav>
      </div>
    </section>
  )
}
