import { expect, test, type Page } from './test'
import { driveCopy } from '@/content/copy/drive'
import { messenger } from '@/content/facts'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { formatLap } from '@/lib/game/timing'
import { expectNoAxeViolations } from './axe'

// /drive (ARCHITECTURE §3, §7): locked before Day One, open while previewing First Light (D3) and
// from 06:00. The game itself needs WebGL2: the default fixture has none (the no-WebGL state).

const BEFORE = DAY_ONE_MS - 6 * 3_600_000

async function open(page: Page, at: number, preview: 'day' | null = null) {
  await page.clock.setFixedTime(at)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: at } }))
  await page.addInitScript((p) => {
    if (p) sessionStorage.setItem('hermes.preview', p)
  }, preview)
  const synced = page.waitForResponse('**/api/now')
  await page.goto('/drive')
  await synced
}

test.describe('/drive', () => {
  test('before Day One it is locked, with the countdown; axe passes', async ({ page }) => {
    await open(page, BEFORE)
    await expect(page).toHaveTitle('Beat the messenger · Hermes Motors')
    await expect(page.getByText(driveCopy.locked)).toBeVisible()
    await expect(page.getByRole('timer', { name: driveCopy.timerLabel })).toBeVisible()
    await expect(page.getByRole('timer', { name: driveCopy.timerLabel })).toContainText('06:00:00')
    await expect(page.locator('canvas')).toHaveCount(0)
    await expectNoAxeViolations(page)
  })

  test('without WebGL2 it says so, with the messenger’s time instead', async ({ page }) => {
    await open(page, DAY_ONE_MS + 60_000)
    await expect(page.getByText(driveCopy.noWebgl(formatLap(messenger.lapMs)))).toBeVisible()
    await expect(page.getByText(driveCopy.locked)).toBeHidden()
    await expectNoAxeViolations(page)
  })

  test('previewing First Light opens it before Day One (D3)', async ({ page }) => {
    await open(page, BEFORE, 'day')
    await expect(page.getByText(driveCopy.locked)).toBeHidden()
    await expect(page.getByText(driveCopy.noWebgl(formatLap(messenger.lapMs)))).toBeVisible()
  })
})

test.describe('the lap', () => {
  test.use({ webgl: true })

  test('lights, pause with Esc (the header comes back), resume, and the clock starts at the line', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'desktop keys; phone controls come with M3 PR 5')
    test.slow()
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await open(page, DAY_ONE_MS + 60_000)
    const webgl2 = await page.evaluate(() => !!document.createElement('canvas').getContext('webgl2'))
    test.skip(!webgl2, 'no WebGL2 in this browser')

    await expect(page.locator('[data-status="ready"]')).toBeAttached({ timeout: 120_000 })
    await expect(page.getByText(driveCopy.lights.wait)).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('data-drive', 'on')
    await expect(page.getByRole('banner')).toBeHidden()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: driveCopy.pause.title })).toBeVisible()
    await expect(page.getByRole('button', { name: driveCopy.pause.resume })).toBeFocused()
    await expect(page.getByRole('banner')).toBeVisible()
    await page.getByRole('button', { name: driveCopy.pause.resume }).click()
    await expect(page.getByRole('dialog', { name: driveCopy.pause.title })).toBeHidden()

    // lights out within 6 s; full throttle carries the car to the line, and the lap clock starts
    await expect(page.getByText(driveCopy.lights.go)).toBeVisible({ timeout: 30_000 })
    await page.keyboard.down('KeyW')
    await expect(page.getByText(/^0:0\d\.\d{3}$/)).toBeVisible({ timeout: 60_000 })
    await page.keyboard.up('KeyW')
    expect(errors).toEqual([])
  })
})
