import { expect, test } from './test'
import { driversCopy } from '@/content/copy/pages/drivers'
import { DAY_ONE_MS } from '@/lib/clock/phase'

// The live helmets (05-drivers): with WebGL2, each card's DriverHelmet mounts over its still and the still
// fades once it has drawn. Runs in the "webgl" project.
test.use({ webgl: true })

test('the three helmets go live over their stills', async ({ page }) => {
  test.setTimeout(240_000)
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  const at = DAY_ONE_MS + 60_000
  await page.clock.setFixedTime(at)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: at } }))
  await page.goto('/drivers')
  const webgl2 = await page.evaluate(() => !!document.createElement('canvas').getContext('webgl2'))
  test.skip(!webgl2, 'no WebGL2 in this browser')
  // the stills are there at once, with their text
  await expect(page.getByRole('img', { name: driversCopy.messenger.helmetAlt })).toBeVisible()
  // scroll so all three are near, then wait for each to draw
  await page.mouse.wheel(0, 800)
  await expect(page.locator('[data-drawn]')).toHaveCount(3, { timeout: 180_000 })
  await expect(page.locator('canvas')).toHaveCount(3)
  // the still's alt text stays for screen readers; the canvas is aria-hidden
  await expect(page.getByRole('img', { name: driversCopy.messenger.helmetAlt })).toBeAttached()
  if (process.env.DRIVE_SHOTS) await page.screenshot({ path: `${process.env.DRIVE_SHOTS}/drivers-live.png`, fullPage: true })
  expect(errors).toEqual([])
})
