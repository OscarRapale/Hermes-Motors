import { expect, test, type Page } from './test'
import { beforeDawn, dashboard } from '@/content/copy/landing'
import { DAY_ONE_MS } from '@/lib/clock/phase'

const AT = DAY_ONE_MS - 6 * 3_600_000

async function open(page: Page, theme: 'night' | 'day') {
  await page.clock.setFixedTime(AT)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: AT } }))
  await page.addInitScript((day) => {
    sessionStorage.setItem('hermes.ignited', '1') // settled dials: we measure layout, not motion
    if (day) sessionStorage.setItem('hermes.preview', 'day')
  }, theme === 'day')
  const synced = page.waitForResponse('**/api/now')
  await page.goto('/')
  await synced
}

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 900
const box = async (page: Page, selector: string) => {
  const b = await page.locator(selector).first().boundingBox()
  expect(b, selector).not.toBeNull()
  return b!
}

for (const theme of ['night', 'day'] as const) {
  test(`no horizontal overflow, and every hero control is at least 44 px (${theme})`, async ({ page }) => {
    await open(page, theme)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0)
    for (const control of await page.locator('main section').locator('a, button').all()) {
      if (!(await control.isVisible())) continue
      const b = await control.boundingBox()
      expect(b!.height, await control.innerText()).toBeGreaterThanOrEqual(44)
      expect(b!.width, await control.innerText()).toBeGreaterThanOrEqual(44)
    }
  })
}

test('phone: the two CTAs are full width (boards 22/23)', async ({ page }) => {
  await open(page, 'night')
  test.skip(!isPhone(page), 'phone layout only')
  const primary = await box(page, `a:has-text("${beforeDawn.ctaCalendar}")`)
  const secondary = await box(page, `a:has-text("${beforeDawn.ctaManifesto}")`)
  expect(Math.abs(primary.width - secondary.width)).toBeLessThan(1)
  expect(Math.abs(primary.x - secondary.x)).toBeLessThan(1)
  expect(secondary.y).toBeGreaterThan(primary.y + primary.height - 1)
  const width = page.viewportSize()!.width
  expect(primary.width).toBeGreaterThan(width - 2 * 40)
})

test('the HP/kW toggle sits under the System Power dial on phones, in the top row on desktop', async ({ page }) => {
  await open(page, 'day')
  const units = await box(page, `[role="group"][aria-label="${dashboard.unitsLabel}"]`)
  const power = await box(page, '[data-dial="power"]')
  const ignite = await box(page, `button[aria-label="${dashboard.ignite}"]`)
  if (isPhone(page)) {
    expect(units.y).toBeGreaterThan(power.y + power.height - 1)
    // the four small dials in two rows of two
    const [d1, d2, d4, d5] = await Promise.all(
      ['zeroToHundred', 'topSpeed', 'minMass', 'mguk'].map((id) => box(page, `[data-dial="${id}"]`)),
    )
    expect(Math.abs(d1.y - d2.y)).toBeLessThan(1)
    expect(Math.abs(d4.y - d5.y)).toBeLessThan(1)
    expect(d4.y).toBeGreaterThan(d1.y + d1.height - 1)
    expect(d1.y).toBeGreaterThan(units.y + units.height - 1)
  } else {
    expect(Math.abs(units.y + units.height / 2 - (ignite.y + ignite.height / 2))).toBeLessThan(4)
    expect(units.y + units.height).toBeLessThan(power.y)
  }
})
