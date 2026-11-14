import { HelmetBox } from '@/components/drivers/HelmetBox'
import { Cta } from '@/components/site/Cta/Cta'
import { driversCopy as c } from '@/content/copy/pages/drivers'
import { drivers } from '@/content/drivers'
import { messenger } from '@/content/facts'
import { driveHref } from '@/content/nav'
import { season } from '@/content/season'
import { formatLap } from '@/lib/game/timing'
import styles from './Drivers.module.css'

const STILLS = '/images/drivers'

/** Board 25: two driver cards whose helmets face each other, then the messenger. Night until 06:00. */
export function Drivers() {
  return (
    <div className={styles.drivers}>
      <section className={styles.cards} aria-label={c.cardsLabel}>
        {drivers.map((d, i) => (
          <article key={d.number} className={styles.card} data-card={d.card}>
            <span className={`display day-only ${styles.number}`} aria-hidden="true">
              {d.number}
            </span>
            <HelmetBox
              className={styles.helmet}
              day={{
                still: `${STILLS}/helmet-${d.livery}-${d.number}.webp`,
                alt: c.helmetAlt(d),
                look: d.livery,
                number: d.number,
                facing: d.facing,
              }}
              night={{
                still: `${STILLS}/helmet-before-dawn-${d.facing}.webp`,
                alt: c.helmetAltNight,
                look: 'beforeDawn',
                facing: d.facing,
                night: true,
              }}
            />
            <div className={styles.text}>
              <p className={styles.seat}>
                <span className="day-only">{c.seat(d)}</span>
                <span className="night-only">{c.seatNight(i)}</span>
              </p>
              <h2 className={`display ${styles.name}`}>
                <span className="day-only">
                  <span>{d.first}</span>
                  <span>{d.last}</span>
                </span>
                <span className={`night-only ${styles.sealed}`} role="img" aria-label={c.sealedName}>
                  <i />
                  <i />
                </span>
              </h2>
              <p className={styles.bio}>
                <span className="day-only">{d.bio}</span>
                <span className="night-only">{c.bioNight}</span>
              </p>
              <dl className={styles.stats}>
                {(
                  [
                    [String(season.rounds.length), c.stats.rounds],
                    [c.first, c.stats.season],
                    [d.nationality, c.stats.nationality],
                  ] as const
                ).map(([value, label]) => (
                  <div key={label}>
                    <dt className="visually-hidden">{label}</dt>
                    <dd className={styles.value}>
                      <span className="day-only">{value}</span>
                      <span className="night-only">{c.none}</span>
                    </dd>
                    <dd className={styles.label} aria-hidden="true">
                      {label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.messenger} aria-labelledby="drivers-messenger">
        <HelmetBox
          className={styles.messengerHelmet}
          day={{ still: `${STILLS}/helmet-messenger.webp`, alt: c.messenger.helmetAlt, look: 'messenger', facing: 'right' }}
        />
        <div className={styles.messengerText}>
          <p className={`label ${styles.messengerEyebrow}`}>{c.messenger.eyebrow}</p>
          <h2 id="drivers-messenger" className={`display ${styles.messengerTitle}`}>
            {c.messenger.title}
          </h2>
          <p className={styles.messengerBody}>
            <span className="day-only">{c.messenger.day}</span>
            <span className="night-only">{c.messenger.night}</span>
          </p>
        </div>
        <div className={styles.lap}>
          <p className={styles.lapTime}>{formatLap(messenger.lapMs)}</p>
          <p className={styles.lapLabel}>{c.messenger.lapLabel}</p>
          <Cta href={driveHref} variant="primary" className="day-only">
            {c.messenger.cta}
          </Cta>
          <Cta href={driveHref} variant="secondary" className={`night-only ${styles.locked}`}>
            {c.messenger.ctaNight}
          </Cta>
        </div>
      </section>
    </div>
  )
}
