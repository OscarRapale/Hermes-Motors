import { ImageResponse } from 'next/og'
import { cardBase, cardCar } from '@/lib/card/assets'
import { CARD_SIZE, LinkCard, StoryCard } from '@/lib/card/cards'
import { parseShared } from '@/lib/game/share'

// The share cards (ARCHITECTURE §7.5, rules/game.md): `?lap=…&s=…&a=…[&j=1]&format=link|story`.
// Only a lap the game could have made gets a card; anything else is a 404. The same numbers always
// draw the same card, so it is cached for good.

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const formats = params.getAll('format')
  const format = formats.length === 1 ? formats[0] : null
  const lap = parseShared(params)
  if (!lap || (format !== 'link' && format !== 'story')) {
    return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } })
  }
  const [{ fonts, palette }, car] = await Promise.all([cardBase(), cardCar()])
  const card = format === 'link' ? <LinkCard lap={lap} car={car} palette={palette} /> : <StoryCard lap={lap} car={car} palette={palette} />
  return new ImageResponse(card, {
    ...CARD_SIZE[format],
    fonts,
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}
