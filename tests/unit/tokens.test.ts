import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

// CLAUDE.md "Tokens, not values": colours live in styles/tokens.css only, and every
// var(--…) the site uses is defined there (or by next/font).

const ROOT = join(__dirname, '..', '..')
const TOKENS = join(ROOT, 'styles', 'tokens.css')
const SCAN = ['app', 'components', 'lib', 'styles']
// The car package keeps its own colour tokens in components/hermes/livery.ts (vendor copy).
const SKIP = [join('components', 'hermes')]
const FONT_VARS = ['--font-michroma', '--font-geist', '--font-geist-mono']
// Component-local custom properties, set inline from the component (e.g. --local-bar).
const LOCAL = /^--local-/

function files(dir: string): string[] {
  let out: string[] = []
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    const path = join(dir, name)
    const rel = relative(ROOT, path)
    if (SKIP.some((s) => rel === s || rel.startsWith(s + sep))) continue
    if (statSync(path).isDirectory()) out = out.concat(files(path))
    else if (/\.(css|tsx?)$/.test(name)) out.push(path)
  }
  return out
}

const sources = SCAN.flatMap((d) => files(join(ROOT, d)))
const tokensCss = readFileSync(TOKENS, 'utf8')
const defined = new Set([...tokensCss.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))

describe('design tokens', () => {
  it('finds the source files', () => {
    expect(sources.length).toBeGreaterThan(0)
  })

  it.each(sources.filter((f) => f !== TOKENS).map((f) => [relative(ROOT, f), f]))(
    '%s has no raw colour values',
    (_rel, file) => {
      const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
      expect(text.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g) ?? []).toEqual([])
    },
  )

  it.each(sources.map((f) => [relative(ROOT, f), f]))('%s only uses defined tokens', (_rel, file) => {
    const used = [...readFileSync(file, 'utf8').matchAll(/var\((--[\w-]+)/g)].map((m) => m[1])
    const missing = used.filter((v) => !defined.has(v) && !FONT_VARS.includes(v) && !LOCAL.test(v))
    expect([...new Set(missing)]).toEqual([])
  })
})
