import type { ReactNode } from 'react'
import styles from './PageHero.module.css'

type Props = {
  eyebrow: string
  /** Three lines in Michroma capitals, the middle one dimmed (voice.md) */
  headline: readonly string[]
  intro?: string
  /** Anything under the intro on the right: stats, a button */
  aside?: ReactNode
}

/** Board 27's page hero, shared by Team, Season, Partners, Store, Drivers and the 404. */
export function PageHero({ eyebrow, headline, intro, aside }: Props) {
  return (
    <header className={styles.hero}>
      <div>
        <p className={`label ${styles.eyebrow}`}>{eyebrow}</p>
        <h1 className={`display ${styles.h1}`}>
          {headline.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
      </div>
      {(intro || aside) && (
        <div className={styles.side}>
          {intro && <p className={styles.intro}>{intro}</p>}
          {aside}
        </div>
      )}
    </header>
  )
}
