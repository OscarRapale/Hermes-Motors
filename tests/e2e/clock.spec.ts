import { expect, test, type Page } from './test'
import { previewCopy } from '@/content/copy/shared'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { expectNoAxeViolations } from './axe'

const HOUR = 3_600_000

/**
 * Opens `/` with the device clock at `deviceNow` and /api/now answering `serverNow`,
 * and waits for the client to sync (which also means it has hydrated).
 */
async function open(page: Page, deviceNow: number, serverNow: number = deviceNow) {
  await page.clock.setFixedTime(deviceNow)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: serverNow } }))
  const synced = page.waitForResponse('**/api/now')
  await page.goto('/')
  await synced
}

test.describe('launch clock', () => {
  test('paints Before Dawn before DAY_ONE', async ({ page }) => {
    await open(page, DAY_ONE_MS - HOUR)
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-phase', 'before')
    await expect(html).toHaveAttribute('data-theme', 'night')
    await expect(html).not.toHaveAttribute('data-preview')
  })

  test('paints First Light from DAY_ONE', async ({ page }) => {
    await open(page, DAY_ONE_MS + HOUR)
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-phase', 'firstLight')
    await expect(html).toHaveAttribute('data-theme', 'day')
  })

  test('the server clock wins over a device clock that is ahead', async ({ page }) => {
    await open(page, DAY_ONE_MS + HOUR, DAY_ONE_MS - HOUR)
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-phase', 'before')
    await expect(html).toHaveAttribute('data-theme', 'night')
  })

  test('the server clock wins over a device clock that is behind', async ({ page }) => {
    await open(page, DAY_ONE_MS - HOUR, DAY_ONE_MS + HOUR)
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-phase', 'firstLight')
    await expect(html).toHaveAttribute('data-theme', 'day')
  })
})

test.describe('preview toggle', () => {
  test('previews First Light before Day One, survives a reload, and returns', async ({ page }) => {
    await open(page, DAY_ONE_MS - HOUR)
    const html = page.locator('html')
    const chip = page.getByText(previewCopy.chip, { exact: true })
    await expect(chip).toBeHidden()

    await page.getByRole('button', { name: previewCopy.toDay }).click()
    await expect(html).toHaveAttribute('data-theme', 'day')
    await expect(html).toHaveAttribute('data-phase', 'before') // previewing never changes the phase
    await expect(html).toHaveAttribute('data-preview', '')
    await expect(chip).toBeVisible()
    await expectNoAxeViolations(page)

    const synced = page.waitForResponse('**/api/now')
    await page.reload()
    await synced
    await expect(html).toHaveAttribute('data-theme', 'day')
    await expect(chip).toBeVisible()

    await page.getByRole('button', { name: previewCopy.toNight }).click()
    await expect(html).toHaveAttribute('data-theme', 'night')
    await expect(html).not.toHaveAttribute('data-preview')
    await expect(chip).toBeHidden()
  })

  test('revisits Before Dawn after Day One', async ({ page }) => {
    await open(page, DAY_ONE_MS + HOUR)
    await page.getByRole('button', { name: previewCopy.toNight }).click()
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'night')
    await expect(html).toHaveAttribute('data-phase', 'firstLight')
    await expectNoAxeViolations(page)
  })
})

test('/api/now returns the server time and is never cached', async ({ request }) => {
  const first = await request.get('/api/now')
  expect(first.ok()).toBe(true)
  expect(first.headers()['cache-control']).toContain('no-store')
  const { now } = (await first.json()) as { now: number }
  expect(Math.abs(now - Date.now())).toBeLessThan(60_000)

  await new Promise((r) => setTimeout(r, 20))
  const second = (await (await request.get('/api/now')).json()) as { now: number }
  expect(second.now).toBeGreaterThan(now)
})
