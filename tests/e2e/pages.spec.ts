import { expect, test, type Page } from './test'
import { creditsCopy, notFoundCopy, privacyCopy } from '@/content/copy/pages/legal'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { expectNoAxeViolations } from './axe'

// The pages from M5 PR 1: Credits, Privacy, the 404 (no board: the shared hero and the document column).
const HOUR = 3_600_000
const SHOTS = process.env.DRIVE_SHOTS
const THEMES = [
  { name: 'night', at: DAY_ONE_MS - HOUR },
  { name: 'day', at: DAY_ONE_MS + HOUR },
] as const

async function open(page: Page, path: string, at: number) {
  await page.clock.setFixedTime(at)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: at } }))
  return page.goto(path)
}

for (const theme of THEMES) {
  test.describe(`pages (${theme.name})`, () => {
    test('credits: every credit line, linked to its source and licence', async ({ page }, info) => {
      await open(page, '/credits', theme.at)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(creditsCopy.title)
      for (const s of creditsCopy.sections) await expect(page.getByRole('heading', { level: 2, name: s.heading })).toBeVisible()
      const main = page.locator('main')
      await expect(main.getByRole('link', { name: '“2026 F1 CAR”', exact: true })).toHaveAttribute('href', /sketchfab\.com\/3d-models\/2026-f1-car/)
      await expect(main.getByRole('link', { name: 'Miopass', exact: true })).toHaveAttribute('href', 'https://sketchfab.com/miopass')
      await expect(main.getByRole('link', { name: 'CC BY 4.0' }).first()).toHaveAttribute('href', /creativecommons\.org\/licenses\/by\/4\.0/)
      await expectNoAxeViolations(page)
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/credits-${theme.name}-${info.project.name}.png`, fullPage: true })
    })

    test('privacy: what the site keeps, and never a word about sign-up', async ({ page }) => {
      await open(page, '/privacy', theme.at)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(privacyCopy.title)
      await expect(page.getByText(privacyCopy.intro)).toBeVisible()
      await expect(page.locator('main')).not.toContainText(/sign[- ]?up|database/i)
      await expectNoAxeViolations(page)
    })

    test('404: off the racing line, a real 404, the way back', async ({ page }, info) => {
      const res = await open(page, '/no-such-page', theme.at)
      expect(res?.status()).toBe(404)
      const h1 = page.getByRole('heading', { level: 1 })
      for (const line of notFoundCopy.headline) await expect(h1).toContainText(line)
      await expect(page.getByText(notFoundCopy.body)).toBeVisible()
      const back = page.getByRole('link', { name: notFoundCopy.cta })
      await expect(back).toHaveAttribute('href', '/')
      expect((await back.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      await expectNoAxeViolations(page)
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/404-${theme.name}-${info.project.name}.png` })
    })
  })
}
