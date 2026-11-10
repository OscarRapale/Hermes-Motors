import { expect, test } from '@playwright/test'
import { seo } from '@/content/seo'
import { expectNoAxeViolations } from './axe'

test('home renders with its title and passes axe', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(seo.home.title)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expectNoAxeViolations(page)
})
