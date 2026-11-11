'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { dashboard } from '@/content/copy/landing'
import { PowerIcon } from '@/components/site/icons/icons'
import {
  DAY_LEDS,
  DIAL_SWEEP_DEG,
  IGNITED_KEY,
  IGNITION_MS,
  dayLedsAt,
  dialReading,
  formatReading,
  needleAt,
  needleDeg,
  valueAt,
  type DialId,
  type PowerUnit,
} from '@/lib/landing/ignition'
import { Dial } from '../Dial/Dial'
import styles from './Dashboard.module.css'

const copy = dashboard.dials
const DIALS: DialId[] = ['zeroToHundred', 'topSpeed', 'power', 'minMass', 'mguk']

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * First Light dashboard (board 10): ignite, 15 LEDs, HP/kW, five dials. The ignition runs once per
 * session when the panel is first seen, and again on the ignite button; frames update the SVG
 * through refs (no React render per frame). Reduced motion: everything settled.
 */
export function Dashboard({ className = '' }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const progress = useRef(1)
  const [unit, setUnit] = useState<PowerUnit>('hp')
  const unitRef = useRef(unit)

  // Draw every dial and LED at ignition progress t (0…1).
  const draw = useCallback((t: number) => {
    const el = root.current
    if (!el) return
    progress.current = t
    for (const id of DIALS) {
      const svg = el.querySelector(`[data-dial="${id}"]`)
      if (!svg) continue
      const reading = dialReading(id, unitRef.current)
      const f = needleAt(reading.value / reading.max, t)
      svg.querySelector('[data-arc]')?.setAttribute('stroke-dasharray', `${(DIAL_SWEEP_DEG * f).toFixed(1)} 360`)
      svg.querySelector('[data-needle]')?.setAttribute('transform', `rotate(${needleDeg(f).toFixed(1)} 100 100)`)
      const value = svg.querySelector('[data-value]')
      if (value) value.textContent = formatReading(valueAt(reading.value, t), reading.decimals)
    }
    const lit = t >= 1 ? 0 : dayLedsAt(t)
    el.querySelectorAll('[data-day-leds] > *').forEach((led, i) => led.toggleAttribute('data-on', i < lit))
  }, [])

  const ignite = useCallback(() => {
    const el = root.current
    if (!el) return
    cancelAnimationFrame(frame.current)
    el.removeAttribute('data-ignite')
    if (reducedMotion()) {
      draw(1)
      return
    }
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / IGNITION_MS)
      draw(t)
      if (t < 1) frame.current = requestAnimationFrame(step)
    }
    draw(0)
    frame.current = requestAnimationFrame(step)
  }, [draw])

  // First view this session: ignite once the panel is actually on screen (it is display:none at night).
  useEffect(() => {
    const el = root.current
    if (!el) return
    let seen = false
    try {
      seen = sessionStorage.getItem(IGNITED_KEY) === '1'
    } catch {}
    if (seen) {
      el.removeAttribute('data-ignite')
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        observer.disconnect()
        try {
          sessionStorage.setItem(IGNITED_KEY, '1')
        } catch {}
        ignite()
      },
      { threshold: 0.35 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame.current)
    }
  }, [ignite])

  // HP/kW: redraw the power dial at the current progress.
  useEffect(() => {
    unitRef.current = unit
    draw(progress.current)
  }, [unit, draw])

  const power = dialReading('power', unit)

  return (
    // data-ignite is set before paint by the hero script (first view: the needles wait at rest)
    <div ref={root} className={`${styles.panel} ${className}`} data-dashboard suppressHydrationWarning>
      <div className={styles.top}>
        <div className={styles.status}>
          <button type="button" className={styles.ignite} onClick={ignite} aria-label={dashboard.ignite}>
            <PowerIcon />
          </button>
          <span className={styles.leds} data-day-leds aria-hidden="true">
            {Array.from({ length: DAY_LEDS }, (_, i) => (
              <span key={i} className={styles.led} />
            ))}
          </span>
        </div>
        <div role="group" aria-label={dashboard.unitsLabel} className={styles.units}>
          <button type="button" aria-pressed={unit === 'hp'} onClick={() => setUnit('hp')} className={styles.unit}>
            {dashboard.hp}
          </button>
          <button type="button" aria-pressed={unit === 'kw'} onClick={() => setUnit('kw')} className={styles.unit}>
            {dashboard.kw}
          </button>
        </div>
      </div>

      <div className={styles.dials}>
        <div className={styles.d1}>
          <Dial id="zeroToHundred" size="s" reading={dialReading('zeroToHundred')} unit={copy.zeroToHundred.unit} caption={copy.zeroToHundred.caption} label={copy.zeroToHundred.label} />
        </div>
        <div className={styles.d2}>
          <Dial id="topSpeed" size="m" reading={dialReading('topSpeed')} unit={copy.topSpeed.unit} caption={copy.topSpeed.caption} label={copy.topSpeed.label} />
        </div>
        <div className={styles.d3}>
          <Dial
            id="power"
            size="l"
            reading={power}
            unit={unit === 'kw' ? copy.power.unitKw : copy.power.unitHp}
            sub={unit === 'kw' ? copy.power.subKw : copy.power.subHp}
            caption={copy.power.caption}
            label={copy.power.label}
          />
        </div>
        <div className={styles.d4}>
          <Dial id="minMass" size="m" reading={dialReading('minMass')} unit={copy.minMass.unit} caption={copy.minMass.caption} label={copy.minMass.label} />
        </div>
        <div className={styles.d5}>
          <Dial id="mguk" size="s" reading={dialReading('mguk')} unit={copy.mguk.unit} caption={copy.mguk.caption} label={copy.mguk.label} />
        </div>
      </div>
    </div>
  )
}
