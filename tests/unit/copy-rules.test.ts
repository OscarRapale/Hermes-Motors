import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// Oscar, 2026-11-13: users never hear about sign-up, accounts to create, or databases. Every string a
// visitor can see lives in content/ (CLAUDE.md), so the strings there are checked (comments aside).
const ROOT = join(__dirname, '..', '..')
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx|mdx)$/.test(n) ? [p] : []
  })

describe('copy rules', () => {
  it.each(files(join(ROOT, 'content')).map((f) => [relative(ROOT, f), f]))('%s never mentions sign-up or databases', (_rel, file) => {
    const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
    expect(text.match(/sign[- ]?up|database|log ?in to create/gi) ?? []).toEqual([])
  })
})
