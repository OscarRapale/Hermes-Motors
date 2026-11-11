'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { beforeDawn, countdownAnnouncement } from '@/content/copy/landing'
import { now } from '@/lib/clock/client'
import { countdownView, LED_COUNT, ledsLit, untilDayOne } from '@/lib/clock/countdown'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { Feather, LockIcon, MoonIcon, PowerIcon } from '@/components/site/icons/icons'
import styles from './NightPanel.module.css'

const copy = beforeDawn.panel
// Decorative widths of the sealed bars (board 09).
const SEALED_BARS = [46, 56, 70, 52, 52]

/**
 * Before Dawn panel (board 09): LEDs filling over the last 6 h, the countdown to DAY_ONE, the sealed
 * rows. The hero's inline script paints the first value; this updates it once a second from the
 * skew-corrected clock, through the DOM (no React render per tick), and announces once a minute.
 */
export function NightPanel({ className = '' }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null)
  const live = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const timer = el.querySelector<HTMLElement>('[data-countdown]')
    const field = (key: string) => el.querySelector<HTMLElement>(`[data-cd="${key}"]`)
    const fields = { days: field('days'), hh: field('hh'), mm: field('mm'), ss: field('ss') }
    const leds = el.querySelectorAll<HTMLElement>('[data-night-leds] > *')
    let lastMinute: number | null = null
    let handle = 0

    const tick = () => {
      const t = now()
      const left = untilDayOne(t)
      const view = countdownView(left)
      timer?.setAttribute('data-format', view.days === null ? 'hms' : 'days')
      if (fields.days) fields.days.textContent = String(view.days ?? 0)
      if (fields.hh) fields.hh.textContent = view.hh
      if (fields.mm) fields.mm.textContent = view.mm
      if (fields.ss) fields.ss.textContent = view.ss
      const lit = ledsLit(DAY_ONE_MS - t)
      leds.forEach((led, i) => led.toggleAttribute('data-on', i < lit))

      // Announce politely on the minute, never on the first paint (02-landing → Accessibility).
      const minute = left.h * 60 + left.m
      if (lastMinute !== null && minute !== lastMinute && live.current) {
        const days = Math.floor(left.h / 24)
        live.current.textContent = countdownAnnouncement(days, days > 0 ? left.h % 24 : left.h, left.m)
      }
      lastMinute = minute
      handle = window.setTimeout(tick, 1000 - (t % 1000) + 5)
    }

    tick()
    return () => window.clearTimeout(handle)
  }, [])

  return (
    <div ref={root} className={`${styles.panel} ${className}`}>
      <div className={styles.top}>
        <div className={styles.status}>
          <span className={styles.power} aria-hidden="true">
            <PowerIcon />
          </span>
          <span className={styles.leds} data-night-leds aria-hidden="true">
            {Array.from({ length: LED_COUNT }, (_, i) => (
              <span key={i} className={styles.led} suppressHydrationWarning />
            ))}
          </span>
        </div>
        <span className={`label ${styles.modeChip}`}>
          <MoonIcon className={styles.chipIcon} />
          {copy.nightMode}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.timerBlock}>
          <p className={`label ${styles.until}`}>{copy.until}</p>
          <div
            role="timer"
            aria-label={copy.timerLabel}
            data-countdown
            data-format="hms"
            className={`tnum ${styles.timer}`}
            suppressHydrationWarning
          >
            <span className={styles.days}>
              <span data-cd="days" suppressHydrationWarning>
                --
              </span>{' '}
              {copy.days}
            </span>
            <span className={styles.hms}>
              <span data-cd="hh" suppressHydrationWarning>
                --
              </span>
              <span className={styles.sep} aria-hidden="true">
                :
              </span>
              <span data-cd="mm" suppressHydrationWarning>
                --
              </span>
              <span className={styles.sep} aria-hidden="true">
                :
              </span>
              <span data-cd="ss" suppressHydrationWarning>
                --
              </span>
            </span>
          </div>
          <p className={styles.caption}>{copy.caption}</p>
          <p ref={live} className="visually-hidden" aria-live="polite" />
        </div>

        <div className={styles.sealed}>
          <p className={`label ${styles.sealedTitle}`}>
            <LockIcon className={styles.chipIcon} />
            {copy.sealedTitle}
          </p>
          <ul className={styles.rows}>
            {copy.sealedRows.map((row, i) => (
              <li key={row} className={styles.row}>
                <span>{row}</span>
                <span className={styles.bar} style={{ '--local-bar': `${SEALED_BARS[i]}px` } as CSSProperties} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className={styles.feather}>
        <Feather />
        {copy.feather}
      </p>
    </div>
  )
}
