import { expect, test, type Page } from '@playwright/test'
import { chapters, specsCopy } from '@/content/copy/specs'
import { testDriveCopy } from '@/content/copy/shared'
import { hotspots } from '@/content/copy/landing'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { expectNoAxeViolations } from './axe'

const AT = DAY_ONE_MS - 6 * 3_600_000

async function open(page: Page, theme: 'night' | 'day', path = '/') {
  await page.clock.setFixedTime(AT)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: AT } }))
  await page.addInitScript((day) => {
    sessionStorage.setItem('hermes.ignited', '1')
    if (day) sessionStorage.setItem('hermes.preview', 'day')
  }, theme === 'day')
  const synced = page.waitForResponse('**/api/now')
  await page.goto(path)
  await synced
}

const rail = (page: Page) => page.getByRole('navigation', { name: specsCopy.railLabel })
const current = (page: Page) => rail(page).locator('[aria-current="step"]')
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 900
const toChapter = (page: Page, n: number) =>
  page.evaluate((c) => document.getElementById(`specs-${c}`)?.scrollIntoView(), n)

test.describe('specs section', () => {
  test('each chapter slot shows its chapter: rail, heading, frames, callouts', async ({ page }) => {
    await open(page, 'day')
    for (let n = 1; n <= 5; n++) {
      await toChapter(page, n)
      const c = chapters[n - 1]
      await expect(current(page)).toHaveAttribute('aria-label', c.rail)
      await expect(page.locator(`[data-chapter="${n - 1}"]`)).toHaveAttribute('data-active', '')
      await expect(page.getByRole('img', { name: c.carAlt })).toBeVisible()
    }
    // chapter 2 settled: frame 06 fully shown, both wing callouts visible
    await toChapter(page, 2)
    await expect(page.locator('img[src$="hm27-specs-06.webp"]')).toHaveCSS('opacity', '1', { timeout: 5_000 })
    const front = chapters[1].callouts[0]
    await expect(page.getByText(isPhone(page) ? front.phone : front.text, { exact: true })).toBeVisible()
  })

  test('the rail and the hero hotspots take you to a chapter', async ({ page }) => {
    await open(page, 'day')
    if (!isPhone(page)) {
      await page.getByRole('link', { name: hotspots[0].label }).click() // ACTIVE AERO → /#specs-2
      await expect(current(page)).toHaveAttribute('aria-label', chapters[1].rail)
    }
    await toChapter(page, 1)
    await rail(page).getByRole('button', { name: chapters[3].rail }).click()
    await expect(current(page)).toHaveAttribute('aria-label', chapters[3].rail, { timeout: 8_000 })
  })

  test('Play the scroll walks the chapters (reduced motion: instant)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await open(page, 'day')
    await toChapter(page, 1)
    await rail(page).getByRole('button', { name: specsCopy.play }).click()
    await expect(rail(page).getByRole('button', { name: specsCopy.pause })).toBeVisible()
    await expect(current(page)).toHaveAttribute('aria-label', chapters[1].rail, { timeout: 6_000 })
    await rail(page).getByRole('button', { name: specsCopy.pause }).click()
    await expect(rail(page).getByRole('button', { name: specsCopy.play })).toBeVisible()
  })

  test('all five chapters are in the reading order for screen readers', async ({ page }) => {
    await open(page, 'day')
    await expect(page.locator('#specs h2:visible')).toHaveCount(5)
  })

  test('HM-27 in the header marks the specs as the current location', async ({ page }) => {
    await open(page, 'day')
    test.skip(isPhone(page), 'the header nav is in the menu on phones')
    await toChapter(page, 3)
    await expect(page.getByRole('banner').getByRole('link', { name: 'HM-27' })).toHaveAttribute('aria-current', 'location')
  })

  test('by day the figures count up to the facts; axe passes', async ({ page }) => {
    await open(page, 'day')
    await toChapter(page, 1)
    await expect(page.locator('[data-chapter="0"] [data-count="768"]')).toHaveText('768', { timeout: 5_000 })
    await toChapter(page, 5)
    await expect(page.getByRole('heading', { name: chapters[4].headline.join(' ') })).toBeVisible()
    await expect(page.getByRole('link', { name: specsCopy.cta })).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('at night the Before Dawn figures stay sealed (D19)', async ({ page }) => {
    await open(page, 'night')
    await toChapter(page, 1)
    await expect(page.locator('[data-chapter="0"] [data-count="768"]')).toBeHidden()
    await toChapter(page, 5)
    await expect(page.getByRole('heading', { name: chapters[4].night!.headline.join(' ') })).toBeVisible()
    await expect(page.getByRole('heading', { name: chapters[4].headline.join(' ') })).toBeHidden()
    await expect(page.locator('#specs').getByText(/750\s*kW/i)).toHaveCount(0, { timeout: 1 }).catch(async () => {
      // hidden copies may exist in the DOM; none may be visible
      for (const el of await page.locator('#specs').getByText(/750\s*kW/i).all()) await expect(el).toBeHidden()
    })
    await expect(page.locator('#specs').getByRole('link', { name: testDriveCopy.locked })).toBeVisible()
    await expectNoAxeViolations(page)
  })
})
