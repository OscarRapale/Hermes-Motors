import { expect, test } from './test'
import { seo } from '@/content/seo'
import { expectNoAxeViolations } from './axe'

test('home renders with its title and passes axe', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(seo.home.title)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expectNoAxeViolations(page)
})

// Links to routes from later milestones don't prefetch (content/nav.ts → BUILT_ROUTES), so the
// console stays clean: no 404s, no hydration mismatches, no errors at all.
test('home loads without console errors or hydration mismatches', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`${msg.text()} ${msg.location().url}`)
  })
  page.on('pageerror', (err) => errors.push(err.message))
  const synced = page.waitForResponse('**/api/now')
  await page.goto('/')
  await synced
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)) // the footer's links too
  await page.waitForLoadState('networkidle')
  expect(errors).toEqual([])
})

// ARCHITECTURE §10: no three.js before scroll. The 3D code loads only near the specs section
// (one static import of the car package would put it in the first load).
test('the page loads no three.js before scroll', async ({ page }) => {
  const scripts: Promise<string>[] = []
  page.on('response', (res) => {
    if (res.request().resourceType() === 'script') scripts.push(res.text().catch(() => ''))
  })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const bodies = await Promise.all(scripts)
  expect(bodies.length).toBeGreaterThan(0)
  expect(bodies.filter((b) => b.includes('WebGLRenderer'))).toHaveLength(0)
})

test('the site icon is the mark (no favicon 404)', async ({ page, request }) => {
  await page.goto('/')
  const icon = page.locator('head link[rel="icon"]').first()
  const href = await icon.getAttribute('href')
  expect(href).toContain('/icon.svg')
  const res = await request.get(href!)
  expect(res.ok()).toBe(true)
  expect(res.headers()['content-type']).toContain('image/svg+xml')
})

test('the CSS is inlined: no render-blocking stylesheet requests (D18)', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('link[rel="stylesheet"]')).toHaveCount(0)
})

test('the visible hero still is preloaded at high priority from <head> (D16)', async ({ page }) => {
  await page.goto('/')
  const preload = page.locator('head link[rel="preload"][as="image"]')
  await expect(preload).toHaveCount(1)
  await expect(preload).toHaveAttribute('fetchpriority', 'high')
  await expect(preload).toHaveAttribute('imagesrcset', /hero-night-/)
})
