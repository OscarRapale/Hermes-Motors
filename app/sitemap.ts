import type { MetadataRoute } from 'next'
import { BUILT_ROUTES } from '@/content/nav'
import { stories } from '@/content/news/stories'
import { siteUrl } from '@/lib/site'

// Every page that exists, and every news story (seo.md). Shared laps (/drive/r) are left out: each is its
// own address, and they are noindex.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  const pages = [...BUILT_ROUTES].map((path) => ({ url: `${base}${path === '/' ? '' : path}`, changeFrequency: 'weekly' as const }))
  const news = stories.map((s) => ({ url: `${base}/news/${s.slug}`, changeFrequency: 'monthly' as const }))
  return [...pages, ...news]
}
