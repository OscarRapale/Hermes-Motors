'use client'

import { useEffect, useRef } from 'react'
import { registerThemeTransition, type ThemeTransition } from '@/lib/clock/client'
import { easeOut, parseCssTime } from '@/lib/motion'
import styles from './Wipe.module.css'

// docs/design/11-motion.md → Slipstream wipe: a band 2580 px wide for a 1440 px viewport (scaled),
// moving from −2900 to +1800 px over 450 ms; the theme swaps when the eased progress passes 0.49.
const DESIGN_WIDTH = 1440
const FROM = -2900
const TO = 1800
const SWAP_AT = 0.49

const durationMs = () => parseCssTime(getComputedStyle(document.documentElement).getPropertyValue('--dur-wipe'), 450)
const angle = () => getComputedStyle(document.documentElement).getPropertyValue('--angle').trim() || '14deg'
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Start loading the hero still of the theme we're flipping to, so it's there when the stripes clear. */
function warmStill(to: string) {
  const img = document.querySelector<HTMLImageElement>(`[data-hero-still="${to}"] img`)
  if (img) img.loading = 'eager'
}

/**
 * The Slipstream wipe (ARCHITECTURE §5): three stripes at 14° cross the screen and the theme swaps
 * under them. Registered as the clock's theme transition, so it plays for the preview button, the
 * skew correction and the live flip at DAY_ONE. Reduced motion: an instant swap.
 */
export function Wipe() {
  const root = useRef<HTMLDivElement>(null)
  const band = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    let pending: (() => void) | null = null

    const finish = () => {
      cancelAnimationFrame(frame)
      pending?.()
      pending = null
      root.current?.removeAttribute('data-active')
    }

    const run: ThemeTransition = (to, apply) => {
      const el = root.current
      const stripes = band.current
      // A second flip mid-wipe: land the first one at once, then play the new one.
      finish()
      if (!el || !stripes || reducedMotion()) {
        apply()
        return
      }
      warmStill(to)
      pending = apply
      el.setAttribute('data-to', to)
      el.setAttribute('data-active', '')
      const scale = window.innerWidth / DESIGN_WIDTH
      const skew = `skewX(calc(-1 * ${angle()}))`
      const duration = durationMs()
      const start = performance.now()
      const step = () => {
        const w = Math.min(1, (performance.now() - start) / duration)
        const e = easeOut(w)
        stripes.style.transform = `translateX(${(FROM + (TO - FROM) * e) * scale}px) ${skew}`
        if (pending && e >= SWAP_AT) {
          pending()
          pending = null
        }
        if (w < 1) frame = requestAnimationFrame(step)
        else finish()
      }
      stripes.style.transform = `translateX(${FROM * scale}px) ${skew}`
      frame = requestAnimationFrame(step)
    }

    registerThemeTransition(run)
    return () => {
      registerThemeTransition(null)
      finish()
    }
  }, [])

  return (
    <div ref={root} className={styles.wipe} aria-hidden="true" data-wipe>
      <div ref={band} className={styles.band}>
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}
