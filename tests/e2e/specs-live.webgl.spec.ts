import { expect, test } from './test'
import { DAY_ONE_MS } from '@/lib/clock/phase'

// The live 3D car (ARCHITECTURE §6). Opts into WebGL; skips where the browser has none (a CI
// runner without a GPU may not). Runs in the "webgl" project (desktop, after the others).
test.use({ webgl: true })

test('the live car loads near the section, replaces the frames, and logs no errors', async ({ page }) => {
  test.slow()
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  const at = DAY_ONE_MS - 6 * 3_600_000
  await page.clock.setFixedTime(at)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: at } }))
  await page.goto('/')
  const webgl2 = await page.evaluate(() => !!document.createElement('canvas').getContext('webgl2'))
  test.skip(!webgl2, 'no WebGL2 in this browser')

  await page.evaluate(() => document.getElementById('specs-1')?.scrollIntoView())
  await expect(page.locator('#specs canvas')).toHaveCount(1, { timeout: 30_000 })
  await expect(page.locator('[data-live-ready]')).toBeAttached({ timeout: 120_000 })
  // the frame stack never loads on the live path: at most the poster frame was requested
  expect(await page.locator('#specs img[src*="hm27-specs-"]').count()).toBeLessThanOrEqual(2)
  expect(errors).toEqual([])
})

test('no three.js and no car model before the first scroll; a scroll starts them (ARCHITECTURE §10, D27)', async ({ page }) => {
  test.slow()
  const at = DAY_ONE_MS - 6 * 3_600_000
  await page.clock.setFixedTime(at)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: at } }))
  const models: string[] = []
  let three = false
  page.on('request', (r) => {
    if (r.url().includes('/models/')) models.push(r.url())
  })
  page.on('response', async (r) => {
    if (r.request().resourceType() !== 'script') return
    const body = await r.text().catch(() => '')
    if (body.includes('WebGLRenderer')) three = true
  })
  await page.goto('/')
  const webgl2 = await page.evaluate(() => !!document.createElement('canvas').getContext('webgl2'))
  test.skip(!webgl2, 'no WebGL2 in this browser')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  expect(models).toEqual([])
  expect(three).toBe(false)

  await page.evaluate(() => window.scrollBy(0, 200))
  await expect.poll(() => models.length, { timeout: 30_000 }).toBeGreaterThan(0)
})
