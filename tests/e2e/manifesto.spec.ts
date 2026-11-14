import { expect, test, type Page } from './test'
import { calendarCopy } from '@/content/copy/landing'
import { manifestoCopy as c } from '@/content/copy/pages/manifesto'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { expectNoAxeViolations } from './axe'

// The manifesto (08-manifesto, board 28): night before Day One, day after; statements wipe in once.
const HOUR = 3_600_000
const SHOTS = process.env.DRIVE_SHOTS

async function open(page: Page, at: number) {
  await page.clock.setFixedTime(at)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: at } }))
  await page.goto('/manifesto')
}

/** Scroll the page through, so every statement has entered */
async function readThrough(page: Page) {
  const [height, step] = await page.evaluate(() => [document.body.scrollHeight, Math.floor(window.innerHeight / 2)])
  for (let y = 0; y < height; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y)
    await page.waitForTimeout(80)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
}

for (const theme of [
  { name: 'night', at: DAY_ONE_MS - HOUR },
  { name: 'day', at: DAY_ONE_MS + HOUR },
] as const) {
  test(`manifesto (${theme.name}): the five statements, the band, the car and the CTA for the hour`, async ({ page }, info) => {
    await open(page, theme.at)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('TROPHIES.')
    await expect(page.getByText(c.open.sub)).toBeVisible()
    const band = page.getByRole('list', { name: c.firstDay.label })
    await expect(band.getByRole('listitem')).toHaveCount(3)
    await expect(band.getByRole('listitem').last()).toContainText('BAHRAIN.')
    for (const w of c.build.words) await expect(page.getByText(w.word, { exact: true })).toBeVisible()
    await expect(page.getByRole('img', { name: theme.name === 'day' ? c.lap.altDay : c.lap.altNight })).toBeVisible()
    if (theme.name === 'night') {
      const cta = page.getByRole('link', { name: c.close.night })
      await expect(cta).toHaveAttribute('href', '/day-one.ics')
      await expect(cta).toHaveAttribute('download', calendarCopy.filename)
    } else {
      await expect(page.getByRole('link', { name: c.close.day })).toHaveAttribute('href', '/drive')
    }
    await readThrough(page)
    await expect(page.locator('[data-state="armed"]')).toHaveCount(0)
    await expectNoAxeViolations(page)
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/manifesto-${theme.name}-${info.project.name}.png`, fullPage: true })
  })
}

test('reduced motion: every statement is there at once, no wipe, no feather slide', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, DAY_ONE_MS + HOUR)
  await expect(page.locator('[data-state="armed"], [data-state="in"]')).toHaveCount(0)
  await expect(page.getByText('MESSAGE.', { exact: true }).last()).toBeVisible()
})
