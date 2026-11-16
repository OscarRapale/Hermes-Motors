import type { Metadata } from 'next'
import { PageHero } from '@/components/pages/PageHero/PageHero'
import { SeasonGrid, SeasonStats } from '@/components/pages/Season/Season'
import { seasonCopy } from '@/content/copy/pages/season'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata('season', '/season')

export default function SeasonPage() {
  return (
    <>
      <PageHero eyebrow={seasonCopy.eyebrow} headline={seasonCopy.headline} intro={seasonCopy.intro} aside={<SeasonStats />} />
      <SeasonGrid />
    </>
  )
}
