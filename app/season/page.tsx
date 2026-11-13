import type { Metadata } from 'next'
import { PageHero } from '@/components/pages/PageHero/PageHero'
import { SeasonGrid, SeasonStats } from '@/components/pages/Season/Season'
import { seasonCopy } from '@/content/copy/pages/season'
import { seo } from '@/content/seo'

export const metadata: Metadata = { title: { absolute: seo.season.title }, description: seo.season.description }

export default function SeasonPage() {
  return (
    <>
      <PageHero eyebrow={seasonCopy.eyebrow} headline={seasonCopy.headline} intro={seasonCopy.intro} aside={<SeasonStats />} />
      <SeasonGrid />
    </>
  )
}
