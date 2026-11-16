import type { Metadata } from 'next'
import { PageHero } from '@/components/pages/PageHero/PageHero'
import { Store } from '@/components/pages/Store/Store'
import { storeCopy } from '@/content/copy/pages/store'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata('store', '/store')

export default function StorePage() {
  return (
    <>
      <PageHero eyebrow={storeCopy.eyebrow} headline={storeCopy.headline} intro={storeCopy.intro} />
      <Store />
    </>
  )
}
