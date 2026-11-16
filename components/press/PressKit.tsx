import { statSync } from 'node:fs'
import { join } from 'node:path'
import Image from 'next/image'
import { DownloadIcon } from '@/components/site/icons/icons'
import { pressCopy as c } from '@/content/copy/pages/press'
import { contactHref } from '@/content/nav'
import { CopyBoilerplate } from './CopyBoilerplate'
import styles from './PressKit.module.css'

/** "983 KB", "8.4 MB": the file's size, read when the page is built */
function size(publicPath: string): string {
  const bytes = statSync(join(process.cwd(), 'public', publicPath)).size
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const ZIP = '/press/hermes-motors-press-kit.zip'
const FILM = '/press/first-light-1080p.mp4'

/** Board 30: the downloads, the mark, the film, the facts, the boilerplate, the credit, the press office */
export function PressKit() {
  return (
    <div className={styles.press}>
      <header className={styles.hero}>
        <div>
          <p className={`label ${styles.eyebrow}`}>{c.eyebrow}</p>
          <h1 className={`display ${styles.h1}`}>
            {c.headline.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h1>
        </div>
        <div className={styles.side}>
          <p className={styles.intro}>{c.intro}</p>
          <div className={styles.actions}>
            <a href={ZIP} download className={styles.primary} aria-label={c.downloadLabel(size(ZIP))}>
              {c.download}
              <span className={styles.knob}>
                <DownloadIcon />
              </span>
            </a>
            <span className={`night-only ${styles.embargo}`}>
              <i aria-hidden="true" />
              {c.embargo}
            </span>
          </div>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="pk-images">
        <h2 id="pk-images" className={styles.h2}>
          {c.images.title}
        </h2>
        <ul className={styles.images}>
          {c.images.list.map((im) => {
            const href = `/press/renders/${im.file}`
            return (
              <li key={im.file} className={styles.image}>
                <div className={styles.thumb} data-ground={im.ground}>
                  <Image
                    src={`/images/press/${im.file.replace(/\.png$/, '.webp')}`}
                    alt={im.alt}
                    width={960}
                    height={600}
                    sizes="(max-width: 699px) 100vw, (max-width: 1099px) 50vw, 33vw"
                    className={styles.thumbImg}
                    data-fit={im.fit}
                  />
                </div>
                <div className={styles.imageMeta}>
                  <div>
                    <p className={styles.imageTitle}>{im.title}</p>
                    <p className={styles.file}>{im.file}</p>
                  </div>
                  <a href={href} download className={styles.circle} aria-label={c.images.downloadLabel(im.title, size(href))}>
                    <DownloadIcon />
                  </a>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <div className={styles.row}>
        <section className={styles.mark} aria-labelledby="pk-mark">
          <h2 id="pk-mark" className={styles.h2}>
            {c.mark.title}
          </h2>
          <ul className={styles.marks}>
            {c.mark.tiles.map((t) => (
              <li key={t.file}>
                <div className={styles.markTile} data-ground={t.ground}>
                  <Image unoptimized src={`/brand/${t.file}.svg`} alt={t.label} width={240} height={160} className={styles.markImg} data-file={t.file} />
                </div>
                <span className={styles.formats}>
                  <a href={`/brand/${t.file}.svg`} download aria-label={c.mark.fileLabel(t.label, c.mark.svg)}>
                    {c.mark.svg}
                  </a>
                  <a href={`/brand/${t.file}.png`} download aria-label={c.mark.fileLabel(t.label, c.mark.png)}>
                    {c.mark.png}
                  </a>
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.note}>{c.mark.note}</p>
        </section>

        <section className={styles.film} aria-labelledby="pk-film">
          <h2 id="pk-film" className={styles.h2}>
            {c.film.title}
          </h2>
          <div className={styles.video}>
            <video src={FILM} poster="/press/first-light-poster.jpg" controls muted playsInline preload="none" aria-label={c.film.videoLabel} />
          </div>
          <p className={styles.note}>
            <span className={styles.filmLabel}>{c.film.label}</span> {c.film.note}
          </p>
          <a href={FILM} download className={styles.textLink}>
            <DownloadIcon /> {c.film.download} <span className={styles.size}>{size(FILM)}</span>
          </a>
        </section>

        <section className={`${styles.card} ${styles.facts}`} aria-labelledby="pk-facts">
          <h2 id="pk-facts" className={styles.h2}>
            {c.facts.title}
          </h2>
          <dl className={styles.factList}>
            {c.facts.rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            <div>
              <dt>{c.facts.drivers.label}</dt>
              <dd>
                <span className="day-only">{c.facts.drivers.day}</span>
                <span className="night-only">{c.facts.drivers.night}</span>
              </dd>
            </div>
            <div>
              <dt>{c.facts.testDriver[0]}</dt>
              <dd>{c.facts.testDriver[1]}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className={styles.bottom}>
        <section className={`${styles.card} ${styles.boilerplate}`} aria-labelledby="pk-boilerplate">
          <div className={styles.cardTop}>
            <h2 id="pk-boilerplate" className={styles.h2}>
              {c.boilerplate.title}
            </h2>
            <CopyBoilerplate />
          </div>
          <p className={styles.boilerText}>{c.boilerplate.text}</p>
          <p className={styles.editors}>{c.boilerplate.editors}</p>
        </section>

        <div className={styles.stack}>
          <section className={styles.card} aria-labelledby="pk-credit">
            <h2 id="pk-credit" className={styles.h2}>
              {c.credit.title}
            </h2>
            <p className={styles.creditLine}>{c.credit.line}</p>
            <p className={styles.note}>{c.credit.note}</p>
          </section>
          <section className={styles.office} aria-labelledby="pk-office">
            <div>
              <h2 id="pk-office" className={`${styles.h2} ${styles.officeTitle}`}>
                {c.office.title}
              </h2>
              <p className={styles.officeBody}>{c.office.body}</p>
            </div>
            <a href={contactHref} className={styles.officeCta}>
              {c.office.cta}
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
