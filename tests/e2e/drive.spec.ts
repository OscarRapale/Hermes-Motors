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
