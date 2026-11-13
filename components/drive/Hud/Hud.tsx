'use client'

import { useImperativeHandle, useRef, type Ref, type RefObject } from 'react'
import { messenger } from '@/content/facts'
import { driveCopy } from '@/content/copy/drive'
import { MAP_PATH, type HudView } from '@/lib/drive/hud'
import { formatLap } from '@/lib/game/timing'
import styles from './Hud.module.css'
import c from './HudCompact.module.css'

const hud = driveCopy.hud
const LEDS = 15
const WHITE_LEDS = 5
// The dial's ten tick marks around its 270° arc (prototype)
const TICKS = '0.8 29.2 0.8 29.2 0.8 29.2 0.8 29.2 0.8 29.2 0.8 29.2 0.8 29.2 0.8 29.2 0.8 29.2 0.8 89.2'

export type HudHandle = { update: (view: HudView) => void }

type Props = {
  ref?: Ref<HudHandle>
  attempt: number
  bestMs: number | null
  /** The tag over the messenger: the scene places it (projected from his car) */
  tagRef: RefObject<HTMLDivElement | null>
  /** Board 16's compact HUD: landscape phones and small windows (lib/drive/media.ts) */
  compact?: boolean
}

/**
 * Board 13's HUD (or board 16's compact one): lap timing, the delta, the sectors, the track map, and the dashboard (LEDs, throttle and
 * brake, the speed dial, gear, ERS, aero mode, Overtake, Boost). Static markup; the game calls
 * `update(view)` a few dozen times a second and only what changed is written to the DOM.
 */
