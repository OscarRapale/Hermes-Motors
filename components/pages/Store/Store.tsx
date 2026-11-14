import Image from 'next/image'
import { storeCopy } from '@/content/copy/pages/store'
import styles from './Store.module.css'

const H = 'M50,72 L64,72 L80,8 L66,8 Z M78,72 L92,72 L108,8 L94,8 Z M70,46 L86,46 L88.5,36 L72.5,36 Z'
const FEATHERS = 'M59,23 L57,32 L13,18 L6,10 Z M55.5,38 L53.5,46.5 L20,35.5 L14,27.5 Z M52,53 L50,61 L29,53.5 L24,45.5 Z'

/** Before Day One "OPENS 06:00 · DAY ONE", after "LOOKBOOK · NOT FOR SALE" (D7). It follows the theme, like the
    header's locked button, so previewing First Light shows the after state (ARCHITECTURE §4.4). */
function Tag() {
  return (
    <p className={styles.tag}>
      <span className="night-only">{storeCopy.opens}</span>
      <span className="day-only">{storeCopy.lookbook}</span>
    </p>
  )
}

/** Board 27, page 4: three product tiles, a lookbook (no cart, Decision D7) */
export function Store() {
  const [model, cap, tee] = storeCopy.products
  return (
    <section className={styles.store} aria-label={storeCopy.label}>
      <article className={`${styles.tile} ${styles.model}`}>
        <p className={styles.n}>{model.n}</p>
        <div className={styles.art}>
          <Image
            src="/images/hero-day-1248.webp"
            alt={model.alt}
            width={1248}
            height={443}
            sizes="(max-width: 899px) 90vw, 30vw"
            className={styles.car}
          />
        </div>
        <h2 className={`display ${styles.title}`}>{model.title}</h2>
        <p className={styles.body}>{model.body}</p>
        <Tag />
      </article>

      <article className={`${styles.tile} ${styles.cap}`}>
        <p className={styles.n}>{cap.n}</p>
        <div className={styles.art}>
          <svg viewBox="0 0 120 80" role="img" aria-label={cap.alt} className={styles.mark}>
            <path d={H} className={styles.h} />
            <path d={FEATHERS} className={styles.feathers} />
          </svg>
        </div>
        <h2 className={`display ${styles.title}`}>{cap.title}</h2>
        <p className={styles.body}>{cap.body}</p>
        <Tag />
      </article>

      <article className={`${styles.tile} ${styles.tee}`}>
        <p className={styles.n}>{tee.n}</p>
        <div className={styles.art}>
          <p className={`display ${styles.line}`} role="img" aria-label={tee.alt}>
            {storeCopy.tee.map((l) => (
              <span key={l} aria-hidden="true">
                {l}
              </span>
            ))}
          </p>
          <svg viewBox="0 0 120 40" aria-hidden="true" className={styles.teeFeathers}>
            <path d="M60,4 L56,18 L4,8 Z M54,24 L51,36 L14,28 Z" />
          </svg>
        </div>
        <h2 className={`display ${styles.title}`}>{tee.title}</h2>
        <p className={styles.body}>{tee.body}</p>
        <Tag />
      </article>
    </section>
  )
}
