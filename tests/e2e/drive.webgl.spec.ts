import { expect, test } from './test'
import { driveCopy } from '@/content/copy/drive'
import { DAY_ONE_MS } from '@/lib/clock/phase'

// The test drive with WebGL (ARCHITECTURE §7): runs in the "webgl" project (desktop, after the others).
// Software rendering takes seconds per frame and the physics catches up at most 0.25 s a frame, so the
// test waits on the game's phase (data-phase on the stage), never on a caption that is up for a second.
test.use({ webgl: true })

test('lights, pause with Esc (the header comes back), resume, and the clock starts at the line', async ({ page }) => {
  test.setTimeout(300_000)
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  const at = DAY_ONE_MS + 60_000
  await page.clock.setFixedTime(at)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: at } }))
  await page.goto('/drive')
  const webgl2 = await page.evaluate(() => !!document.createElement('canvas').getContext('webgl2'))
  test.skip(!webgl2, 'no WebGL2 in this browser')

  const stage = page.locator('[data-status="ready"]')
  await expect(stage).toBeAttached({ timeout: 120_000 })
  await expect(stage).toHaveAttribute('data-phase', 'grid')
  await expect(page.getByText(driveCopy.lights.wait)).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-drive', 'on')
  await expect(page.getByRole('banner')).toBeHidden()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: driveCopy.pause.title })).toBeVisible()
  await expect(page.getByRole('button', { name: driveCopy.pause.resume })).toBeFocused()
  await expect(page.getByRole('banner')).toBeVisible()
  await page.getByRole('button', { name: driveCopy.pause.resume }).click()
  await expect(page.getByRole('dialog', { name: driveCopy.pause.title })).toBeHidden()

  // lights out, then full throttle carries the car to the line and the lap clock starts
  await expect(stage).toHaveAttribute('data-phase', 'running', { timeout: 150_000 })
  await page.keyboard.down('KeyW')
  await expect(page.getByText(/^0:0\d\.\d{3}$/)).toBeVisible({ timeout: 120_000 })
  await page.keyboard.up('KeyW')
  expect(errors).toEqual([])
})
