import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BUILT_ROUTES } from '@/content/nav'
import { ogPreviews, storyPreview } from '@/content/og'
import { stories } from '@/content/news/stories'
import { seo } from '@/content/seo'

// ARCHITECTURE §12: every page has its title, description and link-preview image.
const ROOT = join(__dirname, '..', '..')
const key = (route: string) => (route === '/' ? 'home' : route.slice(1))
// the home page and the test drive live in route groups, so their previews stay theirs alone
const imageFile = (route: string) =>
  route === '/' ? 'app/(home)/opengraph-image.tsx' : route === '/drive' ? 'app/drive/(game)/opengraph-image.tsx' : `app${route}/opengraph-image.tsx`

describe('every built route', () => {
  it.each([...BUILT_ROUTES])('%s has its words and its preview', (route) => {
    expect(seo).toHaveProperty(key(route))
    expect(existsSync(join(ROOT, imageFile(route))), imageFile(route)).toBe(true)
  })

  it('no preview file sits where a deeper page would inherit it (/drive/r keeps its card)', () => {
    expect(existsSync(join(ROOT, 'app/opengraph-image.tsx'))).toBe(false)
    expect(existsSync(join(ROOT, 'app/drive/opengraph-image.tsx'))).toBe(false)
  })

  it('every preview says something, with alt text', () => {
    for (const p of [...Object.values(ogPreviews), ...stories.map(storyPreview)]) {
      expect(p.headline.length).toBeGreaterThan(0)
      expect(p.alt.length).toBeGreaterThan(0)
    }
  })
})
