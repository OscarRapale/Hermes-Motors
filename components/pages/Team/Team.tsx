import Image from 'next/image'
import { Cta } from '@/components/site/Cta/Cta'
import { teamCopy } from '@/content/copy/pages/team'
import { driveHref } from '@/content/nav'
import styles from './Team.module.css'

// The traits' marks: one, two, three feathers (board 27; prototype Site-Pages.dc.html)
const FEATHERS = [
  'M60,4 L57,16 L4,6 Z',
  'M58,8 L55,20 L14,13 Z M53,26 L51,36 L22,31 Z',
  'M60,2 L57,13 L2,4 Z M56,17 L53,28 L10,21 Z M51,32 L49,40 L20,36 Z',
]

/** Board 27, page 1: three trait cards, then the Proving Ground */
export function Team() {
  const { traits, track } = teamCopy
  return (
    <div className={styles.team}>
      <section aria-label={teamCopy.traitsLabel} className={styles.traits}>
        {traits.map((t, i) => (
          <article key={t.n} className={styles.trait}>
            <span className={styles.n}>{t.n}</span>
            <h2 className={`display ${styles.traitTitle}`}>{t.title}</h2>
            <p className={styles.traitBody}>{t.body}</p>
            <svg viewBox="0 0 120 40" aria-hidden="true" className={styles.feathers}>
              <path d={FEATHERS[i]} />
            </svg>
          </article>
        ))}
      </section>

      <article className={styles.track} aria-labelledby="team-track">
        <div className={styles.still}>
          <Image src="/images/drive.webp" alt={track.alt} fill sizes="(max-width: 899px) 100vw, 55vw" className={styles.img} />
        </div>
        <div className={styles.trackText}>
          <p className={`label ${styles.trackEyebrow}`}>{track.eyebrow}</p>
          <h2 id="team-track" className={`display ${styles.trackTitle}`}>
            {track.title.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h2>
          <p className={styles.trackBody}>{track.body}</p>
          <Cta href={driveHref} variant="primary">
            {track.cta}
          </Cta>
        </div>
      </article>
    </div>
  )
}
