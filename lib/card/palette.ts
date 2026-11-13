// The share cards' colours, read from styles/tokens.css: the card renderer (next/og) can't use CSS
// variables, so the route reads the file and resolves the tokens it needs (var() included).

export const CARD_TOKENS = {
  carbon: '--carbon',
  redline: '--redline',
  redOnDark: '--red-on-dark',
  white: '--white',
  ink3Dark: '--ink-3-dark',
  cardTop: '--card-top',
  cardGrid: '--card-grid',
  cardMeta: '--card-meta',
} as const

export type Palette = Record<keyof typeof CARD_TOKENS, string>

/** The first definition of each token (the :root block comes first; themes and media queries override later) */
export function paletteFrom(css: string): Palette {
  const first = new Map<string, string>()
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (!first.has(m[1])) first.set(m[1], m[2].trim())
  }
  const resolve = (name: string, depth = 0): string => {
    const value = first.get(name)
    if (value === undefined || depth > 8) throw new Error(`card palette: ${name} is not in tokens.css`)
    const ref = value.match(/^var\((--[\w-]+)\)$/)
    return ref ? resolve(ref[1], depth + 1) : value
  }
  return Object.fromEntries(Object.entries(CARD_TOKENS).map(([key, name]) => [key, resolve(name)])) as Palette
}
