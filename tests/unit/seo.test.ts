import { describe, expect, it } from 'vitest'
import { seo } from '@/content/seo'

// docs/content/seo.md: descriptions ≤ 155 characters
describe('content/seo', () => {
  it.each(Object.entries(seo))('%s has a title and a description ≤ 155 characters', (_route, entry) => {
    expect(entry.title.length).toBeGreaterThan(0)
    expect(entry.description.length).toBeGreaterThan(0)
    expect(entry.description.length).toBeLessThanOrEqual(155)
  })
})
