import { seasonCopy } from '@/content/copy/pages/season'
import { roundDates, season, seasonStats } from '@/content/season'
import styles from './Season.module.css'

/** Board 27, page 2: the stats beside the intro */
export function SeasonStats() {
  const s = seasonStats()
  const items = [
    [s.races, seasonCopy.stats.races],
    [s.sprints, seasonCopy.stats.sprints],
    [s.months, seasonCopy.stats.months],
  ] as const
  return (
    <dl className={styles.stats} aria-label={seasonCopy.statsLabel}>
      {items.map(([value, label]) => (
        <div key={label}>
          <dt className="visually-hidden">{label}</dt>
          <dd className={styles.value}>{value}</dd>
          <dd className={styles.statLabel} aria-hidden="true">
            {label}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** Board 27, page 2: the 24 rounds, the opener in Carbon, Sprint weekends tagged, the source note */
export function SeasonGrid() {
  const last = season.rounds.length
  return (
    <section className={styles.season} aria-label={seasonCopy.gridLabel}>
      <ol className={styles.grid}>
        {season.rounds.map((r) => {
          const opener = r.round === 1
          return (
            <li key={r.round} className={styles.round} data-opener={opener ? '' : undefined}>
              <p className={styles.top}>
                <span aria-label={seasonCopy.roundLabel(r.round)}>{seasonCopy.round(r.round)}</span>
                <time dateTime={`${r.from}/${r.to}`}>{roundDates(r)}</time>
              </p>
              <h2 className={styles.gp}>{r.grandPrix}</h2>
              <p className={styles.venue}>{r.venue}</p>
              {(r.sprint || opener || r.round === last) && (
                <p className={styles.tags}>
                  {r.sprint && <span className={styles.sprint}>{seasonCopy.sprint}</span>}
                  {opener && <span className={styles.flag}>{seasonCopy.opener}</span>}
                  {r.round === last && <span className={styles.flag}>{seasonCopy.finale}</span>}
                </p>
              )}
            </li>
          )
        })}
      </ol>
      <p className={styles.note}>{seasonCopy.note}</p>
    </section>
  )
}
