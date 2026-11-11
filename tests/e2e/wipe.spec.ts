import { expect, test, type Page } from './test'
import { previewCopy, testDriveCopy } from '@/content/copy/shared'
import { DAY_ONE_MS } from '@/lib/clock/phase'

const DAY = 86_400_000

/** Opens / on a fake clock at `at` (server agrees), recording every wipe the page plays. */
async function open(page: Page, at: number) {
  await page.clock.install({ time: at })
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: at } }))
  await page.addInitScript(() => {
    const w = window as unknown as { __wipes: string[] }
    w.__wipes = []
    document.addEventListener('DOMContentLoaded', () => {
      const el = document.querySelector('[data-wipe]')
      if (!el) return
      new MutationObserver(() => {
        if (el.hasAttribute('data-active')) w.__wipes.push(el.getAttribute('data-to') ?? '')
      }).observe(el, { attributes: true, attributeFilter: ['data-active'] })
    })
  })
  const synced = page.waitForResponse('**/api/now')
  await page.goto('/')
  await synced
}

const wipes = (page: Page) => page.evaluate(() => (window as unknown as { __wipes: string[] }).__wipes)
const html = (page: Page) => page.locator('html')
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 900

test.describe('the flip at DAY_ONE', () => {
  test('a visitor on the page at 06:00 sees the wipe and First Light', async ({ page }) => {
    await open(page, DAY_ONE_MS - 3_000)
    await expect(html(page)).toHaveAttribute('data-phase', 'before')
    await page.clock.runFor(3_200) // past DAY_ONE: the timer fires
    await page.clock.runFor(1_000) // the 450 ms wipe plays out
    await expect(html(page)).toHaveAttribute('data-phase', 'firstLight')
    await expect(html(page)).toHaveAttribute('data-theme', 'day')
    expect(await wipes(page)).toEqual(['day'])
    await expect(page.locator('[data-wipe]')).not.toHaveAttribute('data-active')
    if (!isPhone(page)) {
      await expect(page.getByRole('banner').getByRole('link', { name: testDriveCopy.open, exact: true })).toBeVisible()
    }
  })

  test('96 days out, the timer does not fire early (setTimeout overflow)', async ({ page }) => {
    await open(page, DAY_ONE_MS - 96 * DAY)
    await page.clock.runFor(10_000)
    await expect(html(page)).toHaveAttribute('data-phase', 'before')
    expect(await wipes(page)).toEqual([])
  })
})

test.describe('preview', () => {
  test('the preview button plays the wipe both ways', async ({ page }) => {
    await open(page, DAY_ONE_MS - 2 * 3_600_000)
    await page.getByRole('button', { name: previewCopy.toDay }).click()
    await page.clock.runFor(1_000)
    await expect(html(page)).toHaveAttribute('data-theme', 'day')
    await page.getByRole('button', { name: previewCopy.toNight }).click()
    await page.clock.runFor(1_000)
    await expect(html(page)).toHaveAttribute('data-theme', 'night')
    expect(await wipes(page)).toEqual(['day', 'night'])
  })

  test('reduced motion: an instant swap, no wipe', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await open(page, DAY_ONE_MS - 2 * 3_600_000)
    await page.getByRole('button', { name: previewCopy.toDay }).click()
    await expect(html(page)).toHaveAttribute('data-theme', 'day')
    expect(await wipes(page)).toEqual([])
  })

  test('the theme swaps while the stripes cover the screen, not before', async ({ page }) => {
    await open(page, DAY_ONE_MS - 2 * 3_600_000)
    await page.clock.pauseAt(DAY_ONE_MS - 2 * 3_600_000 + 5_000)
    await page.getByRole('button', { name: previewCopy.toDay }).click()
    await page.clock.runFor(40) // early in the wipe: still night
    await expect(html(page)).toHaveAttribute('data-theme', 'night')
    await expect(page.locator('[data-wipe]')).toHaveAttribute('data-active', '')
    await page.clock.runFor(600)
    await expect(html(page)).toHaveAttribute('data-theme', 'day')
  })
})
