'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './Wipe.module.css'

const REDUCED = '(prefers-reduced-motion: reduce)'

/**
 * A manifesto statement's entrance (08-manifesto): the text wipe, 450 ms with a Redline edge at 14°, once,
 * when 30% of it is in view. Without JavaScript or with reduced motion, the text is simply there.
 */
export function Wipe({ children, className = '' }: { children: ReactNode; className?: string }) {
  const el = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'idle' | 'armed' | 'in'>('idle')

  useEffect(() => {
    const node = el.current
    if (!node || window.matchMedia(REDUCED).matches) return
    // armed: hidden until it enters (only once JavaScript can bring it back)
    setState('armed')
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setState('in')
        io.disconnect()
      },
      { threshold: 0.3 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={el} className={`${styles.wipe} ${className}`} data-state={state}>
      <div className={styles.inner}>{children}</div>
    </div>
  )
}
