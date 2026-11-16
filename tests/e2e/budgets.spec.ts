import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { expect, test } from './test'

// ARCHITECTURE §10 (Decisions D15, D22): the JavaScript `/` loads before the first scroll, gzipped.
// Framework = what Next lists as the app's root entry (React, React DOM, the Next runtime) and its
// polyfills (.next/build-manifest.json); first-party = every other chunk the page loads. Next's prefetch of
// other routes (the header's visible links) is left out: it loads at idle, for those pages, not this one.
const KB = 1024
const TOTAL_KB = 206
const FIRST_PARTY_KB = 40

test('the JavaScript on / before scroll stays within budget (206 KB total, 40 KB ours)', async ({ page, isMobile }, info) => {
  test.skip(isMobile, 'measured once, on desktop')
  const manifest = JSON.parse(readFileSync(join(process.cwd(), '.next', 'build-manifest.json'), 'utf8'))
  const framework = new Set<string>([...manifest.rootMainFiles, ...manifest.polyfillFiles].map((f: string) => `/_next/${f}`))

  const scripts = new Map<string, Promise<Buffer>>()
  page.on('response', (res) => {
    const url = new URL(res.url())
    if (res.request().resourceType() === 'script' && url.pathname.startsWith('/_next/')) scripts.set(url.pathname, res.body())
  })
  await page.route('**/*', (route) => (route.request().headers()['next-router-prefetch'] ? route.abort() : route.continue()))
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  let total = 0
  let ours = 0
  const rows: string[] = []
  for (const [path, body] of scripts) {
    const gz = gzipSync(await body, { level: 9 }).length
    total += gz
    if (!framework.has(path)) ours += gz
    rows.push(`${framework.has(path) ? 'framework' : 'ours     '} ${(gz / KB).toFixed(1).padStart(6)} KB  ${path}`)
  }
  info.annotations.push({ type: 'js', description: `total ${(total / KB).toFixed(1)} KB, first-party ${(ours / KB).toFixed(1)} KB` })
  console.log(`JS on / before scroll: total ${(total / KB).toFixed(1)} KB gz, first-party ${(ours / KB).toFixed(1)} KB gz\n${rows.join('\n')}`)
  expect(total / KB, 'total JS (gz), KB').toBeLessThan(TOTAL_KB)
  expect(ours / KB, 'first-party JS (gz), KB').toBeLessThan(FIRST_PARTY_KB)
  // no three.js before scroll (D27): its chunk is far bigger than anything the page needs
  expect(scripts.size).toBeGreaterThan(0)
})
