'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useClock } from '@/lib/clock/client'
import { michroma } from '@/lib/fonts'
import { canRunLiveCar } from '@/lib/specs/live'
import type { HelmetLook } from './DriverHelmet'
import styles from './HelmetBox.module.css'

// three.js only loads with the live helmet, never with the page (rules/three.md)
const DriverHelmet = dynamic(() => import('./DriverHelmet').then((m) => m.DriverHelmet), { ssr: false })

// The chin number is drawn in Michroma once document.fonts has it. Only the real face: next/font's family
// list also names a fallback built from local("Arial"), and loading that rejects where Arial isn't
// installed (Linux), an unhandled error from inside the package.
const NUMBER_FONT = michroma.style.fontFamily.split(',')[0].trim()

export type HelmetView = {
  /** the poster still, rendered from the live helmet's own camera (HELMET_FRAME) */
  still: string
  alt: string
  look: HelmetLook
  number?: string
  facing: 'right' | 'left'
  /** the night room (with `beforeDawn`) */
  night?: boolean
}

/**
 * A helmet on a Drivers card (05-drivers): the still first; with WebGL2 and data saver off, the live
 * DriverHelmet mounts over it when the card comes near and the still fades out once it has drawn. Before
 * Day One the night look (`night`) is shown. Anything fails: the still stays.
 */
export function HelmetBox({ day, night, className = '' }: { day: HelmetView; night?: HelmetView; className?: string }) {
  const theme = useClock().theme
  const view = night && theme === 'night' ? night : day
  const key = `${view.look}-${view.facing}`
  const box = useRef<HTMLDivElement>(null)
  const [live, setLive] = useState(false)
  const [drawn, setDrawn] = useState<string | null>(null)

  // live only where the device can, and only once the card is near
  useEffect(() => {
    const el = box.current
    if (!el || !canRunLiveCar()) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setLive(true)
        io.disconnect()
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const still = (v: HelmetView, only?: 'day-only' | 'night-only') => (
    <Image
      src={v.still}
      alt={v.alt}
      width={800}
      height={660}
      sizes="(max-width: 899px) 320px, 400px"
      className={`${styles.still} ${only ?? ''}`}
    />
  )

  return (
    <div ref={box} className={`${styles.box} ${className}`} data-drawn={drawn === key ? '' : undefined}>
      {night ? (
        <>
          {still(day, 'day-only')}
          {still(night, 'night-only')}
        </>
      ) : (
        still(day)
      )}
      {live && (
        <div className={styles.live} aria-hidden="true">
          <DriverHelmet
            key={key}
            look={view.look}
            number={view.number}
            facing={view.facing}
            night={view.night}
            fontFamily={NUMBER_FONT}
            onReady={() => setDrawn(key)}
          />
        </div>
      )}
    </div>
  )
}
