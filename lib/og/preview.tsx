// A route's link preview (1200 × 630), drawn by next/og at build time: the brand, the eyebrow, the page's
// headline (the middle line dimmed), its art, and the credit lines whenever the car or a helmet shows.

import { ImageResponse } from 'next/og'
import { footerCopy, WORDMARK } from '@/content/copy/shared'
import { ogCredits, type OgPreview } from '@/content/og'
import { cardBase, ogStill } from '@/lib/card/assets'
import type { Palette } from '@/lib/card/palette'

export const OG_SIZE = { width: 1200, height: 630 }

const H = 'M50,72 L64,72 L80,8 L66,8 Z M78,72 L92,72 L108,8 L94,8 Z M70,46 L86,46 L88.5,36 L72.5,36 Z'
const FEATHERS = 'M59,23 L57,32 L13,18 L6,10 Z M55.5,38 L53.5,46.5 L20,35.5 L14,27.5 Z M52,53 L50,61 L29,53.5 L24,45.5 Z'

type Ink = { bg: string; grid: string; top: string; ink: string; dim: string; meta: string; red: string }

function inks(P: Palette, theme: OgPreview['theme']): Ink {
  return theme === 'night'
    ? { bg: P.carbon, grid: P.cardGrid, top: P.cardTop, ink: P.galleryWhite, dim: P.cardMeta, meta: P.cardMeta, red: P.redOnDark }
    : { bg: P.studioGray, grid: P.cardGridLight, top: P.white, ink: P.carbon, dim: P.cardMetaLight, meta: P.cardMetaLight, red: P.redOnLight }
}

const DISPLAY = 'Michroma'
const MONO = 'GeistMono'

async function Art({ p, P, ink }: { p: OgPreview; P: Palette; ink: Ink }) {
  const a = p.art
  if (a.kind === 'still') {
    const src = await ogStill(a.still)
    if (a.still === 'drive') {
      // the drive still fills the right of the card
      return (
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 540, display: 'flex' }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- drawn by next/og */}
          <img src={src} width={540} height={630} style={{ width: 540, height: 630, objectFit: 'cover' }} alt="" />
        </div>
      )
    }
    if (a.still === 'exploded') {
      // the render has its own studio ground: framed, as on the press kit page
      return (
        // eslint-disable-next-line @next/next/no-img-element -- drawn by next/og
        <img src={src} width={520} height={325} style={{ position: 'absolute', right: 48, top: 150, borderRadius: 24 }} alt="" />
      )
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element -- drawn by next/og
      <img src={src} width={640} height={214} style={{ position: 'absolute', right: -30, bottom: 110 }} alt="" />
    )
  }
  if (a.kind === 'helmets') {
    const [nine, nineteen] = await Promise.all([ogStill('helmet-9'), ogStill('helmet-19')])
    return (
      <div style={{ position: 'absolute', right: 24, bottom: 96, display: 'flex', gap: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- drawn by next/og */}
        <img src={nine} width={250} height={206} alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element -- drawn by next/og */}
        <img src={nineteen} width={250} height={206} alt="" />
      </div>
    )
  }
  if (a.kind === 'feathers') {
    return (
      <svg width={420} height={327} viewBox="0 0 90 70" style={{ position: 'absolute', right: 70, top: 150 }}>
        <path d={a.path} fill={P.redline} />
      </svg>
    )
  }
  return (
    <svg width={330} height={220} viewBox="0 0 120 80" style={{ position: 'absolute', right: 90, top: 190 }}>
      <path d={H} fill={ink.ink} />
      <path d={FEATHERS} fill={P.redline} />
    </svg>
  )
}

/** The ImageResponse for a preview */
export async function renderPreview(p: OgPreview, headers?: Record<string, string>): Promise<ImageResponse> {
  const { fonts, palette: P } = await cardBase()
  const ink = inks(P, p.theme)
  const credit = p.art.kind === 'still' ? ogCredits.car : p.art.kind === 'helmets' ? ogCredits.helmet : null
  const art = await Art({ p, P, ink })
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          position: 'relative',
          backgroundColor: ink.bg,
          backgroundImage: `linear-gradient(${ink.grid} 1px, transparent 1px), linear-gradient(90deg, ${ink.grid} 1px, transparent 1px), linear-gradient(165deg, ${ink.top} 0%, ${ink.bg} 72%)`,
          backgroundSize: '48px 48px, 48px 48px, 100% 100%',
        }}
      >
        {art}
        <div style={{ position: 'absolute', top: 48, left: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width={45} height={30} viewBox="0 0 120 80">
            <path d={H} fill={ink.ink} />
            <path d={FEATHERS} fill={P.redline} />
          </svg>
          <span style={{ fontFamily: DISPLAY, fontSize: 19, letterSpacing: '0.32em', color: ink.ink }}>{WORDMARK}</span>
        </div>
        <div style={{ position: 'absolute', top: 150, left: 64, display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 600 }}>
          <span style={{ fontFamily: MONO, fontSize: 16, letterSpacing: '0.2em', color: ink.red }}>{p.eyebrow}</span>
          <div style={{ display: 'flex', flexDirection: 'column', fontFamily: DISPLAY, fontSize: p.headline.length > 2 ? 50 : 56, lineHeight: 1.12 }}>
            {p.headline.map((line, i) => (
              <span key={line} style={{ color: i === 1 && p.headline.length > 2 ? ink.dim : ink.ink }}>
                {line}
              </span>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', left: 64, bottom: 30, width: 560, display: 'flex', flexDirection: 'column', gap: 4, fontFamily: MONO, fontSize: 12, lineHeight: 1.4, color: ink.meta }}>
          {credit && <span>{credit}</span>}
          <span>{footerCopy.fictional}</span>
        </div>
      </div>
    ),
    // a day on the edge: a preview changes only with a deploy (its URL carries a hash of the image file)
    { ...OG_SIZE, fonts, headers: headers ?? { 'Cache-Control': 'public, max-age=86400' } },
  )
}
