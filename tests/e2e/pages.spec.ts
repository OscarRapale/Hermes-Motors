import { expect, test, type Page } from './test'
import { creditsCopy, notFoundCopy, privacyCopy } from '@/content/copy/pages/legal'
import { partnersCopy } from '@/content/copy/pages/partners'
import { seasonCopy } from '@/content/copy/pages/season'
import { storeCopy } from '@/content/copy/pages/store'
import { teamCopy } from '@/content/copy/pages/team'
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

    test('team: three traits and the Proving Ground, with the way to the drive', async ({ page }, info) => {
      await open(page, '/team', theme.at)
      const h1 = page.getByRole('heading', { level: 1 })
      for (const line of teamCopy.headline) await expect(h1).toContainText(line)
      // the header nav (phones keep it in the menu)
      if ((page.viewportSize()?.width ?? 0) >= 900)
        await expect(page.getByRole('banner').getByRole('link', { name: 'Team', exact: true })).toHaveAttribute('aria-current', 'page')
      for (const t of teamCopy.traits) await expect(page.getByRole('heading', { level: 2, name: t.title })).toBeVisible()
      await expect(page.getByRole('img', { name: teamCopy.track.alt })).toBeVisible()
      const lap = page.getByRole('link', { name: teamCopy.track.cta })
      await expect(lap).toHaveAttribute('href', '/drive')
      expect((await lap.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      await expectNoAxeViolations(page)
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/team-${theme.name}-${info.project.name}.png`, fullPage: true })
    })

    test('season: 24 rounds, ten Sprints, the opener and the finale tagged, the source note', async ({ page }, info) => {
      await open(page, '/season', theme.at)
      const grid = page.getByRole('region', { name: seasonCopy.gridLabel })
      const rounds = grid.getByRole('listitem')
      await expect(rounds).toHaveCount(24)
      await expect(rounds.first()).toContainText('Bahrain')
      await expect(rounds.first()).toContainText(seasonCopy.opener)
      await expect(rounds.last()).toContainText('Abu Dhabi')
      await expect(rounds.last()).toContainText(seasonCopy.finale)
      await expect(grid.getByText(seasonCopy.sprint, { exact: true })).toHaveCount(10)
      await expect(page.getByText(seasonCopy.note)).toBeVisible()
      const stats = page.getByLabel(seasonCopy.statsLabel)
      await expect(stats).toContainText('24')
      await expect(stats).toContainText('10')
      const columns = await grid.locator('ol').evaluate((ol) => getComputedStyle(ol).gridTemplateColumns.split(' ').length)
      expect(columns).toBe((page.viewportSize()?.width ?? 0) < 700 ? 2 : (page.viewportSize()?.width ?? 0) < 1200 ? 4 : 6)
      await expectNoAxeViolations(page)
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/season-${theme.name}-${info.project.name}.png`, fullPage: true })
    })

    test('partners: eight sealed seats, the title seat first, and the band', async ({ page }, info) => {
      await open(page, '/partners', theme.at)
      const slots = page.getByRole('list', { name: partnersCopy.slotsLabel }).getByRole('listitem')
      await expect(slots).toHaveCount(8)
      await expect(slots.first()).toHaveText(partnersCopy.title)
      await expect(slots.nth(7)).toHaveText(partnersCopy.sealed)
      await expect(page.getByRole('heading', { level: 2, name: partnersCopy.cta.title })).toBeVisible()
      const cta = page.getByRole('link', { name: partnersCopy.cta.button })
      expect((await cta.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      await expectNoAxeViolations(page)
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/partners-${theme.name}-${info.project.name}.png`, fullPage: true })
    })

    test('store: three pieces, "opens on Day One" before it and a lookbook after', async ({ page }, info) => {
      await open(page, '/store', theme.at)
      const tiles = page.getByRole('region', { name: storeCopy.label }).getByRole('article')
      await expect(tiles).toHaveCount(3)
      for (const p of storeCopy.products) await expect(page.getByRole('heading', { level: 2, name: p.title })).toBeVisible()
      await expect(page.getByRole('img', { name: storeCopy.products[0].alt })).toBeVisible()
      const [shown, hidden] = theme.name === 'night' ? [storeCopy.opens, storeCopy.lookbook] : [storeCopy.lookbook, storeCopy.opens]
      await expect(page.getByText(shown, { exact: true })).toHaveCount(3)
      for (const el of await page.getByText(shown, { exact: true }).all()) await expect(el).toBeVisible()
      for (const el of await page.getByText(hidden, { exact: true }).all()) await expect(el).toBeHidden()
      await expectNoAxeViolations(page)
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/store-${theme.name}-${info.project.name}.png`, fullPage: true })
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
