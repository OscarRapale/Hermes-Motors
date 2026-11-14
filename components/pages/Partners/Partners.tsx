import { Cta } from '@/components/site/Cta/Cta'
import { partnersCopy } from '@/content/copy/pages/partners'
import { contactHref } from '@/content/nav'
import styles from './Partners.module.css'

/** Board 27, page 3: eight sealed seats, then the Carbon band (contact: Decision D8) */
export function Partners() {
  const c = partnersCopy
  return (
    <div className={styles.partners}>
      <ul className={styles.slots} aria-label={c.slotsLabel}>
        {Array.from({ length: c.seats }, (_, i) => (
          <li key={i} className={styles.slot}>
            <span className={styles.seal} aria-hidden="true">
              <svg viewBox="0 0 40 16">
                <path d="M38,1.5 L36.5,8 L3,3 L0,0 Z M36,10 L35,15 L8,11 L5,8 Z" />
              </svg>
            </span>
            <span className={styles.slotLabel}>{i === 0 ? c.title : c.sealed}</span>
          </li>
        ))}
      </ul>

      <section className={styles.band} aria-labelledby="partners-cta">
        <div className={styles.bandText}>
          <h2 id="partners-cta" className={`display ${styles.bandTitle}`}>
            {c.cta.title}
          </h2>
          <p className={styles.bandBody}>{c.cta.body}</p>
        </div>
        <Cta href={contactHref} variant="primary" className={styles.bandCta}>
          {c.cta.button}
        </Cta>
      </section>
    </div>
  )
}
