import { expect, test, type Page } from './test'
import { beforeDawn, calendarCopy, firstLight } from '@/content/copy/landing'
import { icsDate } from '@/lib/calendar/ics'
import { ledsLit } from '@/lib/clock/countdown'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { expectNoAxeViolations } from './axe'

const HOUR = 3_600_000

/** Opens / with the device and server clocks at `msBefore` ms before DAY_ONE; records hero image requests. */
async function open(page: Page, msBefore: number, opts: { preview?: 'day'; ticking?: boolean } = {}) {
  const at = DAY_ONE_MS - msBefore
  if (opts.ticking) await page.clock.install({ time: at })
  else await page.clock.setFixedTime(at)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: at } }))
  if (opts.preview) await page.addInitScript(() => sessionStorage.setItem('hermes.preview', 'day'))
  const heroImages: string[] = []
  page.on('request', (r) => {
    const name = r.url().split('/').pop() ?? ''
    if (name.startsWith('hero-')) heroImages.push(name)
  })
  const synced = page.waitForResponse('**/api/now')
  await page.goto('/')
  await synced
  return heroImages
}

const timer = (page: Page) => page.getByRole('timer', { name: beforeDawn.panel.timerLabel })

test.describe('Before Dawn hero', () => {
  test('counts down to DAY_ONE, fills the LEDs, and loads only the night still', async ({ page }) => {
    const left = 6 * HOUR + 48 * 60_000 + 34_000
    const heroImages = await open(page, left)
    await expect(page.getByRole('heading', { level: 1, name: beforeDawn.headline.join(' ') })).toBeVisible()
    await expect(timer(page)).toHaveText('06:48:34', { useInnerText: true })
    await expect(page.locator('[data-night-leds] > [data-on]')).toHaveCount(ledsLit(left))

    const still = page.getByRole('img', { name: beforeDawn.carAlt })
    await expect(still).toBeVisible()
    await expect(still).toHaveAttribute('loading', 'eager') // D16: the visible still is the eager LCP image
    await page.waitForLoadState('networkidle')
    expect(heroImages.length).toBeGreaterThan(0)
    expect(heroImages.every((n) => n.startsWith('hero-night-'))).toBe(true)

    const calendar = page.getByRole('link', { name: beforeDawn.ctaCalendar })
    await expect(calendar).toHaveAttribute('href', '/day-one.ics')
    await expect(calendar).toHaveAttribute('download', calendarCopy.filename)
    await expect(page.getByRole('link', { name: beforeDawn.ctaManifesto })).toHaveAttribute('href', '/manifesto')
    await expectNoAxeViolations(page)
  })

  test('shows the days on their own line from 100 hours (D17)', async ({ page }) => {
    await open(page, (96 * 24 + 7) * HOUR + 3 * 60_000 + 9_000)
    await expect(timer(page)).toContainText(`96 ${beforeDawn.panel.days}`)
    await expect(timer(page)).toContainText('07:03:09')
  })

  test('ticks every second from the corrected clock', async ({ page }) => {
    await open(page, 2 * HOUR, { ticking: true })
    const seconds = async () => {
      const [h, m, s] = (await timer(page).innerText()).split(':').map(Number)
      return h * 3600 + m * 60 + s
    }
    const before = await seconds()
    expect(before).toBeLessThanOrEqual(2 * 3600)
    await page.clock.runFor(3_000)
    await expect.poll(seconds).toBeLessThanOrEqual(before - 3)
    expect(await seconds()).toBeGreaterThanOrEqual(before - 5)
  })

  test('the calendar file is the DAY_ONE event', async ({ request }) => {
    const res = await request.get('/day-one.ics')
    expect(res.ok()).toBe(true)
    expect(res.headers()['content-type']).toContain('text/calendar')
    expect(res.headers()['content-disposition']).toContain(calendarCopy.filename)
    const body = (await res.text()).replace(/\r\n /g, '')
    expect(body).toContain(`DTSTART:${icsDate(DAY_ONE_MS)}`)
    expect(body).toContain(`SUMMARY:${calendarCopy.title}`)
  })
})

test.describe('First Light hero (previewed)', () => {
  test('shows the day copy and loads only the day still', async ({ page }) => {
    const heroImages = await open(page, 2 * HOUR, { preview: 'day' })
    await expect(page.getByRole('heading', { level: 1, name: firstLight.headline.join(' ') })).toBeVisible()
    await expect(page.getByRole('link', { name: firstLight.ctaDrive })).toHaveAttribute('href', '/drive')
    await expect(page.getByRole('img', { name: firstLight.carAlt })).toBeVisible()
    await expect(timer(page)).toBeHidden()
    await page.waitForLoadState('networkidle')
    expect(heroImages.every((n) => n.startsWith('hero-day-'))).toBe(true)
    await expectNoAxeViolations(page)
  })
})
