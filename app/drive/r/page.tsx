import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Result } from '@/components/drive/Result/Result'
import { driveCopy } from '@/content/copy/drive'
import { resultSeo } from '@/content/seo'
import { cardText } from '@/lib/card/text'
import { resultView } from '@/lib/drive/result'
import { parseShared, shareQuery } from '@/lib/game/share'
import { siteUrl } from '@/lib/site'

// A shared lap (ARCHITECTURE §7.5): the result, no game, its card as the link preview. Only a lap the game
// could have made gets a page; proxy.ts turns anything else into a 404 before it gets here.

type Props = PageProps<'/drive/r'>

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const lap = parseShared(await searchParams)
  if (!lap) return { robots: { index: false } }
  const card = cardText(lap)
  const v = resultView(lap)
  const image = {
    url: `/api/card?${shareQuery(lap)}&format=link`,
    width: 1200,
    height: 630,
    alt: driveCopy.finish.cardAlt('link', v.said),
  }
  const title = resultSeo.title(card.won, card.gap)
  const description = resultSeo.description(v.you, v.his)
  return {
    metadataBase: new URL(siteUrl()),
    title: { absolute: title },
    description,
    // every lap is its own address: share them, don't index them
    robots: { index: false, follow: true },
    openGraph: { type: 'website', title, description, images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

async function Shared({ searchParams }: Pick<Props, 'searchParams'>) {
  const lap = parseShared(await searchParams)
  if (!lap) notFound()
  return <Result lap={lap} mode="shared" />
}

export default function SharedLapPage({ searchParams }: Props) {
  return (
    <Suspense fallback={null}>
      <Shared searchParams={searchParams} />
    </Suspense>
  )
}
