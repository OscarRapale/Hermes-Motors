import { expect, test } from './test'
import { driveCopy } from '@/content/copy/drive'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { expectNoAxeViolations } from './axe'

// The test drive on a phone (boards 15, 16): a touch screen, upright, then turned. Runs in the "webgl"
// project (Chromium with touch emulation: hover none, pointer coarse), where the scene can load.
test.use({ webgl: true, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

const SHOTS = process.env.DRIVE_SHOTS // a folder: save screenshots for review

test('upright: the rotate screen, and the lights wait; turned: the compact HUD and the start', async ({ page }) => {
  test.setTimeout(420_000)
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  const at = DAY_ONE_MS + 60_000
  await page.clock.setFixedTime(at)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: at } }))
  await page.goto('/drive')
  const webgl2 = await page.evaluate(() => !!document.createElement('canvas').getContext('webgl2'))
  test.skip(!webgl2, 'no WebGL2 in this browser')

  // board 15
  const rotate = page.locator('h1').filter({ hasText: driveCopy.headline[1] }).filter({ visible: true })
  await expect(rotate).toBeVisible()
  await expect(page.getByText(driveCopy.rotate.turn)).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: driveCopy.rotate.status })).toBeVisible()
  for (const step of driveCopy.rotate.steps) await expect(page.getByText(step)).toBeVisible()
  await expect(page.getByRole('link', { name: driveCopy.rotate.close })).toHaveAttribute('href', '/')
  await expect(page.getByRole('banner')).toBeHidden()
  await expectNoAxeViolations(page)
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/rotate-390.png` })

  // the scene loads behind it, and the lights don't start while upright
  const stage = page.locator('[data-status="ready"]')
  await expect(stage).toBeAttached({ timeout: 120_000 })
  await page.waitForTimeout(1500)
  await expect(page.locator('[role="status"][aria-label$="red lights on"]')).toHaveCount(0)

  // turned: board 16's HUD, no controls sheet (no keyboard), the lights begin
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(page.getByText(driveCopy.rotate.turn)).toBeHidden()
  await expect(page.getByRole('dialog', { name: driveCopy.controls.title })).toBeHidden()
  await expect(stage).toHaveAttribute('data-compact', '')
  await expect(page.getByRole('timer', { name: driveCopy.hud.labels.clock })).toBeVisible()
  // software WebGL draws a frame every few seconds under load: wait for any light, as long as drive.webgl does
  await expect(page.locator('[role="status"][aria-label$="red lights on"]')).toBeAttached({ timeout: 150_000 })

  // the top row doesn't overlap: timing, the dash pill, the map, pause
  const boxes = await Promise.all(
    [
      page.getByRole('region', { name: driveCopy.hud.labels.timing }),
      page.getByRole('region', { name: driveCopy.hud.labels.dash }),
      page.getByRole('region', { name: driveCopy.hud.labels.map }),
      page.getByRole('button', { name: driveCopy.pause.button }),
    ].map(async (l) => (await l.boundingBox())!),
  )
  for (let i = 1; i < boxes.length; i++) expect(boxes[i].x).toBeGreaterThanOrEqual(boxes[i - 1].x + boxes[i - 1].width)
  const pause = boxes[3]
  expect(pause.width).toBeGreaterThanOrEqual(44)
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/compact-844.png` })

  // upright again: paused behind the rotate screen; turned back: the pause sheet
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByText(driveCopy.rotate.turn)).toBeVisible()
  await expect(page.getByRole('dialog', { name: driveCopy.pause.title })).toBeHidden()
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(page.getByRole('dialog', { name: driveCopy.pause.title })).toBeVisible()
  expect(errors).toEqual([])
})

test('a small desktop window gets the compact HUD too', async ({ browser }) => {
  test.setTimeout(200_000)
  const context = await browser.newContext({ viewport: { width: 900, height: 700 } })
  const page = await context.newPage()
  const at = DAY_ONE_MS + 60_000
  await page.clock.setFixedTime(at)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: at } }))
  await page.goto('/drive')
  await expect(page.locator('[data-status="ready"]')).toHaveAttribute('data-compact', '', { timeout: 120_000 })
  await expect(page.getByText(driveCopy.rotate.turn)).toHaveCount(0)
  await expect(page.getByRole('region', { name: driveCopy.hud.labels.sectorTimes })).toHaveCount(0)
  await context.close()
})
