// Copies the handoff assets from vendor/ into public/ and content/, converting stills with sharp.
// Source of truth: docs/design/assets.md. Safe to re-run; outputs are committed (rules/three.md).
//
//   npm run assets
//
// vendor/ stays pristine: this script only reads from it.

import { copyFile, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PKG = join(ROOT, 'vendor', 'hermes-hm27')
const ASSETS = join(ROOT, 'vendor', 'assets')
const PUBLIC = join(ROOT, 'public')

const KB = 1024
const WEBP = { quality: 82, effort: 6 }
const AVIF = { quality: 55, effort: 6 }

const written = []

async function copy(from, to) {
  await mkdir(dirname(to), { recursive: true })
  await copyFile(from, to)
  written.push(to)
}

async function copyDir(from, to, filter = () => true) {
  for (const name of await readdir(from)) {
    if (filter(name)) await copy(join(from, name), join(to, name))
  }
}

async function encode(input, out, width, format) {
  await mkdir(dirname(out), { recursive: true })
  const img = sharp(input).resize({ width, withoutEnlargement: true })
  await (format === 'avif' ? img.avif(AVIF) : img.webp(WEBP)).toFile(out)
  written.push(out)
}

const size = async (file) => (await stat(file)).size

// ── 1. The car package: models, livery masks, track textures (as delivered) ──────────────
for (const dir of ['models', 'livery', 'track']) {
  await rm(join(PUBLIC, dir), { recursive: true, force: true })
  await copyDir(join(PKG, 'public', dir), join(PUBLIC, dir))
}

// ── 2. Hero stills (the LCP image): AVIF + WebP at 1x and 2x from the PNG sources ────────
// 2495 px is the source width, i.e. the 2x of a ~1248 px layout width.
const HERO_WIDTHS = [1248, 2495]
for (const look of ['day', 'night']) {
  for (const w of HERO_WIDTHS) {
    for (const format of ['avif', 'webp']) {
      await encode(join(ASSETS, 'images', `hero-${look}.png`), join(PUBLIC, 'images', `hero-${look}-${w}.${format}`), w, format)
    }
  }
}

// ── 3. Specs fallback frames (WebP as delivered) and their layout (callout anchors) ─────
await rm(join(PUBLIC, 'images', 'specs'), { recursive: true, force: true })
await copyDir(join(ASSETS, 'images', 'specs'), join(PUBLIC, 'images', 'specs'), (n) => n.endsWith('.webp'))
await copy(join(ASSETS, 'images', 'specs', 'specs-layout.json'), join(ROOT, 'content', 'specs-layout.json'))

// ── 4. Helmet stills: the delivered 800 px WebP, plus AVIF from the PNG sources ─────────
await rm(join(PUBLIC, 'images', 'drivers'), { recursive: true, force: true })
const helmets = (await readdir(join(ASSETS, 'images', 'drivers'))).filter((n) => n.endsWith('.png')).map((n) => n.slice(0, -4))
for (const stem of helmets) {
  await copy(join(ASSETS, 'images', 'drivers', `${stem}.webp`), join(PUBLIC, 'images', 'drivers', `${stem}.webp`))
  await encode(join(ASSETS, 'images', 'drivers', `${stem}.png`), join(PUBLIC, 'images', 'drivers', `${stem}.avif`), 800, 'avif')
}

// ── 5. Drive stills (rotate screen, finish screens, Team page, OG) ──────────────────────
for (const name of ['drive.webp', 'drive-phone.webp']) await copy(join(ASSETS, 'images', name), join(PUBLIC, 'images', name))

// ── 6. Press kit: renders (PNG downloads), the First Light film and its poster ─────────
await rm(join(PUBLIC, 'press'), { recursive: true, force: true })
await copyDir(join(PKG, 'renders'), join(PUBLIC, 'press', 'renders'), (n) => n.endsWith('.png'))
await copy(join(ASSETS, 'film', 'first-light-1080p.mp4'), join(PUBLIC, 'press', 'first-light-1080p.mp4'))
await copy(join(ASSETS, 'film', 'first-light-poster.jpg'), join(PUBLIC, 'press', 'first-light-poster.jpg'))

// ── 7. The mark as SVG files (paths and colours from prototypes/Brand-Mark.dc.html) ─────
// The wordmark and lock-up are set in Michroma text on the board; they need outlining and land
// with the press kit (M5).
const H = 'M50,72 L64,72 L80,8 L66,8 Z M78,72 L92,72 L108,8 L94,8 Z M70,46 L86,46 L88.5,36 L72.5,36 Z'
const FEATHERS = 'M59,23 L57,32 L13,18 L6,10 Z M55.5,38 L53.5,46.5 L20,35.5 L14,27.5 Z M52,53 L50,61 L29,53.5 L24,45.5 Z'
const svg = (title, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" width="120" height="80" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`
const marks = {
  'mark.svg': svg('Hermes Motors mark', `<path fill="#0E0F11" d="${H}"/><path fill="#D5121E" d="${FEATHERS}"/>`),
  'mark-reversed.svg': svg('Hermes Motors mark, reversed', `<path fill="#FFFFFF" d="${H}"/><path fill="#D5121E" d="${FEATHERS}"/>`),
  'mark-white.svg': svg('Hermes Motors mark, one colour white', `<path fill="#FFFFFF" d="${H} ${FEATHERS}"/>`),
  'mark-black.svg': svg('Hermes Motors mark, one colour black', `<path fill="#0E0F11" d="${H} ${FEATHERS}"/>`),
}
await rm(join(PUBLIC, 'brand'), { recursive: true, force: true })
await mkdir(join(PUBLIC, 'brand'), { recursive: true })
for (const [name, body] of Object.entries(marks)) {
  await writeFile(join(PUBLIC, 'brand', name), body)
  written.push(join(PUBLIC, 'brand', name))
}

// ── Budgets (ARCHITECTURE §10) ──────────────────────────────────────────────────────────
const problems = []
for (const stem of helmets) {
  const limit = stem.includes('messenger') ? 110 * KB : 45 * KB
  for (const ext of ['webp', 'avif']) {
    const s = await size(join(PUBLIC, 'images', 'drivers', `${stem}.${ext}`))
    if (s > limit) problems.push(`${stem}.${ext} is ${Math.round(s / KB)} KB (budget ${limit / KB} KB)`)
  }
}
let specsTotal = 0
for (const n of await readdir(join(PUBLIC, 'images', 'specs'))) specsTotal += await size(join(PUBLIC, 'images', 'specs', n))
if (specsTotal > 2.5 * 1024 * KB) problems.push(`specs frames total ${(specsTotal / 1024 / KB).toFixed(2)} MB (budget 2.5 MB)`)

const rel = (p) => p.slice(ROOT.length + 1).replaceAll('\\', '/')
console.log(`Wrote ${written.length} files.`)
for (const f of written.filter((p) => /hero-|drivers|brand/.test(p))) console.log(`  ${rel(f)}  ${Math.round((await size(f)) / KB)} KB`)
console.log(`  specs frames: ${(specsTotal / 1024 / KB).toFixed(2)} MB total`)
if (problems.length) {
  console.warn(`\nOver budget:\n  ${problems.join('\n  ')}`)
  process.exitCode = 1
}
