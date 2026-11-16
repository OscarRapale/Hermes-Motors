import { expect, test, type Page } from './test'
import { newsCopy } from '@/content/copy/pages/news'
import { pressCopy } from '@/content/copy/pages/press'
import { previewCopy } from '@/content/copy/shared'
import { BUILT_ROUTES } from '@/content/nav'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { expectNoAxeViolations } from './axe'

// ARCHITECTURE §11, WCAG 2.2 AA: every page in both themes on every device project passes axe; on desktop,
// every Tab stop shows its focus, and the controls not covered elsewhere work from the keyboard.
const HOUR = 3_600_000
const THEMES = [
  { name: 'night', at: DAY_ONE_MS - HOUR },
  { name: 'day', at: DAY_ONE_MS + HOUR },
] as const
const ROUTES = [...BUILT_ROUTES, '/news/first-light', '/drive/r?lap=71692&s=19842.26323.25527&a=4', '/no-such-page']

async function open(page: Page, path: string, at: number) {
  await page.clock.setFixedTime(at)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: at } }))
  // load, not networkidle: WebKit can hold a video element's connection open
  await page.goto(path, { waitUntil: 'load' })
}

for (const theme of THEMES) {
  test.describe(`axe (${theme.name})`, () => {
    for (const route of ROUTES) {
      test(route, async ({ page }) => {
        await open(page, route, theme.at)
        await expectNoAxeViolations(page)
      })
    }
  })
}

test.describe('the keyboard (desktop)', () => {
  test.skip(({ isMobile, browserName }) => isMobile || browserName !== 'chromium', 'Tab order is checked once, in Chromium')

  for (const route of ROUTES.filter((r) => r !== '/drive')) {
    test(`${route}: every Tab stop shows its focus`, async ({ page }) => {
      await open(page, route, DAY_ONE_MS + HOUR)
      const seen: string[] = []
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press('Tab')
        const stop = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null
          if (!el || el === document.body) return null
          // the ring is on the element, or on the card it stands for (news cards: the title's link covers it)
          const ring = (e: Element | null): boolean => {
            for (let n = e, depth = 0; n && depth < 5; n = n.parentElement, depth++) {
              const s = getComputedStyle(n)
              if (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2) return true
            }
            return false
          }
          const r = el.getBoundingClientRect()
          return {
            name: `${el.tagName.toLowerCase()} ${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40)}`,
            ring: ring(el),
            visible: r.width > 0 && r.height > 0,
          }
        })
        if (!stop) break
        if (seen.includes(stop.name) && seen.length > 3) break // back round to the start
        seen.push(stop.name)
        expect(stop.visible, `${stop.name} is focused but not visible`).toBe(true)
        expect(stop.ring, `${stop.name} shows no focus ring`).toBe(true)
      }
      expect(seen.length).toBeGreaterThan(3)
    })
  }

  test('the theme preview works from the keyboard', async ({ page }) => {
    await open(page, '/team', DAY_ONE_MS - HOUR)
    const toggle = page.getByRole('button', { name: previewCopy.toDay })
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
    await expect(page.getByRole('button', { name: previewCopy.toNight })).toBeFocused()
  })

  test('the news filters work from the keyboard', async ({ page }) => {
    await open(page, '/news', DAY_ONE_MS + 13 * HOUR)
    const team = page.getByRole('group', { name: newsCopy.filtersLabel }).getByRole('button', { name: /Team/ })
    await team.focus()
    await page.keyboard.press('Space')
    await expect(team).toHaveAttribute('aria-pressed', 'true')
  })

  test('COPY works from the keyboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await open(page, '/press', DAY_ONE_MS + HOUR)
    const copy = page.getByRole('button', { name: pressCopy.boilerplate.copyLabel })
    await copy.focus()
    await page.keyboard.press('Enter')
    await expect(copy).toHaveText(pressCopy.boilerplate.copied)
  })
})

test.describe('WCAG 2.2 AA, page by page (desktop Chromium)', () => {
  test.skip(({ isMobile, browserName }) => isMobile || browserName !== 'chromium', 'checked once')

  for (const route of ROUTES) {
    test(`${route}: one h1, reflows at 320 px, nothing keeps moving with reduced motion, targets ≥ 24 px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await open(page, route, DAY_ONE_MS + HOUR)
      // one page heading (axe best practice; the open test drive's is visually hidden)
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
      // 1.4.10 Reflow: no sideways scrolling at 320 CSS px
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, 'sideways scroll at 320 px').toBeLessThanOrEqual(0)
      // 2.3.3 / ARCHITECTURE §11: with reduced motion, no animation keeps running
      const running = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((a) => a.playState === 'running' && (a.effect?.getComputedTiming().iterations ?? 1) === Infinity)
          .map((a) => (a.effect as KeyframeEffect | null)?.target?.className?.toString().slice(0, 40) ?? '?'),
      )
      expect(running, 'endless animations with reduced motion').toEqual([])
      // 2.5.8 Target size (minimum): 24 × 24 for buttons and links that aren't inside a sentence
      const small = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('button, a[href], [role="button"]')]
          .filter((el) => {
            const s = getComputedStyle(el)
            if (s.display === 'none' || s.visibility === 'hidden' || el.closest('[inert], [aria-hidden="true"]')) return false
            if (s.display === 'inline' && el.closest('p, li, dd, blockquote')) return false // a link in running text
            const r = el.getBoundingClientRect()
            return r.width > 0 && (r.width < 24 || r.height < 24)
          })
          .map((el) => `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}"`),
      )
      expect(small, 'targets under 24 × 24').toEqual([])
    })
  }
})
