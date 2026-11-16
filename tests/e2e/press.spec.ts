import { expect, test, type Page } from './test'
import { pressCopy as c } from '@/content/copy/pages/press'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { expectNoAxeViolations } from './axe'

// The press kit (09-press-kit, board 30)
const HOUR = 3_600_000
const SHOTS = process.env.DRIVE_SHOTS

async function open(page: Page, at: number) {
  await page.clock.setFixedTime(at)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: at } }))
  await page.goto('/press')
}

for (const theme of [
  { name: 'night', at: DAY_ONE_MS - HOUR },
  { name: 'day', at: DAY_ONE_MS + HOUR },
] as const) {
  test(`press kit (${theme.name}): downloads, the mark, the film, the facts, the credit`, async ({ page }, info) => {
    await open(page, theme.at)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('PRESS KIT.')
    const all = page.getByRole('link', { name: new RegExp(`^${c.download}`) })
    await expect(all).toHaveAttribute('href', '/press/hermes-motors-press-kit.zip')
    await expect(all).toHaveAttribute('download', '')
    await expect(page.getByText(c.embargo)).toBeVisible({ visible: theme.name === 'night' })

    for (const im of c.images.list) {
      await expect(page.getByRole('img', { name: im.alt })).toBeVisible()
      const dl = page.getByRole('link', { name: new RegExp(`^Download ${im.title}, PNG`) })
      await expect(dl).toHaveAttribute('href', `/press/renders/${im.file}`)
      expect((await dl.boundingBox())!.width).toBeGreaterThanOrEqual(44)
    }
    for (const t of c.mark.tiles) {
      await expect(page.getByRole('img', { name: t.label })).toBeVisible()
      await expect(page.getByRole('link', { name: c.mark.fileLabel(t.label, 'SVG') })).toHaveAttribute('href', `/brand/${t.file}.svg`)
      await expect(page.getByRole('link', { name: c.mark.fileLabel(t.label, 'PNG') })).toHaveAttribute('href', `/brand/${t.file}.png`)
    }
    await expect(page.locator('video[src="/press/first-light-1080p.mp4"]')).toHaveAttribute('preload', 'none')

    const facts = page.getByRole('region', { name: c.facts.title })
    await expect(facts).toContainText('750 kW · 1,006 hp')
    await expect(facts.getByText(theme.name === 'day' ? c.facts.drivers.day : c.facts.drivers.night)).toBeVisible()
    await expect(page.getByText(c.credit.line)).toBeVisible()
    await expect(page.getByText(c.boilerplate.editors)).toBeVisible()
    await expect(page.getByRole('link', { name: c.office.cta })).toBeVisible()
    await expectNoAxeViolations(page)
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/press-${theme.name}-${info.project.name}.png`, fullPage: true })
  })
}

test('COPY puts the boilerplate on the clipboard and says COPIED', async ({ page, context, browserName, isMobile }) => {
  test.skip(isMobile || browserName !== 'chromium', 'clipboard permissions are Chromium’s')
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await open(page, DAY_ONE_MS + HOUR)
  const copy = page.getByRole('button', { name: c.boilerplate.copyLabel })
  await copy.click()
  await expect(copy).toHaveText(c.boilerplate.copied)
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(c.boilerplate.text)
  await expect(copy).toHaveText(c.boilerplate.copy, { timeout: 3000 })
})

test('the zip, the renders and the film are served', async ({ request, isMobile }) => {
  test.skip(isMobile, 'files, not layout: once is enough')
  for (const path of ['/press/hermes-motors-press-kit.zip', '/press/renders/hm27-side.png', '/brand/lockup.svg', '/press/first-light-1080p.mp4']) {
    const res = await request.head(path)
    expect(res.status(), path).toBe(200)
  }
})
