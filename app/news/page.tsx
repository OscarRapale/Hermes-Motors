import type { Metadata } from 'next'
import { NewsCount, NewsList } from '@/components/news/NewsList'
import { PageHero } from '@/components/pages/PageHero/PageHero'
import { newsCopy } from '@/content/copy/pages/news'
import { seo } from '@/content/seo'

export const metadata: Metadata = { title: { absolute: seo.news.title }, description: seo.news.description }

export default function NewsPage() {
  return (
    <>
      <PageHero eyebrow={<NewsCount />} headline={newsCopy.headline} intro={newsCopy.intro} />
      <NewsList />
    </>
  )
}
