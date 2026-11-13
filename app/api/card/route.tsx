import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { CARD_SIZE, LinkCard, StoryCard } from '@/lib/card/cards'
import { paletteFrom } from '@/lib/card/palette'
import { parseShared } from '@/lib/game/share'

// The share cards (ARCHITECTURE §7.5, rules/game.md): `?lap=…&s=…&a=…[&j=1]&format=link|story`.
// Only a lap the game could have made gets a card; anything else is a 404. The same numbers always
// draw the same card, so it is cached for good.

// scoped to assets/ so the build traces only that folder (next.config.ts includes it)
const asset = (folder: 'fonts' | 'card', name: string) => readFile(join(process.cwd(), 'assets', folder, name))

let assets: ReturnType<typeof load> | null = null
async function load() {
  const [michroma, mono, monoMedium, car, tokens] = await Promise.all([
    asset('fonts', 'Michroma-Regular.ttf'),
    asset('fonts', 'GeistMono-Regular.ttf'),
    asset('fonts', 'GeistMono-Medium.ttf'),
    asset('card', 'card-car.png'),
    readFile(join(process.cwd(), 'styles', 'tokens.css'), 'utf8'),
  ])
  return {
    fonts: [
      { name: 'Michroma', data: michroma, weight: 400 as const, style: 'normal' as const },
      { name: 'GeistMono', data: mono, weight: 400 as const, style: 'normal' as const },
      { name: 'GeistMono', data: monoMedium, weight: 500 as const, style: 'normal' as const },
    ],
    car: `data:image/png;base64,${car.toString('base64')}`,
    palette: paletteFrom(tokens),
  }
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const formats = params.getAll('format')
  const format = formats.length === 1 ? formats[0] : null
  const lap = parseShared(params)
  if (!lap || (format !== 'link' && format !== 'story')) {
    return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } })
  }
  const { fonts, car, palette } = await (assets ??= load())
  const card = format === 'link' ? <LinkCard lap={lap} car={car} palette={palette} /> : <StoryCard lap={lap} car={car} palette={palette} />
  return new ImageResponse(card, {
    ...CARD_SIZE[format],
    fonts,
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}
