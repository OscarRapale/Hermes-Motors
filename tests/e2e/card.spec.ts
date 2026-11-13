import { expect, test } from './test'

// The share cards (ARCHITECTURE §7.5): PNGs at their sizes from a valid lap, 404 for anything else.
const LAP = 'lap=71692&s=19842.26323.25527&a=4'
const size = (png: Buffer) => ({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) })

test.describe('/api/card', () => {
  test.skip(({ isMobile }) => isMobile, 'a route, not a layout: once is enough')

  test('draws the link card at 1200 × 630 and the story at 1080 × 1920, cached for good', async ({ request }) => {
    const link = await request.get(`/api/card?${LAP}&format=link`)
    expect(link.status()).toBe(200)
    expect(link.headers()['content-type']).toBe('image/png')
    expect(link.headers()['cache-control']).toContain('immutable')
    expect(size(await link.body())).toEqual({ width: 1200, height: 630 })
    const story = await request.get(`/api/card?${LAP}&j=1&format=story`)
    expect(size(await story.body())).toEqual({ width: 1080, height: 1920 })
  })

  test('is a 404 for a lap the game couldn’t have made, or no format', async ({ request }) => {
    for (const q of [
      `${LAP}`,
      `${LAP}&format=square`,
      `${LAP}&format=link&format=story`,
      'lap=71692&s=19842.26323.25531&a=4&format=link', // 4 ms off
      'lap=59000&s=19000.20000.20000&a=4&format=link',
      'lap=71692&s=19842.26323.25527&a=abc&format=link',
    ]) {
      const res = await request.get(`/api/card?${q}`)
      expect(res.status(), q).toBe(404)
    }
  })
})
