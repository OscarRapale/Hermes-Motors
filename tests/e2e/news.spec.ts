import { expect, test, type Page } from './test'
import { newsCopy } from '@/content/copy/pages/news'
import { stories } from '@/content/news/stories'
import { beatDate } from '@/lib/clock/beats'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { expectNoAxeViolations } from './axe'

// News (06-news, board 26): a story shows from its beat; previewing shows them all (Oscar, 2026-11-13).
const HOUR = 3_600_000
const SHOTS = process.env.DRIVE_SHOTS
const story = (slug: string) => stories.find((s) => s.slug === slug)!

async function open(page: Page, path: string, at: number, preview?: 'day' | 'night') {
  await page.clock.setFixedTime(at)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: at } }))
  if (preview) await page.addInitScript((p) => sessionStorage.setItem('hermes.preview', p), preview)
  return page.goto(path)
}

const grid = (page: Page) => page.getByRole('list', { name: newsCopy.gridLabel })
const filters = (page: Page) => page.getByRole('group', { name: newsCopy.filtersLabel })

test.describe('/news', () => {
  test('the hour before Day One: the four teases, the newest leading', async ({ page }, info) => {
    await open(page, '/news', DAY_ONE_MS - HOUR)
    await expect(page.getByText(newsCopy.eyebrow(4))).toBeVisible()
    await expect(filters(page).getByRole('button')).toHaveCount(2) // All, Team
    await expect(filters(page).getByRole('button', { name: /All/ })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('link', { name: /TOMORROW/ })).toHaveAttribute('href', '/news/tomorrow-before-the-sun')
    await expect(grid(page).getByRole('listitem')).toHaveCount(3)
    await expect(page.getByText(story('first-light').dek)).toHaveCount(0)
    await expectNoAxeViolations(page)
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/news-night-${info.project.name}.png`, fullPage: true })
  })

  test('06:00 on Day One: First Light leads; 08:00 and 12:00 are still to come', async ({ page }) => {
    await open(page, '/news', DAY_ONE_MS + HOUR)
    await expect(page.getByText(newsCopy.eyebrow(5))).toBeVisible()
    await expect(page.getByText(newsCopy.latest)).toBeVisible()
    await expect(page.getByRole('link', { name: /FIRST LIGHT/ })).toHaveAttribute('href', '/news/first-light')
    await expect(page.getByText(story('the-test-drive-is-open').title)).toHaveCount(0)
    // Team: the lead is a Car story, so the grid alone, four teases
    await filters(page).getByRole('button', { name: /Team/ }).click()
    await expect(filters(page).getByRole('button', { name: /Team/ })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText(newsCopy.latest)).toHaveCount(0)
    await expect(grid(page).getByRole('listitem')).toHaveCount(4)
    await expectNoAxeViolations(page)
  })

  test('before the first beat: a word on when, unless previewing; previewing shows all seven', async ({ page }, info) => {
    const early = beatDate('D-43')
    await open(page, '/news', early)
    await expect(page.getByRole('heading', { name: newsCopy.empty.title })).toBeVisible()
    await expect(page.getByText(newsCopy.empty.body('D−42'))).toBeVisible()
    await expectNoAxeViolations(page)

    const preview = await page.context().newPage()
    await open(preview, '/news', early, 'day')
    await expect(preview.getByText(newsCopy.eyebrow(7))).toBeVisible()
    await expect(grid(preview).getByRole('listitem')).toHaveCount(6)
    await expect(preview.getByText(newsCopy.latest)).toBeVisible()
    if (SHOTS) await preview.screenshot({ path: `${SHOTS}/news-preview-${info.project.name}.png`, fullPage: true })
  })
})

test.describe('/news/[slug]', () => {
  test('the article: headline, art, body, the film, a copy-link button, the stories either side', async ({ page }, info) => {
    await open(page, '/news/first-light', DAY_ONE_MS + HOUR)
    await expect(page).toHaveTitle(`${story('first-light').title} · Hermes Motors`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('FIRST LIGHT.')
    await expect(page.getByRole('img', { name: (story('first-light').art as { alt: string }).alt })).toBeVisible()
    await expect(page.getByText('1,006 horsepower', { exact: false }).first()).toBeVisible()
    await expect(page.locator('video[src="/press/first-light-1080p.mp4"]')).toHaveAttribute('preload', 'none')
    await expect(page.getByRole('button', { name: newsCopy.article.copy })).toBeVisible()
    const pager = page.getByRole('navigation', { name: newsCopy.article.pager })
    await expect(pager.getByRole('link', { name: new RegExp(story('inside-the-hm27').title.slice(0, 20)) })).toBeVisible()
    await expect(pager.getByRole('link', { name: new RegExp(story('tomorrow-before-the-sun').title) })).toBeVisible()
    await expectNoAxeViolations(page)
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/article-${info.project.name}.png`, fullPage: true })
  })

  test('a story that doesn’t exist is a 404', async ({ page }) => {
    const res = await open(page, '/news/no-such-story', DAY_ONE_MS + HOUR)
    expect(res?.status()).toBe(404)
  })
})
