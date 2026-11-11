import { test as base, expect } from '@playwright/test'

/**
 * The e2e `test`. Headless browsers draw WebGL in software (seconds per frame), so by default the
 * page sees no WebGL2 and the specs section uses its frame fallback (ARCHITECTURE §6). A test that
 * checks the live 3D car opts in with `test.use({ webgl: true })`.
 */
export const test = base.extend<{ webgl: boolean }>({
  webgl: [false, { option: true }],
  // (Playwright's fixture callback is usually called `use`; renamed so the React hooks lint rule
  // doesn't mistake it for a hook.)
  page: async ({ page, webgl }, provide) => {
    if (!webgl) {
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext
        // @ts-expect-error -- a test stub: narrowing getContext's overloads is not worth it
        HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
          if (type === 'webgl2') return null
          return original.apply(this, [type, ...args] as Parameters<typeof original>)
        }
      })
    }
    await provide(page)
  },
})

export { expect }
export type { Page } from '@playwright/test'
