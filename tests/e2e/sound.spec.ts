import { expect, test, type Page } from './test'
import { dashboard } from '@/content/copy/landing'
import { soundCopy } from '@/content/copy/shared'
import { SOUND_KEY } from '@/lib/audio/prefs'
import { SOUNDS } from '@/lib/audio/sounds'
import { DAY_ONE_MS } from '@/lib/clock/phase'

// ARCHITECTURE §7.7: no sound before the visitor interacts, the ignite button plays the engine, and the
// SOUND toggle turns everything off and remembers it.
const AT = DAY_ONE_MS + 3_600_000

// No trace in this file: its DOM snapshots count as user activation in Chromium, and the first test needs
// a page nobody has touched
test.use({ trace: 'off' })

async function openDay(page: Page, { muted = false } = {}) {
  await page.clock.setFixedTime(AT)
  await page.route('**/api/now', (route) => route.fulfill({ json: { now: AT } }))
  if (muted) await page.addInitScript((k) => localStorage.setItem(k, 'off'), SOUND_KEY)
  const audio: string[] = []
  page.on('request', (r) => {
    if (new URL(r.url()).pathname.startsWith('/audio/')) audio.push(new URL(r.url()).pathname)
  })
  await page.goto('/', { waitUntil: 'load' })
  return audio
}

const panel = (page: Page) => page.locator('[data-dashboard]')
const toggle = (page: Page) => panel(page).getByRole('button', { name: soundCopy.name })

// No Playwright DOM calls in this one: in Chromium every one of them counts as user activation, which would
// unlock sound. The page scrolls itself to the dashboard and says when it has ignited.
test('the first ignition, before any click, loads no sound', async ({ page }) => {
  await page.addInitScript(() => {
    addEventListener('DOMContentLoaded', () => {
      const panel = document.querySelector('[data-dashboard]')
      if (!panel) return
      const done = () => !panel.hasAttribute('data-ignite') && console.log('IGNITED')
      new MutationObserver(done).observe(panel, { attributes: true, attributeFilter: ['data-ignite'] })
      addEventListener('load', () => panel.scrollIntoView({ block: 'center' }))
    })
  })
  const ignited = page.waitForEvent('console', (m) => m.text() === 'IGNITED')
  const audio = await openDay(page)
  await ignited
  await page.waitForTimeout(500)
  expect(audio).toEqual([])
})

test('the ignite button starts the engine sound', async ({ page }) => {
  const loaded = page.waitForResponse((r) => r.url().endsWith(SOUNDS.ignition))
  const audio = await openDay(page)
  await panel(page).scrollIntoViewIfNeeded()
  await panel(page).getByRole('button', { name: dashboard.ignite }).click()
  expect((await loaded).status()).toBe(200)
  expect(audio).toEqual([SOUNDS.ignition]) // fetched once (on hover), played from the cache
})

test('SOUND: on by default, off with a click, remembered, and nothing loads while it is off', async ({ page }) => {
  await openDay(page)
  await panel(page).scrollIntoViewIfNeeded()
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')
  await expect(toggle(page)).toContainText(soundCopy.label)
  await toggle(page).click()
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
  expect(await page.evaluate((k) => localStorage.getItem(k), SOUND_KEY)).toBe('off')

  const audio = await openDay(page, { muted: true })
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
  await panel(page).scrollIntoViewIfNeeded()
  await panel(page).getByRole('button', { name: dashboard.ignite }).click()
  await page.waitForTimeout(500)
  expect(audio).toEqual([])

  await toggle(page).click() // back on: nothing stored
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate((k) => localStorage.getItem(k), SOUND_KEY)).toBeNull()
})

test('SOUND works from the keyboard and is at least 44 px tall', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard: desktop')
  await openDay(page)
  await toggle(page).focus()
  await page.keyboard.press('Enter')
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
  expect((await toggle(page).boundingBox())!.height).toBeGreaterThanOrEqual(44)
})
