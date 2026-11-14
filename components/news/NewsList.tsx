'use client'

import Link from 'next/link'
import { useState, useSyncExternalStore } from 'react'
import { newsCopy as c } from '@/content/copy/pages/news'
import { categories, stories, type Category, type Story } from '@/content/news/stories'
import { now, useClock } from '@/lib/clock/client'
import { featured as lead, filterCounts, storyDate, visibleStories } from '@/lib/news'
import { ArrowIcon } from '@/components/site/icons/icons'
import { StoryArt } from './StoryArt'
import styles from './NewsList.module.css'

const noop = () => () => {}
/** true once hydrated: the visible stories depend on this device's time and preview */
const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )

/** The stories this visitor can read now (a story shows from its beat; previewing shows them all) */
function useVisible(): Story[] | null {
  const hydrated = useHydrated()
  const { previewing, phase } = useClock()
  // phase is read so the list follows the live flip at 06:00
  void phase
  return hydrated ? visibleStories(stories, now(), previewing) : null
}

/** "NEWS · 7 STORIES", counting what this visitor can read */
export function NewsCount() {
  const visible = useVisible()
  return <>{c.eyebrow(visible?.length ?? stories.length)}</>
}

function Meta({ story }: { story: Story }) {
  return (
    <p className={styles.meta}>
      <b>{story.category}</b>
      <span aria-hidden="true">·</span>
      <span>{storyDate(story.beat)}</span>
    </p>
  )
}

/** Board 26: filters with counts, the lead story, then the grid */
export function NewsList() {
  const visible = useVisible()
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL')

  // before hydration: the room the list takes, so nothing jumps
  if (!visible) return <div className={styles.pending} aria-hidden="true" />

  if (visible.length === 0) {
    const first = stories[stories.length - 1]
    return (
      <section className={styles.empty} aria-labelledby="news-empty">
        <h2 id="news-empty" className={`display ${styles.emptyTitle}`}>
          {c.empty.title}
        </h2>
        <p className={styles.emptyBody}>{c.empty.body(storyDate(first.beat))}</p>
      </section>
    )
  }

  const counts = filterCounts(visible, categories)
  const active = counts.some((x) => x.key === filter) ? filter : 'ALL'
  const top = lead(visible, active)
  const rest = visible.filter((s) => s !== top && (active === 'ALL' || s.category === active))

  return (
    <div className={styles.news}>
      <div role="group" aria-label={c.filtersLabel} className={styles.filters}>
        {counts.map(({ key, n }) => (
          <button key={key} type="button" aria-pressed={active === key} className={styles.filter} onClick={() => setFilter(key)}>
            {c.filters[key]}
            <small>{n}</small>
          </button>
        ))}
      </div>

      {top && (
        <article className={styles.featured}>
          <div className={styles.featuredArt}>
            <StoryArt art={top.art} sizes="(max-width: 899px) 100vw, 58vw" />
            <span className={styles.latest}>{c.latest}</span>
          </div>
          <div className={styles.featuredText}>
            <Meta story={top} />
            <h2 className={`display ${styles.featuredTitle}`}>
              <Link href={`/news/${top.slug}`} className={styles.cover}>
                {top.headline.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </Link>
            </h2>
            <p className={styles.dek}>{top.dek}</p>
            <span className={styles.read} aria-hidden="true">
              {c.read}
              <span className={styles.arrow}>
                <ArrowIcon />
              </span>
            </span>
          </div>
        </article>
      )}

      {rest.length > 0 && (
        <ul className={styles.grid} aria-label={c.gridLabel}>
          {rest.map((s) => (
            <li key={s.slug}>
              <article className={styles.card}>
                <div className={styles.cardArt}>
                  <StoryArt art={s.art} sizes="(max-width: 699px) 100vw, (max-width: 1099px) 50vw, 33vw" />
                </div>
                <div className={styles.cardText}>
                  <Meta story={s} />
                  <h3 className={styles.cardTitle}>
                    <Link href={`/news/${s.slug}`} className={styles.cover}>
                      {s.title}
                    </Link>
                  </h3>
                  <p className={styles.cardDek}>{s.dek}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
