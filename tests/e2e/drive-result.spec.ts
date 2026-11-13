import { expect, test } from './test'
import { driveCopy } from '@/content/copy/drive'
import { expectNoAxeViolations } from './axe'

// /drive/r (ARCHITECTURE §7.5): a shared lap, boards 14 and 17's layout. The game's finish shows the same
// component; a full lap can't be driven in CI (software WebGL), so the screen is checked here.
const WON = '/drive/r?lap=71692&s=19842.26323.25527&a=4'
const LOST = '/drive/r?lap=72058&s=19701.26311.26046&a=4'
const copy = driveCopy.finish
const SHOTS = process.env.DRIVE_SHOTS

test.describe('/drive/r', () => {
  test('shows the lap in the card’s words, its card, and the way to the drive; axe passes', async ({ page }, info) => {
    await page.goto(WON)
    await expect(page).toHaveTitle('I beat the messenger by 0.214 s · Hermes Motors')
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toContainText('I BEAT THE')
    await expect(h1).toContainText('MESSENGER BY')
    await expect(page.getByText(copy.kickerShort(4)).or(page.getByText(copy.kicker(4))).filter({ visible: true })).toHaveCount(1)
    await expect(page.getByRole('link', { name: copy.beatHim })).toHaveAttribute('href', '/drive')
    await expect(page.getByRole('button', { name: copy.share })).toBeVisible()
    await expect(page.getByText(copy.note)).toBeVisible()
    // the story card loads (the link card too on desktop)
    const story = page.getByRole('img', { name: copy.cardAlt('story', 'I beat the messenger by 0.214 s') })
    await expect(story).toBeVisible()
    await expect.poll(() => story.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1080)

    const wide = (page.viewportSize()?.width ?? 0) >= 700 && (page.viewportSize()?.height ?? 0) >= 600
    const table = page.getByRole('table', { name: copy.table })
    if (wide) {
      await expect(table).toBeVisible()
      await expect(table.getByRole('row', { name: /GAP/ })).toContainText('+0.422')
      await expect(table.getByRole('row', { name: /GAP/ })).toContainText('−0.214')
      await expect(page.getByRole('img', { name: copy.cardAlt('link', 'I beat the messenger by 0.214 s') })).toBeVisible()
    } else {
      // board 17: chips and the times instead of the table
      await expect(table).toBeHidden()
      await expect(page.getByText(copy.times('1:11.692', '1:11.906'))).toBeVisible()
      await expect(page.getByText('S1 +0.422')).toBeVisible()
    }
    if (info.project.name === 'iphone-14-landscape') {
      // sideways: the story card beside the text, not under it
      const text = (await h1.boundingBox())!
      const card = (await story.boundingBox())!
      expect(card.x).toBeGreaterThan(text.x + text.width / 2)
    }
    await expectNoAxeViolations(page)
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/result-${info.project.name}.png`, fullPage: true })
  })

  test('says the messenger held on, in red', async ({ page }) => {
    await page.goto(LOST)
    await expect(page).toHaveTitle('I chased the messenger to 0.152 s · Hermes Motors')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('I CHASED THE')
    await expect(page.locator('[data-state="behind"]').first()).toContainText('0.152')
  })

  test('gives the card as the link preview, and keeps the page out of search', async ({ page }) => {
    await page.goto(WON)
    const og = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(og).toContain('/api/card?lap=71692&s=19842.26323.25527&a=4&format=link')
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })

  test('is a 404 for a lap the game couldn’t have made', async ({ page }) => {
    for (const q of ['', '?lap=71692&s=19842.26323.25531&a=4', '?lap=71692&s=19842.26323.25527&a=0', '?lap=<b>&s=1.1.1&a=1']) {
      const res = await page.goto(`/drive/r${q}`)
      expect(res?.status(), q).toBe(404)
    }
  })

  test('on a computer, Share saves both cards and copies the link', async ({ page, context, browserName, isMobile }) => {
    test.skip(isMobile || browserName !== 'chromium', 'the share sheet path is the phone’s; clipboard permissions are Chromium’s')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto(WON)
    const downloads: string[] = []
    page.on('download', (d) => downloads.push(d.suggestedFilename()))
    await page.getByRole('button', { name: copy.share }).click()
    await expect(page.getByRole('status').filter({ hasText: copy.status.saved })).toBeVisible()
    await expect.poll(() => downloads.sort()).toEqual([copy.file('link'), copy.file('story')])
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toMatch(/\/drive\/r\?lap=71692&s=19842\.26323\.25527&a=4$/)
  })
})
