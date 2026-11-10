import { expect, test } from '@playwright/test'
import { seo } from '@/content/seo'
import { expectNoAxeViolations } from './axe'

test('home renders with its title and passes axe', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(seo.home.title)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expectNoAxeViolations(page)
})

test('home loads without console errors or hydration mismatches', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))
  const synced = page.waitForResponse('**/api/now')
  await page.goto('/')
  await synced
  await page.waitForLoadState('networkidle')
  expect(errors).toEqual([])
})
