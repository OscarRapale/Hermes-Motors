import { Cta } from '@/components/site/Cta/Cta'
import { Feather, SunriseIcon } from '@/components/site/icons/icons'
import { beforeDawn, calendarCopy, firstLight } from '@/content/copy/landing'
import { driveHref } from '@/content/nav'
import { heroScript } from '@/lib/landing/heroScript'
import { Dashboard } from '../Dashboard/Dashboard'
import { HeroStill } from '../HeroStill/HeroStill'
import { Hotspots } from '../Hotspots/Hotspots'
import { NightPanel } from '../NightPanel/NightPanel'
import styles from './Hero.module.css'

// Perspective grid on the lower half (board 09/10, viewBox 1440 × 560).
const GRID =
  'M720,0 L-1680,560 M720,0 L-1200,560 M720,0 L-720,560 M720,0 L-240,560 M720,0 L240,560 M720,0 L720,560 M720,0 L1200,560 M720,0 L1680,560 M720,0 L2160,560 M720,0 L2640,560 M720,0 L3120,560 M-400,6.9 L1840,6.9 M-400,27.7 L1840,27.7 M-400,62.2 L1840,62.2 M-400,110.6 L1840,110.6 M-400,172.8 L1840,172.8 M-400,248.9 L1840,248.9 M-400,338.8 L1840,338.8 M-400,442.5 L1840,442.5'

function Headline({ lines }: { lines: readonly [string, string, string] }) {
  return (
    <h1 className={`display ${styles.headline}`}>
      <span>{lines[0]}</span>
      <span className={styles.dim}>{lines[1]}</span>
      <span>{lines[2]}</span>
    </h1>
  )
}

/**
 * The landing hero (docs/design/02-landing.md, boards 09/10). Both states are rendered and CSS shows
 * the theme's own (ARCHITECTURE §4.2). The stripe wipe lands in M1 PR 3, the phone layout
 * (boards 22/23) in PR 4.
 */
export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.bg} aria-hidden="true" />
      <svg className={styles.grid} viewBox="0 0 1440 560" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
        <path d={GRID} />
      </svg>

      <div className={styles.stage}>
        <p className={`${styles.outline} night-only`} aria-hidden="true">
          {beforeDawn.outline}
        </p>
        <p className={`${styles.outline} day-only`} aria-hidden="true">
          {firstLight.outline}
        </p>
        <div className={styles.car}>
          <HeroStill look="night" alt={beforeDawn.carAlt} className="night-only" />
          <HeroStill look="day" alt={firstLight.carAlt} className="day-only" />
          <Hotspots className="day-only" />
          <p className={`label ${styles.carChip} night-only`}>
            <SunriseIcon className={styles.chipIcon} />
            {beforeDawn.carChip}
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={`${styles.copy} night-only`}>
          <p className={`label ${styles.eyebrow}`}>
            <Feather className={styles.eyebrowFeather} />
            {beforeDawn.eyebrow}
          </p>
          <Headline lines={beforeDawn.headline} />
          <p className={styles.body}>{beforeDawn.body}</p>
          <div className={styles.ctas}>
            <Cta href="/day-one.ics" download={calendarCopy.filename} variant="primary" icon="calendar">
              {beforeDawn.ctaCalendar}
            </Cta>
            <Cta href="/manifesto" variant="secondary">
              {beforeDawn.ctaManifesto}
            </Cta>
          </div>
        </div>

        <div className={`${styles.copy} day-only`}>
          <p className={`label ${styles.eyebrow}`}>
            <span className={styles.pulse} aria-hidden="true" />
            {firstLight.eyebrow}
          </p>
          <Headline lines={firstLight.headline} />
          <p className={styles.body}>{firstLight.body}</p>
          <div className={styles.ctas}>
            <Cta href={driveHref} variant="primary">
              {firstLight.ctaDrive}
            </Cta>
            <Cta href="/#specs" variant="secondary">
              {firstLight.ctaExplore}
            </Cta>
          </div>
        </div>

        <div className={styles.panel}>
          <NightPanel className="night-only" />
          <Dashboard className="day-only" />
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: heroScript() }} />
    </section>
  )
}
