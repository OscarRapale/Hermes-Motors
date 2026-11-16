import { expect, test } from './test'
import { BUILT_ROUTES } from '@/content/nav'
import { stories } from '@/content/news/stories'

// ARCHITECTURE §12: canonical addresses, link previews, robots, the sitemap, WebSite data
test.describe('search and link previews', () => {
  test.skip(({ isMobile }) => isMobile, 'markup and files, not layout: once is enough')

  for (const route of [...BUILT_ROUTES, `/news/${stories[0].slug}`]) {
    test(`${route}: canonical, a 1200 × 630 preview, a large card`, async ({ page, request }) => {
      await page.goto(route)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${route === '/' ? '' : route}$`))
      const og = await page.locator('meta[property="og:image"]').first().getAttribute('content')
      expect(og).toMatch(/opengraph-image/)
      await expect(page.locator('meta[property="og:image:width"]').first()).toHaveAttribute('content', '1200')
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
      const res = await request.get(new URL(og!).pathname + new URL(og!).search)
      expect(res.status()).toBe(200)
      expect(res.headers()['content-type']).toBe('image/png')
      const png = await res.body()
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
    })
  }

  test('the shared lap keeps its own card as the preview', async ({ page }) => {
    await page.goto('/drive/r?lap=71692&s=19842.26323.25527&a=4')
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /\/api\/card\?/)
  })

  test('robots, the sitemap, and WebSite (never Organization) data', async ({ page, request }) => {
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Allow: /')
    expect(robots).toMatch(/Sitemap: .+\/sitemap\.xml/)
    const sitemap = await (await request.get('/sitemap.xml')).text()
    for (const s of stories) expect(sitemap).toContain(`/news/${s.slug}</loc>`)
    expect(sitemap).toContain('/press</loc>')
    expect(sitemap).not.toContain('/drive/r')
    await page.goto('/')
    const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)
    expect(data['@type']).toBe('WebSite')
  })
})
