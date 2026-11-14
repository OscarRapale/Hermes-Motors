import type { Metadata } from 'next'
import { PageHero } from '@/components/pages/PageHero/PageHero'
import { Partners } from '@/components/pages/Partners/Partners'
import { partnersCopy } from '@/content/copy/pages/partners'
import { seo } from '@/content/seo'

export const metadata: Metadata = { title: { absolute: seo.partners.title }, description: seo.partners.description }

export default function PartnersPage() {
  return (
    <>
      <PageHero eyebrow={partnersCopy.eyebrow} headline={partnersCopy.headline} intro={partnersCopy.intro} />
      <Partners />
    </>
  )
}
