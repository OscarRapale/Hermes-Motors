// Copies the handoff assets from vendor/ into public/ and content/, converting stills with sharp.
// Source of truth: docs/design/assets.md. Safe to re-run; outputs are committed (rules/three.md).
//
//   npm run assets
//
// vendor/ stays pristine: this script only reads from it.

import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { zipSync } from 'fflate'
import satori from 'satori'
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
// copied once: content/specs-layout.json was edited in M2 (live scene anchors), so never overwrite it
const layout = join(ROOT, 'content', 'specs-layout.json')
if (!(await stat(layout).catch(() => null))) await copy(join(ASSETS, 'images', 'specs', 'specs-layout.json'), layout)

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
// The wordmark and lock-up (Michroma, outlined) are drawn in step 9, with the press kit.
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

// ── 8. The share cards' car (/api/card): the day hero still, trimmed to the car, transparent PNG ──
// (the card renderer reads PNG; assets/ is read by the route, not served)
await mkdir(join(ROOT, 'assets', 'card'), { recursive: true })
const cardCar = join(ROOT, 'assets', 'card', 'card-car.png')
await sharp(join(ASSETS, 'images', 'hero-day.png'))
  .trim()
  .resize({ width: 1100, withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toFile(cardCar)
written.push(cardCar)

// ── 8b. Link-preview stills (app/**/opengraph-image.tsx): PNG, since the renderer reads no WebP;
// in assets/, read at build, not served ──────────────────────────────────────────────────────────────
await rm(join(ROOT, 'assets', 'og'), { recursive: true, force: true })
await mkdir(join(ROOT, 'assets', 'og'), { recursive: true })
const ogStill = async (from, name, width, trim = true) => {
  const out = join(ROOT, 'assets', 'og', name)
  let img = sharp(from)
  if (trim) img = img.trim()
  await img.resize({ width, withoutEnlargement: true }).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(out)
  written.push(out)
}
await ogStill(join(ASSETS, 'images', 'hero-day.png'), 'car-day.png', 1000)
await ogStill(join(ASSETS, 'images', 'hero-night.png'), 'car-night.png', 1000)
await ogStill(join(PKG, 'renders', 'hm27-exploded.png'), 'exploded.png', 1000, false)
await ogStill(join(ASSETS, 'images', 'drive.webp'), 'drive.png', 1200, false)
await ogStill(join(ASSETS, 'images', 'drivers', 'helmet-gallery-9.png'), 'helmet-9.png', 520, false)
await ogStill(join(ASSETS, 'images', 'drivers', 'helmet-graphite-19.png'), 'helmet-19.png', 520, false)

// ── 9. The press kit (09-press-kit): the wordmark and lock-up outlined from Michroma, PNGs of every
// logo, light thumbnails of the renders for the page, and "Download everything" as one zip ──────────
const michroma = await readFile(join(ROOT, 'assets', 'fonts', 'Michroma-Regular.ttf'))

/** "HERMES" in Michroma as SVG paths (satori draws text as outlines), with its tight bounds */
async function outline(text, size, trackingEm) {
  const out = await satori(
    { type: 'div', props: { style: { display: 'flex', fontFamily: 'Michroma', fontSize: size, letterSpacing: size * trackingEm }, children: text } },
    { width: size * text.length * 2, height: Math.ceil(size * 1.6), fonts: [{ name: 'Michroma', data: michroma, weight: 400, style: 'normal' }] },
  )
  const d = [...out.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]).join(' ')
  const nums = d.match(/-?\d*\.?\d+(?:e-?\d+)?/g).map(Number)
  const xs = nums.filter((_, i) => i % 2 === 0)
  const ys = nums.filter((_, i) => i % 2 === 1)
  return { d, x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }
}

const word = await outline('HERMES', 100, 0.32) // the header's wordmark tracking
const r = (n) => Math.round(n * 100) / 100
const pad = word.h * 0.25
const wordmark = (title, ink) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(word.x - pad)} ${r(word.y - pad)} ${r(word.w + 2 * pad)} ${r(word.h + 2 * pad)}" role="img" aria-label="${title}"><title>${title}</title><path fill="${ink}" d="${word.d}"/></svg>\n`
// the lock-up: the mark, then the wordmark; the mark's H stands twice the letters' height, centred on them
const scale = (2 * word.h) / 64 // the H spans 64 of the mark's 80 units
const markW = 120 * scale
const markH = 80 * scale
const gap = word.h * 1.1
const lockW = markW + gap + word.w
const lockH = markH
const lockup = (title, ink) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(-pad)} ${r(-pad)} ${r(lockW + 2 * pad)} ${r(lockH + 2 * pad)}" role="img" aria-label="${title}"><title>${title}</title>` +
  `<g transform="scale(${r(scale)})"><path fill="${ink}" d="${H}"/><path fill="#D5121E" d="${FEATHERS}"/></g>` +
  `<g transform="translate(${r(markW + gap - word.x)} ${r(lockH / 2 - word.h / 2 - word.y)})"><path fill="${ink}" d="${word.d}"/></g></svg>\n`
const outlined = {
  'wordmark.svg': wordmark('Hermes Motors wordmark', '#0E0F11'),
  'wordmark-reversed.svg': wordmark('Hermes Motors wordmark, reversed', '#FFFFFF'),
  'lockup.svg': lockup('Hermes Motors lock-up: the mark and the wordmark', '#0E0F11'),
  'lockup-reversed.svg': lockup('Hermes Motors lock-up, reversed', '#FFFFFF'),
}
for (const [name, body] of Object.entries(outlined)) {
  await writeFile(join(PUBLIC, 'brand', name), body)
  written.push(join(PUBLIC, 'brand', name))
}
// every logo as a PNG too, 1600 px wide, transparent
for (const name of (await readdir(join(PUBLIC, 'brand'))).filter((n) => n.endsWith('.svg'))) {
  const out = join(PUBLIC, 'brand', name.replace(/\.svg$/, '.png'))
  await sharp(await readFile(join(PUBLIC, 'brand', name)), { density: 600 }).resize({ width: 1600 }).png().toFile(out)
  written.push(out)
}

