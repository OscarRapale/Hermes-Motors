import { describe, expect, it } from 'vitest'
import { DAY_ONE_MS, PREVIEW_KEY, themeScript } from '@/lib/clock'

/** Runs the inline head script against a fake document, sessionStorage and clock. */
function run(now: number, stored: string | null, opts: { storageThrows?: boolean } = {}) {
  const attrs: Record<string, string> = {}
  const storage = new Map<string, string>(stored === null ? [] : [[PREVIEW_KEY, stored]])
  const document = {
    documentElement: {
      setAttribute: (k: string, v: string) => {
        attrs[k] = v
      },
    },
  }
  const sessionStorage = {
    getItem: (k: string) => {
      if (opts.storageThrows) throw new Error('blocked')
      return storage.get(k) ?? null
    },
    removeItem: (k: string) => storage.delete(k),
  }
  const FakeDate = { now: () => now }
  new Function('document', 'sessionStorage', 'Date', themeScript())(document, sessionStorage, FakeDate)
  return { attrs, stored: storage.get(PREVIEW_KEY) ?? null }
}

describe('inline theme script', () => {
  it('paints Before Dawn until DAY_ONE and First Light from it', () => {
    expect(run(DAY_ONE_MS - 1, null).attrs).toEqual({ 'data-phase': 'before', 'data-theme': 'night' })
    expect(run(DAY_ONE_MS, null).attrs).toEqual({ 'data-phase': 'firstLight', 'data-theme': 'day' })
  })

  it('applies a stored preview of the other state without changing the phase', () => {
    expect(run(DAY_ONE_MS - 1, 'day').attrs).toEqual({
      'data-phase': 'before',
      'data-theme': 'day',
      'data-preview': '',
    })
    expect(run(DAY_ONE_MS + 1, 'night').attrs).toEqual({
      'data-phase': 'firstLight',
      'data-theme': 'night',
      'data-preview': '',
    })
  })

  it('drops a preview that the real phase has caught up with', () => {
    const r = run(DAY_ONE_MS + 1, 'day')
    expect(r.attrs).toEqual({ 'data-phase': 'firstLight', 'data-theme': 'day' })
    expect(r.stored).toBeNull()
  })

  it('ignores junk and blocked storage', () => {
    expect(run(DAY_ONE_MS - 1, 'sunrise').attrs['data-theme']).toBe('night')
    expect(run(DAY_ONE_MS - 1, 'day', { storageThrows: true }).attrs['data-theme']).toBe('night')
  })
})
