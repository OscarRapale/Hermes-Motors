import Link from 'next/link'
import { messenger } from '@/content/facts'
import { driveCopy } from '@/content/copy/drive'
import { HomeLink } from '@/components/site/HomeLink/HomeLink'
import { CloseIcon } from '@/components/site/icons/icons'
import { formatLap } from '@/lib/game/timing'
import styles from './Rotate.module.css'

const copy = driveCopy.rotate

/**
 * Board 15: a phone held upright. The drive waits for landscape (never forced); the scene loads behind
 * meanwhile. The intro line puts the messenger's time in mono, as the board does.
 */
export function Rotate() {
  const lap = formatLap(messenger.lapMs)
  const [before, after] = driveCopy.intro(lap).split(lap)
  return (
    <div className={styles.rotate}>
      <div className={styles.top}>
        <HomeLink />
        <Link href="/" className={styles.close}>
          <span className="visually-hidden">{copy.close}</span>
          <CloseIcon />
        </Link>
      </div>

      <p className={`label ${styles.kicker}`}>{driveCopy.kicker}</p>
      <h1 className={`display ${styles.h1}`}>
        <span>{driveCopy.headline[0]}</span>
        <span>{driveCopy.headline[1]}</span>
      </h1>
      <p className={styles.body}>
        {before}
        <span className={styles.lap}>{lap}</span>
        {after}
      </p>

      <div className={styles.hint} aria-hidden="true">
        <svg viewBox="0 0 64 116" className={styles.phone}>
          <rect x="2" y="2" width="60" height="112" rx="14" className={styles.body2} />
          <rect x="22" y="9" width="20" height="4" rx="2" className={styles.island} />
          <rect x="11" y="88" width="42" height="4" rx="2" className={styles.stripe} />
        </svg>
      </div>
      <p className={`label ${styles.turn}`}>{copy.turn}</p>

      <ol className={styles.steps}>
        {copy.steps.map((step, i) => (
          <li key={step}>
            <span className={styles.n} aria-hidden="true">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <p role="status" className={styles.status}>
        {copy.status}
      </p>
      <p className={styles.footnote}>{copy.footnote}</p>
    </div>
  )
}
