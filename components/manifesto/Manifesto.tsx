import Image from 'next/image'
import { Cta } from '@/components/site/Cta/Cta'
import { calendarCopy } from '@/content/copy/landing'
import { manifestoCopy as c } from '@/content/copy/pages/manifesto'
import { driveHref } from '@/content/nav'
import { Wipe } from './Wipe'
import styles from './Manifesto.module.css'

const H = 'M50,72 L64,72 L80,8 L66,8 Z M78,72 L92,72 L108,8 L94,8 Z M70,46 L86,46 L88.5,36 L72.5,36 Z'
const FEATHERS = 'M59,23 L57,32 L13,18 L6,10 Z M55.5,38 L53.5,46.5 L20,35.5 L14,27.5 Z M52,53 L50,61 L29,53.5 L24,45.5 Z'

const Lines = ({ lines }: { lines: readonly string[] }) => (
  <>
    {lines.map((l) => (
      <span key={l}>{l}</span>
    ))}
  </>
)

/** Board 28: five statements, top to bottom. It follows the theme (night before Day One). */
export function Manifesto() {
  const { open, firstDay, build, lap, close } = c
  return (
    <article className={styles.manifesto}>
      <section className={styles.open} aria-labelledby="mf-open">
        <svg viewBox="0 0 400 80" aria-hidden="true" className={styles.feather}>
          <path d="M396,6 L388,40 L8,12 L0,0 Z" />
        </svg>
        <p className={`label ${styles.eyebrow}`}>{c.eyebrow}</p>
        <Wipe>
          <h1 id="mf-open" className={`display ${styles.openTitle}`}>
            <Lines lines={open.title} />
          </h1>
        </Wipe>
        <p className={styles.openSub}>{open.sub}</p>
      </section>

      <section className={styles.firstDay} aria-labelledby="mf-first-day">
        <Wipe>
          <h2 id="mf-first-day" className={`display ${styles.sectionTitle} ${styles.dimSecond}`}>
            <Lines lines={firstDay.title} />
          </h2>
        </Wipe>
        <p className={styles.myth}>{firstDay.myth}</p>
        <ol className={styles.band} aria-label={firstDay.label}>
          {firstDay.beats.map((b, i) => (
            <li key={b.time} className={styles.beat} data-light={i === 2 ? '' : undefined}>
              <time className={styles.time}>{b.time}</time>
              <span className={styles.when}>{b.when}</span>
              <p className={styles.beatMyth}>{b.myth}</p>
              <p className={`display ${styles.beatLine}`}>
                <Lines lines={b.line} />
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.build} aria-labelledby="mf-build">
        <Wipe>
          <h2 id="mf-build" className={`display ${styles.sectionTitle}`}>
            {build.title}
          </h2>
        </Wipe>
        <ul className={styles.words}>
          {build.words.map((w, i) => (
            <li key={w.word} className={styles.word} data-last={i === build.words.length - 1 ? '' : undefined}>
              <span className={`display ${styles.wordTitle}`}>{w.word}</span>
              <p className={styles.wordLine}>{w.line}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.lap} aria-labelledby="mf-lap">
        <div className={styles.lapText}>
          <Wipe>
            <h2 id="mf-lap" className={`display ${styles.lapTitle}`}>
              <Lines lines={lap.title} />
            </h2>
          </Wipe>
          <p className={`display ${styles.lapAnswer}`}>
            <Lines lines={lap.answer} />
          </p>
        </div>
        <Image
          src="/images/hero-day-1248.webp"
          alt={lap.altDay}
          width={1248}
          height={443}
          sizes="(max-width: 899px) 100vw, 1080px"
          className={`day-only ${styles.car}`}
        />
        <Image
          src="/images/hero-night-1248.webp"
          alt={lap.altNight}
          width={1248}
          height={443}
          sizes="(max-width: 899px) 100vw, 1080px"
          className={`night-only ${styles.car}`}
        />
      </section>

      <section className={styles.close} aria-labelledby="mf-close">
        <svg viewBox="0 0 120 80" aria-hidden="true" className={styles.mark}>
          <path d={H} className={styles.markH} />
          <path d={FEATHERS} className={styles.markFeathers} />
        </svg>
        <Wipe>
          <p id="mf-close" className={`display ${styles.statement}`}>
            <Lines lines={close.statement} />
          </p>
        </Wipe>
        <Cta href="/day-one.ics" download={calendarCopy.filename} variant="primary" icon="calendar" className="night-only">
          {close.night}
        </Cta>
        <Cta href={driveHref} variant="primary" className="day-only">
          {close.day}
        </Cta>
      </section>
    </article>
  )
}
