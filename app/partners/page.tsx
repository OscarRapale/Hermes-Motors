import type { Metadata } from 'next'
import { PageHero } from '@/components/pages/PageHero/PageHero'
import { Partners } from '@/components/pages/Partners/Partners'
import { partnersCopy } from '@/content/copy/pages/partners'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata('partners', '/partners')

export default function PartnersPage() {
  return (
    <>
      <PageHero eyebrow={partnersCopy.eyebrow} headline={partnersCopy.headline} intro={partnersCopy.intro} />
      <Partners />
    </>
  )
}
