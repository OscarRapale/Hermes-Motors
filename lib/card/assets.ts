// What next/og needs to draw the share cards and the link previews (server only): the fonts as TTF, the
// colours from tokens.css, and stills as PNG data URLs. Read from assets/ and styles/, once per process.

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { paletteFrom, type Palette } from './palette'

export type OgStill = 'car-day' | 'car-night' | 'exploded' | 'drive' | 'helmet-9' | 'helmet-19'

// scoped to assets/ so the build traces only that folder (next.config.ts includes it)
const asset = (folder: 'fonts' | 'card' | 'og', name: string) => readFile(join(process.cwd(), 'assets', folder, name))
const png = (b: Buffer) => `data:image/png;base64,${b.toString('base64')}`

type Font = { name: string; data: Buffer; weight: 400 | 500; style: 'normal' }

let base: Promise<{ fonts: Font[]; palette: Palette }> | null = null

/** The fonts and the palette */
export function cardBase() {
  base ??= (async () => {
    const [michroma, mono, monoMedium, tokens] = await Promise.all([
      asset('fonts', 'Michroma-Regular.ttf'),
      asset('fonts', 'GeistMono-Regular.ttf'),
      asset('fonts', 'GeistMono-Medium.ttf'),
      readFile(join(process.cwd(), 'styles', 'tokens.css'), 'utf8'),
    ])
    return {
      fonts: [
        { name: 'Michroma', data: michroma, weight: 400, style: 'normal' },
        { name: 'GeistMono', data: mono, weight: 400, style: 'normal' },
        { name: 'GeistMono', data: monoMedium, weight: 500, style: 'normal' },
      ] satisfies Font[],
      palette: paletteFrom(tokens),
    }
  })()
  return base
}

const stills = new Map<string, Promise<string>>()

/** The share cards' car (assets/card) */
export const cardCar = () => cached('card-car', () => asset('card', 'card-car.png'))
/** A link-preview still (assets/og, made by npm run assets) */
export const ogStill = (name: OgStill) => cached(name, () => asset('og', `${name}.png`))

function cached(key: string, read: () => Promise<Buffer>) {
  if (!stills.has(key)) stills.set(key, read().then(png))
  return stills.get(key)!
}
