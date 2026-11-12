import { expect, test, type Page } from './test'
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
/** Where chapter 5 comes to rest: the end of the section (on phones its text scrolls on from the slot's top) */
const toEnd = (page: Page) =>
  page.evaluate(() => {
    const specs = document.getElementById('specs')!
    window.scrollTo({ top: specs.getBoundingClientRect().bottom + window.scrollY - window.innerHeight - 1, behavior: 'instant' })
  })
/** Axe samples colours: wait until the chapter's text wipe is over (it can still be running under load) */
const settled = (page: Page, i: number) =>
  expect(page.locator(`[data-chapter="${i}"] [data-text-wipe]`)).toHaveCSS('clip-path', 'none', { timeout: 5_000 })
// the page scrolls smoothly; measuring positions needs an instant jump
const jumpTo = (page: Page, n: number) =>
  page.evaluate((c) => document.getElementById(`specs-${c}`)?.scrollIntoView({ behavior: 'instant' }), n)

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
    await expect(page.locator('img[src$="/images/specs/hm27-specs-06.webp"]')).toHaveCSS('opacity', '1', { timeout: 5_000 })
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
    // phones name the button "Play all chapters" (copy.md)
    const play = isPhone(page) ? specsCopy.playPhone : specsCopy.play
    await rail(page).getByRole('button', { name: play }).click()
    await expect(rail(page).getByRole('button', { name: specsCopy.pause })).toBeVisible()
    await expect(current(page)).toHaveAttribute('aria-label', chapters[1].rail, { timeout: 6_000 })
    await rail(page).getByRole('button', { name: specsCopy.pause }).click()
    await expect(rail(page).getByRole('button', { name: play })).toBeVisible()
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
    await toEnd(page)
    await settled(page, 4)
    await expectNoAxeViolations(page)
  })

  test('the frame fallback shows the theme’s set: Before Dawn at night (D20)', async ({ page }) => {
    await open(page, 'night')
    await toChapter(page, 2)
    await expect(page.locator('img[src$="/images/specs-night/hm27-specs-06.webp"]')).toBeVisible()
    await expect(page.locator('img[src$="/images/specs/hm27-specs-06.webp"]')).toBeHidden()
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
    await toEnd(page)
    await settled(page, 4)
    await expectNoAxeViolations(page)
  })

  test('chapter 5: the test drive button sits between the text and the panel (board 11), last and full width on phones (board 24)', async ({ page }) => {
    await open(page, 'day')
    await jumpTo(page, 5) // the text may scroll (phones, short screens): measure it at rest
    const article = page.locator('[data-chapter="4"]')
    const cta = article.getByRole('link', { name: specsCopy.cta })
    await expect(cta).toBeVisible()
    const [a, b, p] = await Promise.all([article.boundingBox(), cta.boundingBox(), article.getByText(/system power/i).boundingBox()])
    if (isPhone(page)) {
      expect(b!.y).toBeGreaterThan(p!.y)
      expect(b!.width).toBeGreaterThan(a!.width - 2)
    } else expect(b!.y).toBeLessThan(p!.y)
  })
})

test.describe('specs section on phones (board 24, ARCHITECTURE §6)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isPhone(page), 'phone layout')
  })

  test('the text scrolls under the pinned car; nothing overflows; the last chapter clears the rail', async ({ page }) => {
    await open(page, 'day')
    await jumpTo(page, 1)
    await expect(page.locator('[data-chapter="0"]')).toHaveAttribute('data-seen', '')
    await jumpTo(page, 2)
    await expect(current(page)).toHaveAttribute('aria-label', chapters[1].rail)
    const text = page.locator('[data-chapter="1"]')
    const car = page.getByRole('img', { name: chapters[1].carAlt })
    const before = await Promise.all([text.boundingBox(), car.boundingBox()])
    await page.evaluate(() => window.scrollBy({ top: 120, behavior: 'instant' }))
    await expect.poll(async () => (await text.boundingBox())!.y).toBeLessThan(before[0]!.y - 100)
    expect((await car.boundingBox())!.y).toBeCloseTo(before[1]!.y, 0) // the car stays put
    // the chapter read before stays in the page as it scrolls away
    await expect(page.locator('[data-chapter="0"]')).toHaveAttribute('data-seen', '')
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0)

    // at the end of the section, all of chapter 5 is above the rail
    await page.evaluate(() => {
      const specs = document.getElementById('specs')!
      window.scrollTo({ top: specs.getBoundingClientRect().bottom + window.scrollY - window.innerHeight - 1, behavior: 'instant' })
    })
    await expect(current(page)).toHaveAttribute('aria-label', chapters[4].rail)
    const last = await page.locator('[data-chapter="4"]').boundingBox()
    const railBox = await rail(page).boundingBox()
    expect(last!.y + last!.height).toBeLessThanOrEqual(railBox!.y)
  })

  test('the rail is a pill of numbered dots; the zoom is gone by chapter 2', async ({ page }) => {
    await open(page, 'day')
    await toChapter(page, 2)
    await expect(rail(page).getByText(chapters[0].label)).toBeHidden()
    await expect(rail(page).getByText(chapters[0].number, { exact: true })).toBeVisible()
    await expect(page.locator('#specs [style*="transform-origin"]')).toHaveAttribute('style', /scale\(1\);/, { timeout: 5_000 })
  })
})

test.describe('specs section on desktop and laptops (board 11, Decision D25)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(isPhone(page), 'desktop layouts')
  })

  test('at 1440 × 1000 the text stays pinned and the chapters swap in place', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await open(page, 'day')
    await jumpTo(page, 2)
    await expect(current(page)).toHaveAttribute('aria-label', chapters[1].rail)
    const text = page.locator('[data-chapter="1"]')
    const y = (await text.boundingBox())!.y
    await page.evaluate(() => window.scrollBy({ top: 120, behavior: 'instant' }))
    await page.waitForTimeout(200)
    expect((await text.boundingBox())!.y).toBeCloseTo(y, 0)
    await expect(page.locator('[data-chapter="0"]')).toHaveCSS('opacity', '0')
  })

  test('below 830 px tall the text scrolls beside the pinned car, and chapter 5 clears the rail', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 650 })
    await open(page, 'day')
    await jumpTo(page, 1)
    await jumpTo(page, 2)
    await expect(current(page)).toHaveAttribute('aria-label', chapters[1].rail)
    const text = page.locator('[data-chapter="1"]')
    const car = page.getByRole('img', { name: chapters[1].carAlt })
    const before = await Promise.all([text.boundingBox(), car.boundingBox()])
    await page.evaluate(() => window.scrollBy({ top: 120, behavior: 'instant' }))
    await expect.poll(async () => (await text.boundingBox())!.y).toBeLessThan(before[0]!.y - 100)
    expect((await car.boundingBox())!.y).toBeCloseTo(before[1]!.y, 0)
    await expect(page.locator('[data-chapter="0"]')).toHaveAttribute('data-seen', '')

    await page.evaluate(() => {
      const specs = document.getElementById('specs')!
      window.scrollTo({ top: specs.getBoundingClientRect().bottom + window.scrollY - window.innerHeight - 1, behavior: 'instant' })
    })
    await expect(current(page)).toHaveAttribute('aria-label', chapters[4].rail)
    const last = await page.locator('[data-chapter="4"]').boundingBox()
    expect(last!.y + last!.height).toBeLessThanOrEqual((await rail(page).boundingBox())!.y)
    await expect(page.locator('[data-chapter="4"]').getByRole('link', { name: specsCopy.cta })).toBeVisible()
  })
})
