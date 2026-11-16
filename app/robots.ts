import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

// seo.md: allow all. The share cards under /api/card stay open, so link previews can fetch them; shared laps
// keep out of search with their own noindex.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${siteUrl()}/sitemap.xml` }
}