// the renders' thumbnails for the page (the PNGs stay the downloads)
await rm(join(PUBLIC, 'images', 'press'), { recursive: true, force: true })
for (const name of (await readdir(join(PUBLIC, 'press', 'renders'))).filter((n) => n.endsWith('.png'))) {
  await encode(join(PUBLIC, 'press', 'renders', name), join(PUBLIC, 'images', 'press', name.replace(/\.png$/, '.webp')), 960, 'webp')
}

// "Download everything": renders, the mark, the film, and a README with the credit lines (credits.md)
const credits = await readFile(join(ROOT, 'docs', 'legal', 'credits.md'), 'utf8')
const quotes = [...credits.matchAll(/^> (.+)$/gm)].map((m) => m[1])
const readme = [
  'HERMES MOTORS · PRESS KIT · DAY ONE EDITION',
  '',
  quotes[0], // the fictional team
  '',
  'Credit for car images (run it with every render or film frame you publish):',
  quotes[1],
  '',
  'renders/  the HM-27, PNG, 2400 × 1500',
  'brand/    the mark, the wordmark and the lock-up, SVG and PNG. Keep the 14° lean and clear space of one feather around the mark. Never recolour the feathers.',
  'film/     First Light, MP4 1080p, 24 s, silent, and its poster frame',
  '',
].join('\r\n')
const kit = { 'hermes-motors-press-kit/README.txt': [new TextEncoder().encode(readme), { level: 6 }] }
const add = async (dir, folder) => {
  for (const name of await readdir(dir)) {
    if ((await stat(join(dir, name))).isDirectory()) continue
    kit[`hermes-motors-press-kit/${folder}/${name}`] = [new Uint8Array(await readFile(join(dir, name))), { level: 0 }] // already compressed
  }
}
await add(join(PUBLIC, 'press', 'renders'), 'renders')
await add(join(PUBLIC, 'brand'), 'brand')
kit['hermes-motors-press-kit/film/first-light-1080p.mp4'] = [new Uint8Array(await readFile(join(PUBLIC, 'press', 'first-light-1080p.mp4'))), { level: 0 }]
kit['hermes-motors-press-kit/film/first-light-poster.jpg'] = [new Uint8Array(await readFile(join(PUBLIC, 'press', 'first-light-poster.jpg'))), { level: 0 }]
const zip = join(PUBLIC, 'press', 'hermes-motors-press-kit.zip')
await writeFile(zip, zipSync(kit, { mtime: new Date('2026-11-16T00:00:00Z') }))
written.push(zip)

// ── 10. Sound (ARCHITECTURE §7.7, credits.md): vendor/audio → public/audio ──────────────────────
// The ignition plays as delivered. The test drive's engine is one steady stretch of the race-car
// recording (its pitch holds near 94 Hz from 26.0 to 28.6 s; the rest has gear changes in it), made into
// a seamless loop and written as a small mono WAV, since its pitch then follows the car's RPM.
// The sources aren't in git (the repo is public, and the licences don't allow passing the files on by
// themselves): without vendor/audio/, the committed public/audio/ is left as it is.
const AUDIO = join(ROOT, 'vendor', 'audio')
if (!(await stat(AUDIO).catch(() => null))) console.warn('vendor/audio/ not found: public/audio/ left as committed.')
else {
  await rm(join(PUBLIC, 'audio'), { recursive: true, force: true })
  await copy(join(AUDIO, 'car-engine.mp3'), join(PUBLIC, 'audio', 'ignition.mp3'))
  const { chromium } = await import('playwright-core')
  const { encodeWav, normalise, seamlessLoop, toMono } = await import('../lib/audio/loop.ts')
  const RATE = 32_000
  const browser = await chromium.launch()
  const page = await browser.newPage()
  // decode in the browser (Web Audio), resampled to RATE, every channel back as base64 floats
  const channels = await page.evaluate(
    async ({ b64, rate }) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
      const buf = await new OfflineAudioContext(1, 1, rate).decodeAudioData(bytes.buffer)
      const out = []
      for (let c = 0; c < buf.numberOfChannels; c++) {
        const u8 = new Uint8Array(buf.getChannelData(c).buffer)
        let s = ''
        for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000))
        out.push(btoa(s))
      }
      return out
    },
    { b64: (await readFile(join(AUDIO, 'race-car.mp3'))).toString('base64'), rate: RATE },
  )
  await browser.close()
  const floats = channels.map((b) => {
    const buf = Buffer.from(b, 'base64')
    return new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4)
  })
  const loop = normalise(seamlessLoop(toMono(floats), 26.0 * RATE, 28.6 * RATE, 0.2 * RATE), 0.9)
  const out = join(PUBLIC, 'audio', 'engine-loop.wav')
  await writeFile(out, encodeWav(loop, RATE))
  written.push(out)
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
for (const f of written.filter((p) => /hero-|drivers|brand|card-car|press-kit|images.press|assets.og|audio/.test(p))) console.log(`  ${rel(f)}  ${Math.round((await size(f)) / KB)} KB`)
console.log(`  specs frames: ${(specsTotal / 1024 / KB).toFixed(2)} MB total`)
if (problems.length) {
  console.warn(`\nOver budget:\n  ${problems.join('\n  ')}`)
  process.exitCode = 1
}
