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
