// A page's metadata from content/seo.ts (ARCHITECTURE §12): its title and description, its canonical
// address, and the same words for link previews. The preview image comes from the route's
// opengraph-image.tsx (content/og.ts).

import type { Metadata } from 'next'
import { seo, SITE_NAME } from '@/content/seo'

export type SeoKey = keyof typeof seo

export function pageMetadata(key: SeoKey, path: string): Metadata {
  const { title, description } = seo[key]
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE_NAME, type: 'website', locale: 'en' },
    twitter: { card: 'summary_large_image', title, description },
  }
}
