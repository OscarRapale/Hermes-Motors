import Link from 'next/link'
import { newsCopy as c } from '@/content/copy/pages/news'
import { stories, type Story } from '@/content/news/stories'
import { storyDate } from '@/lib/news'
import { CopyLink } from './CopyLink'
import { StoryArt } from './StoryArt'
import styles from './Article.module.css'

/** A news story (ARCHITECTURE §8): the manifesto's typography, the art, the body, the stories either side */
export async function Article({ story }: { story: Story }) {
  const { default: Body } = await story.body()
  const i = stories.indexOf(story)
  const newer = stories[i - 1]
  const older = stories[i + 1]
  return (
    <article className={styles.article}>
      <header className={styles.head}>
        <Link href="/news" className={styles.back}>
          <span aria-hidden="true">←</span> {c.article.back}
        </Link>
        <p className={styles.meta}>
          <b>{story.category}</b>
          <span aria-hidden="true">·</span>
          <span>{storyDate(story.beat)}</span>
        </p>
        <h1 className={`display ${styles.h1}`}>
          {story.headline.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <p className={styles.dek}>{story.dek}</p>
      </header>
      <div className={styles.art}>
        <StoryArt art={story.art} sizes="(max-width: 899px) 100vw, 1100px" priority />
      </div>
      <div className={styles.body}>
        <Body />
        <CopyLink />
      </div>
      <nav className={styles.pager} aria-label={c.article.pager}>
        {newer && (
          <Link href={`/news/${newer.slug}`} className={styles.page}>
            <span className={styles.pageLabel}>{c.article.previous}</span>
            {newer.title}
          </Link>
        )}
        {older && (
          <Link href={`/news/${older.slug}`} className={`${styles.page} ${styles.older}`}>
            <span className={styles.pageLabel}>{c.article.next}</span>
            {older.title}
          </Link>
        )}
      </nav>
    </article>
  )
}
