import { expect, test, type Page } from '@playwright/test'
import { footerCopy, headerCopy, previewCopy, testDriveCopy } from '@/content/copy/shared'
import { footerColumns, primaryNav } from '@/content/nav'
import { expectNoAxeViolations } from './axe'

const NAV_BREAKPOINT = 900

async function open(page: Page, theme: 'night' | 'day' = 'night') {
  // Before Day One the site is night; "day" previews First Light (ARCHITECTURE §4.4).
  if (theme === 'day') await page.addInitScript(() => sessionStorage.setItem('hermes.preview', 'day'))
  const synced = page.waitForResponse('**/api/now')
  await page.goto('/')
  await synced
}

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < NAV_BREAKPOINT


test.describe('header', () => {
  test('desktop shows the nav, Store, preview and the locked Test drive at night', async ({ page }) => {
    await open(page)
    test.skip(isPhone(page), 'nav collapses into the menu under 900 px')
    const header = page.getByRole('banner')
    const nav = header.getByRole('navigation', { name: headerCopy.primaryNavLabel })
    for (const { label } of primaryNav) await expect(nav.getByRole('link', { name: label })).toBeVisible()
    await expect(header.getByRole('link', { name: headerCopy.storeLabel })).toBeVisible()
    await expect(header.getByRole('button', { name: previewCopy.toDay })).toBeVisible()
    await expect(header.getByRole('link', { name: testDriveCopy.locked })).toBeVisible()
    await expect(header.getByRole('link', { name: testDriveCopy.open, exact: true })).toBeHidden()
  })

  test('previewing First Light opens the Test drive button (Decision D3)', async ({ page }) => {
    await open(page, 'day')
    test.skip(isPhone(page), 'the header Test drive button is desktop only')
    const header = page.getByRole('banner')
    await expect(header.getByRole('link', { name: testDriveCopy.open, exact: true })).toBeVisible()
    await expect(header.getByRole('link', { name: testDriveCopy.locked })).toBeHidden()
  })

  test('every header control is at least 44 × 44 px', async ({ page }) => {
    await open(page)
    const controls = page.getByRole('banner').locator('a, button')
    for (const control of await controls.all()) {
      if (!(await control.isVisible())) continue
      const box = await control.boundingBox()
      expect(box, await control.innerText()).not.toBeNull()
      expect(box!.height).toBeGreaterThanOrEqual(44)
      expect(box!.width).toBeGreaterThanOrEqual(44)
    }
  })

  test('the skip link is the first stop and jumps to the content', async ({ page, browserName }) => {
    // Safari doesn't Tab to links by default (users press Option+Tab), and Playwright's WebKit
    // can't emulate that, so this one runs on Chromium only.
    test.skip(browserName === 'webkit', 'Safari skips links on Tab by default')
    await open(page)
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: headerCopy.skipLink })
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.locator('main')).toBeFocused()
  })
})

test.describe('menu (under 900 px)', () => {
  test('opens as a modal, traps focus, closes with Escape and returns focus', async ({ page }) => {
    await open(page)
    test.skip(!isPhone(page), 'the menu button only shows under 900 px')
    const menuButton = page.getByRole('button', { name: headerCopy.menuOpen, exact: true })
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    await menuButton.click()

    const dialog = page.getByRole('dialog', { name: headerCopy.menuOpen })
    await expect(dialog).toBeVisible()
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    await expect(dialog.getByRole('button', { name: headerCopy.menuClose })).toBeFocused()
    for (const { label } of primaryNav) await expect(dialog.getByRole('link', { name: label })).toBeVisible()
    await expect(dialog.getByRole('link', { name: testDriveCopy.locked })).toBeVisible()
    await expectNoAxeViolations(page)

    // Focus never leaves the dialog.
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true)
    }

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    await expect(menuButton).toBeFocused()
  })

  test('the close button closes it', async ({ page }) => {
    await open(page, 'day')
    test.skip(!isPhone(page), 'the menu button only shows under 900 px')
    await page.getByRole('button', { name: headerCopy.menuOpen, exact: true }).click()
    const dialog = page.getByRole('dialog', { name: headerCopy.menuOpen })
    await expect(dialog.getByRole('link', { name: testDriveCopy.open, exact: true })).toBeVisible()
    await dialog.getByRole('button', { name: headerCopy.menuClose }).click()
    await expect(dialog).toBeHidden()
  })
})

test.describe('footer', () => {
  for (const theme of ['night', 'day'] as const) {
    test(`carries the credits and the fictional-team line (${theme})`, async ({ page }) => {
      await open(page, theme)
      const footer = page.getByRole('contentinfo')
      await expect(footer.getByRole('link', { name: '“2026 F1 CAR” by Abu Saif' })).toBeVisible()
      await expect(footer.getByRole('link', { name: 'a helmet by Miopass' })).toBeVisible()
      await expect(footer.getByRole('link', { name: 'CC BY 4.0' })).toBeVisible()
      await expect(footer.getByText(footerCopy.fictional)).toBeVisible()
      await expect(footer.getByText(theme === 'day' ? footerCopy.lineDay : footerCopy.lineNight)).toBeVisible()
      await expect(footer.getByText(theme === 'day' ? footerCopy.lineNight : footerCopy.lineDay)).toBeHidden()
      const nav = footer.getByRole('navigation', { name: footerCopy.navLabel })
      for (const column of footerColumns) {
        await expect(nav.getByRole('heading', { name: column.heading })).toBeVisible()
      }
      await expectNoAxeViolations(page)
    })
  }
})
