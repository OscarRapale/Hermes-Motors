import { expect, test } from '@playwright/test'
import { footerColumns, primaryNav } from '@/content/nav'
import { seo } from '@/content/seo'
import { expectNoAxeViolations } from './axe'

// Routes the shell links to before their milestone builds them (M3, M5). Next prefetches them and
// gets a 404 until then. Remove a path from this list when its page lands.
const BUILT = new Set(['/'])
const LINKED_NOT_YET_BUILT = new Set(
  [...primaryNav, ...footerColumns.flatMap((c) => c.links), { href: '/store' }, { href: '/privacy' }, { href: '/credits' }]
    .map(({ href }) => href.split('#')[0])
    .filter((path) => path && !BUILT.has(path)),
)

test('home renders with its title and passes axe', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(seo.home.title)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expectNoAxeViolations(page)
})

test('home loads without console errors or hydration mismatches', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const path = msg.location().url ? new URL(msg.location().url).pathname : ''
    if (msg.text().includes('404') && LINKED_NOT_YET_BUILT.has(path)) return
    errors.push(`${msg.text()} ${msg.location().url}`)
  })
  page.on('pageerror', (err) => errors.push(err.message))
  const synced = page.waitForResponse('**/api/now')
  await page.goto('/')
  await synced
  await page.waitForLoadState('networkidle')
  expect(errors).toEqual([])
})
