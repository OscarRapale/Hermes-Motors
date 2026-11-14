import type { ReactNode } from 'react'
import styles from './PageHero.module.css'

type Words = {
  /** Three lines in Michroma capitals, the middle one dimmed (voice.md) */
  headline: readonly string[]
  intro?: string
}

type Props = Words & {
  /** a string, or a live count (News) */
  eyebrow: ReactNode
  /** Before Day One, if the page says something else then (Drivers): shown with the night theme */
  night?: Words
  /** Anything under the intro on the right: stats, a button */
  aside?: ReactNode
}

function H1({ headline, className }: { headline: readonly string[]; className?: string }) {
  return (
    <h1 className={`display ${styles.h1} ${className ?? ''}`}>
      {headline.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </h1>
  )
}

/** Board 27's page hero, shared by Team, Season, Partners, Store, Drivers and the 404. */
export function PageHero({ eyebrow, headline, intro, night, aside }: Props) {
  return (
    <header className={styles.hero}>
      <div>
        <p className={`label ${styles.eyebrow}`}>{eyebrow}</p>
        {night ? (
          <>
            {/* one of the two is display: none, so the page always has a single h1 */}
            <H1 headline={headline} className="day-only" />
            <H1 headline={night.headline} className="night-only" />
          </>
        ) : (
          <H1 headline={headline} />
        )}
      </div>
      {(intro || aside) && (
        <div className={styles.side}>
          {intro && night?.intro ? (
            <>
              <p className={`${styles.intro} day-only`}>{intro}</p>
              <p className={`${styles.intro} night-only`}>{night.intro}</p>
            </>
          ) : (
            intro && <p className={styles.intro}>{intro}</p>
          )}
          {aside}
        </div>
      )}
    </header>
  )
}
