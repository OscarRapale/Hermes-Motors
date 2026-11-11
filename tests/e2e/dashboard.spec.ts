import { expect, test, type Page } from './test'
import { dashboard, hotspots } from '@/content/copy/landing'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { IGNITED_KEY } from '@/lib/landing/ignition'
import { expectNoAxeViolations } from './axe'

const AT = DAY_ONE_MS - 2 * 3_600_000

/** Opens / previewing First Light, with a fake clock we can pause and step. */
async function openDay(page: Page) {
  await page.clock.install({ time: AT })
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: AT } }))
  await page.addInitScript(() => sessionStorage.setItem('hermes.preview', 'day'))
  const synced = page.waitForResponse('**/api/now')
  await page.goto('/')
  await synced
}

/** Brings the dashboard on screen and waits until its first-view ignition has started. */
async function ignited(page: Page) {
  const panel = page.locator('[data-dashboard]')
  await panel.scrollIntoViewIfNeeded()
  await expect(panel).not.toHaveAttribute('data-ignite') // the IntersectionObserver has fired
  await page.clock.runFor(3_000)
}

const value = (page: Page, dial: string) => page.locator(`[data-dial="${dial}"] [data-value]`).textContent()
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 900

test.describe('First Light dashboard', () => {
  test('ignites on first view, settles on the facts, and only once per session', async ({ page }) => {
    await openDay(page)
    await ignited(page)
    expect(await value(page, 'power')).toBe('1,006')
    expect(await value(page, 'zeroToHundred')).toBe('2.6')
    expect(await page.evaluate((k) => sessionStorage.getItem(k), IGNITED_KEY)).toBe('1')

    // Second load in the same session: no waiting at rest, values already settled.
    await page.reload()
    await expect(page.locator('[data-dashboard]')).not.toHaveAttribute('data-ignite')
    expect(await value(page, 'power')).toBe('1,006')
  })

  test('the ignite button replays the sequence: sweep, then count up', async ({ page }) => {
    await openDay(page)
    await ignited(page)
    await page.clock.pauseAt(AT + 60_000)

    await page.getByRole('button', { name: dashboard.ignite }).click()
    expect(await value(page, 'power')).toBe('0')
    await page.clock.runFor(600) // inside the 42% sweep: numbers still at zero
    expect(await value(page, 'power')).toBe('0')
    await page.clock.runFor(900) // settling: counting up
    const mid = Number((await value(page, 'power'))?.replace(',', ''))
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThan(1006)
    await page.clock.runFor(1_500)
    expect(await value(page, 'power')).toBe('1,006')
  })

  test('HP/kW swaps the System Power dial (aria-pressed on both)', async ({ page }) => {
    await openDay(page)
    await ignited(page)
    const hp = page.getByRole('button', { name: dashboard.hp, exact: true })
    const kw = page.getByRole('button', { name: dashboard.kw, exact: true })
    await expect(hp).toHaveAttribute('aria-pressed', 'true')
    await kw.click()
    await expect(kw).toHaveAttribute('aria-pressed', 'true')
    await expect(hp).toHaveAttribute('aria-pressed', 'false')
    await expect.poll(() => value(page, 'power')).toBe('750')
    await expect(page.locator('[data-dial="power"]')).toContainText(dashboard.dials.power.subKw)
    await expect(page.getByRole('img', { name: dashboard.dials.power.label })).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('reduced motion: settled at once, no waiting at rest', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openDay(page)
    await expect(page.locator('[data-dashboard]')).not.toHaveAttribute('data-ignite')
    expect(await value(page, 'power')).toBe('1,006')
    await page.locator('[data-dashboard]').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: dashboard.ignite }).click()
    expect(await value(page, 'power')).toBe('1,006')
  })

  test('hotspots link to their specs chapters (desktop only)', async ({ page }) => {
    await openDay(page)
    for (const { label, chapter } of hotspots) {
      const link = page.getByRole('link', { name: label })
      if (isPhone(page)) await expect(link).toBeHidden()
      else await expect(link).toHaveAttribute('href', `/#specs-${chapter}`)
    }
  })
})
