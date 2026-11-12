'use client'

import { useEffect, useRef } from 'react'
import { messenger } from '@/content/facts'
import { driveCopy } from '@/content/copy/drive'
import { beforeDawn, countdownAnnouncement } from '@/content/copy/landing'
import { now } from '@/lib/clock/client'
import { countdownView, untilDayOne } from '@/lib/clock/countdown'
import { formatLap } from '@/lib/game/timing'
import { LockIcon } from '@/components/site/icons/icons'
import styles from './Locked.module.css'

/**
 * /drive before Day One, when not previewing First Light (ARCHITECTURE §3): the test drive opens at 06:00,
 * with the countdown. It ticks through the DOM (no render per second) and announces once a minute.
 */
export function Locked({ className = '' }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null)
  const live = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const timer = el.querySelector<HTMLElement>('[data-countdown]')
    const field = (key: string) => el.querySelector<HTMLElement>(`[data-cd="${key}"]`)
    const fields = { days: field('days'), hh: field('hh'), mm: field('mm'), ss: field('ss') }
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
    <div ref={root} className={`${styles.locked} ${className}`}>
      <p className={`label ${styles.kicker}`}>{driveCopy.kicker}</p>
      <h1 className={`display ${styles.h1}`}>
        <span>{driveCopy.headline[0]}</span>
        <span>{driveCopy.headline[1]}</span>
      </h1>
      <p className={styles.body}>{driveCopy.intro(formatLap(messenger.lapMs))}</p>
      <div className={styles.panel}>
        <p className={styles.lockLine}>
          <LockIcon className={styles.lockIcon} />
          {driveCopy.locked}
        </p>
        <div role="timer" aria-label={driveCopy.timerLabel} data-countdown data-format="hms" className={`tnum ${styles.timer}`} suppressHydrationWarning>
          <span className={styles.days}>
            <span data-cd="days" suppressHydrationWarning>
              --
            </span>{' '}
            {beforeDawn.panel.days}
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
        <p ref={live} className="visually-hidden" aria-live="polite" />
      </div>
    </div>
  )
}
