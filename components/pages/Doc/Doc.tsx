import type { DocCopy } from '@/content/copy/pages/legal'
import { RichText } from '@/components/site/RichText/RichText'
import styles from './Doc.module.css'

/** A plain document (Credits, Privacy): the article column (ARCHITECTURE §8: 18/1.65, 680 px). */
export function Doc({ copy }: { copy: DocCopy }) {
  return (
    <article className={styles.doc}>
      <header className={styles.head}>
        <p className={`label ${styles.eyebrow}`}>{copy.eyebrow}</p>
        <h1 className={`display ${styles.h1}`}>{copy.title}</h1>
        <p className={styles.intro}>{copy.intro}</p>
      </header>
      {copy.sections.map((s) => (
        <section key={s.heading} className={styles.section} aria-labelledby={`doc-${s.heading}`}>
          <h2 id={`doc-${s.heading}`} className={`label ${styles.h2}`}>
            {s.heading}
          </h2>
          {s.quote && (
            <blockquote className={styles.quote}>
              <RichText value={s.quote} linkClassName={styles.link} />
            </blockquote>
          )}
          {s.paragraphs?.map((p, i) => (
            <p key={i} className={styles.p}>
              <RichText value={p} linkClassName={styles.link} />
            </p>
          ))}
          {s.items && (
            <ul className={styles.list}>
              {s.items.map((item, i) => (
                <li key={i}>
                  <RichText value={item} linkClassName={styles.link} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      {copy.updated && <p className={`label ${styles.updated}`}>{copy.updated}</p>}
    </article>
  )
}