export function Hud({ ref, attempt, bestMs, tagRef, compact = false }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const last = useRef<Record<string, string>>({})
  const lastView = useRef<HudView | null>(null)

  // rebuilt when the layout changes: the new markup gets the last view at once (even while paused)
  useImperativeHandle(ref, () => {
    last.current = {}
    const q = <E extends Element = HTMLElement>(key: string) => root.current?.querySelector<E>(`[data-f="${key}"]`) ?? null
    const els = {
      clock: q('clock'),
      delta: q('delta'),
      tag: q('tag'),
      tagOt: q('tagOt'),
      progress: q('progress'),
      trace: q<SVGPathElement>('trace'),
      me: [...(root.current?.querySelectorAll<SVGCircleElement>('[data-f="me"]') ?? [])],
      ghost: q<SVGCircleElement>('ghost'),
      sectors: [0, 1, 2].map((k) => ({ cell: q(`s${k}`), tag: q(`s${k}tag`), fill: q(`s${k}fill`), time: q(`s${k}time`) })),
      leds: [...(root.current?.querySelectorAll<HTMLElement>('[data-f="led"]') ?? [])],
      speed: q<SVGTextElement>('speed'),
      speedArc: q<SVGCircleElement>('speedArc'),
      dial: q<SVGSVGElement>('dial'),
      rpm: q<SVGTextElement>('rpm'),
      gear: q<SVGTextElement>('gear'),
      thr: q('thr'),
      brk: q('brk'),
      ers: q('ers'),
      ersText: q('ersText'),
      aero: q('aero'),
      ot: q('ot'),
      boost: q('boost'),
      fx: q('fx'),
    }
    // write only when a value changed
    const set = (key: string, value: string, write: () => void) => {
      if (last.current[key] === value) return
      last.current[key] = value
      write()
    }
    const text = (key: string, el: Element | null, value: string) => set(key, value, () => el && (el.textContent = value))
    const attr = (key: string, el: Element | null, name: string, value: string) => set(key, value, () => el?.setAttribute(name, value))
    const style = (key: string, el: HTMLElement | null, prop: string, value: string) => set(key, value, () => el?.style.setProperty(prop, value))

    const handle = {
      update(v: HudView) {
        lastView.current = v
        text('clock', els.clock, v.clock)
        text('delta', els.delta, v.delta)
        attr('deltaState', els.delta, 'data-state', v.deltaState)
        text('tag', els.tag, v.tag)
        attr('tagState', els.tag, 'data-state', v.deltaState)
        attr('tagOt', els.tagOt, 'data-show', String(v.overtakeReady))
        text('progress', els.progress, v.progress)
        attr('trace', els.trace, 'stroke-dasharray', `${v.trace} 1000`)
        const me = `${v.me[0].toFixed(1)},${v.me[1].toFixed(1)}`
        set('me', me, () =>
          els.me.forEach((c) => {
            c.setAttribute('cx', v.me[0].toFixed(1))
            c.setAttribute('cy', v.me[1].toFixed(1))
          }),
        )
        const gh = `${v.ghost[0].toFixed(1)},${v.ghost[1].toFixed(1)}`
        set('ghost', gh, () => {
          els.ghost?.setAttribute('cx', v.ghost[0].toFixed(1))
          els.ghost?.setAttribute('cy', v.ghost[1].toFixed(1))
        })
        v.sectors.forEach((s, k) => {
          const el = els.sectors[k]
          attr(`s${k}`, el.cell, 'data-state', s.state)
          text(`s${k}tag`, el.tag, s.tag)
          style(`s${k}fill`, el.fill, '--local-fill', `${s.fill}%`)
          text(`s${k}time`, el.time, s.time)
        })
        set('leds', String(v.leds), () => els.leds.forEach((led, i) => led.toggleAttribute('data-on', i < v.leds)))
        text('speed', els.speed, String(v.speed))
        attr('speedArc', els.speedArc, 'stroke-dasharray', `${v.speedArc.toFixed(1)} 360`)
        // a zero-length arc with round caps still draws a dot
        attr('speedArcShown', els.speedArc, 'visibility', v.speedArc < 0.5 ? 'hidden' : 'visible')
        attr('dial', els.dial, 'aria-label', hud.labels.speed(v.speed, v.gear))
        text('rpm', els.rpm, `${v.rpm} ${hud.rpm}`)
        text('gear', els.gear, v.gear)
        style('thr', els.thr, '--local-level', `${v.throttle}%`)
        style('brk', els.brk, '--local-level', `${v.brake}%`)
        style('ers', els.ers, '--local-level', `${v.ers}%`)
        text('ersText', els.ersText, `${v.ers}%`)
        attr('aero', els.aero, 'data-state', v.aero)
        text('aeroText', els.aero, v.aero === 'straight' ? hud.straight : hud.corner)
        attr('ot', els.ot, 'data-state', v.overtake)
        attr('boost', els.boost, 'data-state', v.boost ? 'on' : 'off')
        const fx = v.overtake === 'active' ? hud.fxOvertake : v.boost ? hud.fxBoost : ''
        text('fx', els.fx, fx)
        attr('fxShow', els.fx, 'data-show', String(fx !== ''))
      },
    }
    if (lastView.current) handle.update(lastView.current)
    return handle
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the markup changes with `compact`: query it again
  }, [compact])

  // over the messenger's car: placed by the scene
  const tag = (
    <div ref={tagRef} className={styles.tag} aria-hidden="true">
      <div className={`${styles.glass} ${styles.tagBox}`}>
        <span className={styles.tagLine}>
          <i className={styles.tagDot} />
          {hud.theMessenger}
          <span data-f="tag" className={styles.signed} />
        </span>
        <span data-f="tagOt" data-show="false" className={styles.tagOt}>
          {hud.overtakeReady}
        </span>
      </div>
      <span className={styles.stem} />
    </div>
  )
  const best = bestMs === null ? '—' : formatLap(bestMs)
  const leds = Array.from({ length: LEDS }, (_, i) => <i key={i} data-f="led" data-white={i < WHITE_LEDS ? '' : undefined} />)

  if (compact) {
    return (
      <div ref={root} className={`${styles.hud} ${c.hud}`}>
        {tag}

        <section aria-label={hud.labels.timing} className={`${styles.glass} ${c.timing}`}>
          <div className={c.top}>
            <span className={styles.title}>{hud.title}</span>
            <span aria-hidden="true">·</span>
            <span className={styles.title}>{hud.attempt(attempt)}</span>
          </div>
          <div className={c.clockRow}>
            <div role="timer" aria-label={hud.labels.clock} data-f="clock" className={c.clock}>
              —
            </div>
            <span className={c.best}>
              <span className={styles.k}>{hud.bestShort}</span> {best}
            </span>
          </div>
          <div className={c.aeroRow}>
            <span data-f="aero" data-state="corner" className={`${styles.chip} ${c.chip}`}>
              {hud.corner}
            </span>
            <span className={styles.k}>
              {hud.ers} <span data-f="ersText" />
            </span>
            <span className={c.ers} aria-hidden="true">
              <i data-f="ers" />
            </span>
          </div>
        </section>

        <section aria-label={hud.labels.dash} className={`${styles.glass} ${c.dash}`}>
          <div className={`${styles.leds} ${c.leds}`} aria-hidden="true">
            {leds}
          </div>
          <div className={c.dashRow}>
            <span role="img" aria-label={hud.labels.speed(0, 'N')} data-f="dial" className={c.reading}>
              <span data-f="speed" className={c.speed} aria-hidden="true">
                0
              </span>
              <span className={styles.k} aria-hidden="true">
                {hud.kmh}
              </span>
              <span data-f="gear" className={c.gear} aria-hidden="true">
                N
              </span>
            </span>
            <i className={c.divider} aria-hidden="true" />
            <span className={styles.k}>{hud.deltaShort}</span>
            <span data-f="delta" data-state="none" className={`${styles.signed} ${c.delta}`}>
              —
            </span>
          </div>
        </section>

        <section aria-label={hud.labels.map} className={`${styles.glass} ${c.map}`}>
          <svg viewBox="0 0 280 190" role="img" aria-label={hud.labels.mapImage} className={styles.mapSvg}>
            <path d={MAP_PATH} className={`${styles.mapOutline} ${c.mapOutline}`} />
            <path d={MAP_PATH} pathLength={1000} strokeDasharray="0 1000" data-f="trace" className={`${styles.mapTrace} ${c.mapTrace}`} />
            <circle cx="52" cy="160" r="11" data-f="ghost" className={`${styles.mapGhost} ${c.mapGhost}`} />
            <circle cx="52" cy="160" r="10" data-f="me" className={`${styles.mapMe} ${c.mapMe}`} />
          </svg>
        </section>

        <div data-f="fx" data-show="false" className={c.fx} aria-hidden="true" />
      </div>
    )
  }

  return (
    <div ref={root} className={styles.hud}>
      {tag}

      <section aria-label={hud.labels.timing} className={`${styles.glass} ${styles.timing}`}>
        <div className={styles.timingTop}>
          <span className={styles.title}>{hud.title}</span>
          <span>{hud.attempt(attempt)}</span>
        </div>
        <div role="timer" aria-label={hud.labels.clock} data-f="clock" className={styles.clock}>
          —
        </div>
        <div className={styles.timingGrid}>
          <div>
            <span className={styles.k}>{hud.messenger}</span>
            <span>{formatLap(messenger.lapMs)}</span>
          </div>
          <div>
            <span className={styles.k}>{hud.best}</span>
            <span>{best}</span>
          </div>
        </div>
      </section>

      <div className={`${styles.glass} ${styles.deltaPill}`}>
        <span className={styles.k}>{hud.delta}</span>
        <span data-f="delta" data-state="none" className={`${styles.signed} ${styles.delta}`}>
          —
        </span>
      </div>

      <section aria-label={hud.labels.sectorTimes} className={`${styles.glass} ${styles.sectors}`}>
        {hud.sectors.map((name, k) => (
          <div key={name} data-f={`s${k}`} data-state="idle" className={styles.sector}>
            <div className={styles.sectorTop}>
              <span>{name}</span>
              <span data-f={`s${k}tag`} className={styles.sectorTag} />
            </div>
            <div className={styles.sectorBar}>
              <i data-f={`s${k}fill`} />
            </div>
            <div data-f={`s${k}time`} className={styles.sectorTime}>
              —
            </div>
          </div>
        ))}
      </section>

      <section aria-label={hud.labels.map} className={`${styles.glass} ${styles.map}`}>
        <div className={`${styles.k} ${styles.mapTop}`}>
          <span>{hud.track}</span>
          <span data-f="progress">{hud.grid}</span>
        </div>
        <svg viewBox="0 0 280 190" role="img" aria-label={hud.labels.mapImage} className={styles.mapSvg}>
          <path d={MAP_PATH} className={styles.mapOutline} />
          <path d={MAP_PATH} pathLength={1000} strokeDasharray="0 1000" data-f="trace" className={styles.mapTrace} />
          <path d="M52,150 L52,170" className={styles.mapLine} />
          <text x="40" y="184" className={styles.mapText}>
            {hud.startFinish}
          </text>
          <circle cx="52" cy="160" r="6" data-f="ghost" className={styles.mapGhost} />
          <circle cx="52" cy="160" r="7" data-f="me" className={styles.mapPulse} />
          <circle cx="52" cy="160" r="5.5" data-f="me" className={styles.mapMe} />
        </svg>
        <div className={styles.legend}>
          <span>
            <i className={styles.legendMe} />
            {hud.you}
          </span>
          <span>
            <i className={styles.legendGhost} />
            {hud.theMessenger}
          </span>
        </div>
      </section>

      <section aria-label={hud.labels.dash} className={`${styles.glass} ${styles.dash}`}>
        <div className={styles.leds} aria-hidden="true">
          {leds}
        </div>
        <div className={styles.dashRow}>
          <div className={styles.pedals} aria-hidden="true">
            <div className={styles.pedal}>
              <div className={styles.pedalBar}>
                <i data-f="thr" />
              </div>
              <span>{hud.throttle}</span>
            </div>
            <div className={`${styles.pedal} ${styles.brake}`}>
              <div className={styles.pedalBar}>
                <i data-f="brk" />
              </div>
              <span>{hud.brake}</span>
            </div>
          </div>
          <svg viewBox="0 0 200 200" role="img" aria-label={hud.labels.speed(0, 'N')} data-f="dial" className={styles.dial}>
            <circle cx="100" cy="100" r="90" pathLength={360} transform="rotate(135 100 100)" strokeDasharray={TICKS} strokeDashoffset={0.4} className={styles.ticks} />
            <circle cx="100" cy="100" r="78" pathLength={360} transform="rotate(135 100 100)" strokeDasharray="270 360" className={styles.arcBack} />
            <circle cx="100" cy="100" r="78" pathLength={360} transform="rotate(135 100 100)" strokeDasharray="0 360" data-f="speedArc" className={styles.arc} />
            <text x="100" y="104" data-f="speed" className={styles.speed}>
              0
            </text>
            <text x="100" y="124" className={styles.unit}>
              {hud.kmh}
            </text>
            <text x="100" y="140" data-f="rpm" className={styles.rpm} />
            <rect x="78" y="150" width="44" height="40" rx="11" className={styles.gearBox} />
            <text x="100" y="180" data-f="gear" className={styles.gear}>
              N
            </text>
          </svg>
          <div className={styles.side}>
            <span className={styles.sideLabel}>{hud.ers}</span>
            <div className={styles.ers} aria-hidden="true">
              <i data-f="ers" />
            </div>
            <span data-f="ersText" className={styles.ersText} />
            <span data-f="aero" data-state="corner" className={styles.chip}>
              {hud.corner}
            </span>
            <span data-f="ot" data-state="off" className={styles.chip}>
              {hud.overtake}
            </span>
            <span data-f="boost" data-state="off" className={styles.chip}>
              {hud.boost}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
