import { expect, test } from './test'
import { driveCopy } from '@/content/copy/drive'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { expectNoAxeViolations } from './axe'

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
  // the HUD (board 13): the first attempt on this device, nothing on the clock yet
  await expect(page.getByText(driveCopy.hud.attempt(1))).toBeVisible()
  await expect(page.getByRole('timer', { name: driveCopy.hud.labels.clock })).toHaveText('—')
  expect(await page.evaluate(() => localStorage.getItem('hermes.drive.v1'))).toContain('"attempts":1')
  await expect(page.locator('html')).toHaveAttribute('data-drive', 'on')
  await expect(page.getByRole('banner')).toBeHidden()

  // the first time on this device (a keyboard and a mouse), the controls come first: the lights wait for Start
  const controls = page.getByRole('dialog', { name: driveCopy.controls.title })
  await expect(controls).toBeVisible()
  await expect(controls.getByRole('img', { name: driveCopy.controls.keyboardLabel })).toBeVisible()
  await expect(controls.locator('svg [data-control]')).toHaveCount(13)
  await expect(controls.getByText(driveCopy.controls.items.brake.keys)).toBeVisible()
  await expect(controls.getByRole('button', { name: driveCopy.controls.start })).toBeFocused()
  await expectNoAxeViolations(page)
  await page.waitForTimeout(1500)
  await expect(page.getByText(driveCopy.lights.wait)).toBeVisible()
  await expect(page.locator('[aria-label="1 of 5 red lights on"]')).toHaveCount(0)
  await controls.getByRole('button', { name: driveCopy.controls.start }).click()
  await expect(controls).toBeHidden()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: driveCopy.pause.title })).toBeVisible()
  await expect(page.getByRole('button', { name: driveCopy.pause.resume })).toBeFocused()
  await expect(page.getByRole('banner')).toBeVisible()
  // the controls again, from the pause sheet: Back returns to it
  await page.getByRole('button', { name: driveCopy.pause.controls }).click()
  await expect(controls).toBeVisible()
  await expect(controls.getByText(driveCopy.controls.kicker)).toHaveCount(0)
  await controls.getByRole('button', { name: driveCopy.controls.back }).click()
  await expect(controls).toBeHidden()
  await expect(page.getByRole('dialog', { name: driveCopy.pause.title })).toBeVisible()
  await page.getByRole('button', { name: driveCopy.pause.resume }).click()
  await expect(page.getByRole('dialog', { name: driveCopy.pause.title })).toBeHidden()

  // lights out, then full throttle carries the car to the line and the lap clock starts
  await expect(stage).toHaveAttribute('data-phase', 'running', { timeout: 150_000 })
  await page.keyboard.down('KeyW')
  await expect(page.getByRole('timer', { name: driveCopy.hud.labels.clock })).toHaveText(/^0:0\d\.\d{3}$/, { timeout: 120_000 })
  // on the lap: sector 1 live, the signed gap to the messenger, the dial reading
  await expect(page.getByRole('region', { name: driveCopy.hud.labels.sectorTimes }).getByText(driveCopy.hud.live)).toBeVisible()
  await expect(page.locator('[data-f="delta"]')).toHaveText(/^[+−]\d\.\d{3}$/)
  await expect(page.locator('[data-f="speed"]')).not.toHaveText('0')
  await page.keyboard.up('KeyW')
  expect(errors).toEqual([])
})
