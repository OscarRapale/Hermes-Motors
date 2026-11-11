import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// docs/design/assets.md and ARCHITECTURE §10. `npm run assets` writes these from vendor/.

const ROOT = join(__dirname, '..', '..')
const PUBLIC = join(ROOT, 'public')
const KB = 1024
const kb = (path: string) => statSync(path).size / KB

describe('car package assets', () => {
  // Every public path the car components load: models, livery masks, track textures.
  const sources = readdirSync(join(ROOT, 'components', 'hermes')).map((f) =>
    readFileSync(join(ROOT, 'components', 'hermes', f), 'utf8'),
  )
  const paths = [...new Set(sources.flatMap((s) => [...s.matchAll(/'(\/(?:models|livery|track)\/[\w.-]+)'/g)].map((m) => m[1])))]

  it('finds the paths the components load', () => {
    expect(paths).toEqual(expect.arrayContaining(['/models/hermes-hm27.glb', '/models/hermes-hm27-game.glb', '/models/hermes-helmet.glb']))
  })

  it.each(paths)('%s is in public/', (path) => {
    expect(existsSync(join(PUBLIC, path))).toBe(true)
  })

  it('the models are byte-identical to the package (never edited by hand)', () => {
    for (const name of readdirSync(join(ROOT, 'vendor', 'hermes-hm27', 'public', 'models'))) {
      const vendor = readFileSync(join(ROOT, 'vendor', 'hermes-hm27', 'public', 'models', name))
      expect(readFileSync(join(PUBLIC, 'models', name)).equals(vendor), name).toBe(true)
    }
  })

  it('components/hermes matches the package', () => {
    for (const name of readdirSync(join(ROOT, 'vendor', 'hermes-hm27', 'src', 'hermes'))) {
      const vendor = readFileSync(join(ROOT, 'vendor', 'hermes-hm27', 'src', 'hermes', name), 'utf8')
      expect(readFileSync(join(ROOT, 'components', 'hermes', name), 'utf8'), name).toBe(vendor)
    }
  })
})

describe('images', () => {
  it.each(['day', 'night'])('hero %s has AVIF and WebP at 1x and 2x', (look) => {
    for (const w of [1248, 2495]) {
      for (const ext of ['avif', 'webp']) expect(existsSync(join(PUBLIC, 'images', `hero-${look}-${w}.${ext}`))).toBe(true)
    }
  })

  it('has no PNG sources in public/images', () => {
    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [n]))
    expect(walk(join(PUBLIC, 'images')).filter((n) => n.endsWith('.png'))).toEqual([])
  })

  it('has the 19 specs frames within 2.5 MB, and their layout', () => {
    const frames = readdirSync(join(PUBLIC, 'images', 'specs')).filter((n) => /^hm27-specs-\d{2}\.webp$/.test(n))
    expect(frames).toHaveLength(19)
    const total = frames.reduce((sum, n) => sum + kb(join(PUBLIC, 'images', 'specs', n)), 0)
    expect(total).toBeLessThanOrEqual(2.5 * 1024)
    expect(existsSync(join(ROOT, 'content', 'specs-layout.json'))).toBe(true)
  })

  it('helmet stills are within budget (45 KB; the messenger 110 KB)', () => {
    const dir = join(PUBLIC, 'images', 'drivers')
    const stills = readdirSync(dir).filter((n) => /\.(webp|avif)$/.test(n))
    expect(stills.length).toBe(10)
    for (const n of stills) expect(kb(join(dir, n)), n).toBeLessThanOrEqual(n.includes('messenger') ? 110 : 45)
  })

  it('has the drive stills', () => {
    for (const n of ['drive.webp', 'drive-phone.webp']) expect(existsSync(join(PUBLIC, 'images', n))).toBe(true)
  })
})

describe('press kit and brand files', () => {
  it('has the renders, the film and its poster', () => {
    expect(readdirSync(join(PUBLIC, 'press', 'renders')).filter((n) => n.endsWith('.png')).length).toBe(6)
    expect(existsSync(join(PUBLIC, 'press', 'first-light-1080p.mp4'))).toBe(true)
    expect(existsSync(join(PUBLIC, 'press', 'first-light-poster.jpg'))).toBe(true)
  })

  it('has the four mark SVGs', () => {
    for (const n of ['mark.svg', 'mark-reversed.svg', 'mark-white.svg', 'mark-black.svg']) {
      const svg = readFileSync(join(PUBLIC, 'brand', n), 'utf8')
      expect(svg, n).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
    }
  })
})
