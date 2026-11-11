import Link from 'next/link'
import type { CSSProperties } from 'react'
import { hotspots } from '@/content/copy/landing'
import { specsChapterHref } from '@/content/nav'
import styles from './Hotspots.module.css'

// Where each hotspot sits on the day still, as a share of the car image (board 10: the car is
// 1180 × 419 at 116, 160 in the card; the dots at 499,435 · 791,245 · 981,229).
const POSITIONS: Record<number, { x: number; y: number }> = {
  2: { x: 32.46, y: 65.6 }, // active aero: the front wing
  3: { x: 57.2, y: 20.3 }, // halo
  5: { x: 73.3, y: 16.5 }, // power unit: the engine cover
}

/** The three First Light hotspots (desktop), each a link to its specs chapter. */
export function Hotspots({ className = '' }: { className?: string }) {
  return (
    <ul className={`${styles.list} ${className}`}>
      {hotspots.map(({ label, chapter }) => {
        const { x, y } = POSITIONS[chapter]
        return (
          <li key={chapter}>
            <Link
              href={specsChapterHref(chapter)}
              className={styles.hotspot}
              style={{ '--local-x': `${x}%`, '--local-y': `${y}%` } as CSSProperties}
            >
              <span className={styles.target} aria-hidden="true">
                <span className={styles.dot} />
              </span>
              <span className={`label ${styles.label}`}>{label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
