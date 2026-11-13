// The share cards (board 14's previews, board 17's story), drawn by next/og from a validated lap only:
// every word is fixed copy or a number formatted here, never text from the query string.

import { driveCopy } from '@/content/copy/drive'
import { footerCopy, WORDMARK } from '@/content/copy/shared'
import { MAP_PATH } from '@/lib/drive/hud'
import type { SharedLap } from '@/lib/game/share'
import type { Palette } from './palette'
import { cardText } from './text'

export { cardText }

const copy = driveCopy.card
export const CARD_SIZE = { link: { width: 1200, height: 630 }, story: { width: 1080, height: 1920 } } as const
export type CardFormat = keyof typeof CARD_SIZE

const DISPLAY = 'Michroma'
const MONO = 'GeistMono'

// the winged H (components/site/Mark), in the card's own colours
const H = 'M50,72 L64,72 L80,8 L66,8 Z M78,72 L92,72 L108,8 L94,8 Z M70,46 L86,46 L88.5,36 L72.5,36 Z'
const FEATHERS = 'M59,23 L57,32 L13,18 L6,10 Z M55.5,38 L53.5,46.5 L20,35.5 L14,27.5 Z M52,53 L50,61 L29,53.5 L24,45.5 Z'

const background = (P: Palette) => ({
  backgroundColor: P.carbon,
  backgroundImage: `linear-gradient(${P.cardGrid} 1px, transparent 1px), linear-gradient(90deg, ${P.cardGrid} 1px, transparent 1px), linear-gradient(165deg, ${P.cardTop} 0%, ${P.carbon} 72%)`,
  backgroundSize: '48px 48px, 48px 48px, 100% 100%',
})

function Brand({ P, size }: { P: Palette; size: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.55 }}>
      <svg width={size * 1.5} height={size} viewBox="0 0 120 80">
        <path d={H} fill={P.white} />
        <path d={FEATHERS} fill={P.redline} />
      </svg>
      <span style={{ fontFamily: DISPLAY, fontSize: size * 0.62, letterSpacing: '0.32em', color: P.white }}>{WORDMARK}</span>
    </div>
  )
}

function Circuit({ P, width }: { P: Palette; width: number }) {
  return (
    <svg width={width} height={(width * 190) / 280} viewBox="0 0 280 190">
      <path d={MAP_PATH} fill="none" stroke={P.redline} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={52} cy={160} r={7} fill={P.white} />
    </svg>
  )
}

function Headline({ P, lines, size }: { P: Palette; lines: readonly string[]; size: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: DISPLAY, fontSize: size, lineHeight: 1.18, color: P.white }}>
      {lines.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  )
}

function Gap({ P, gap, size }: { P: Palette; gap: string; size: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: size * 0.08 }}>
      <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: size, lineHeight: 1, color: P.white, letterSpacing: '-0.02em' }}>{gap}</span>
      <span style={{ fontFamily: MONO, fontSize: size * 0.26, lineHeight: 1.3, color: P.redline }}>{copy.unit}</span>
    </div>
  )
}

function Credits({ P, size }: { P: Palette; size: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: size * 0.3, fontFamily: MONO, fontSize: size, color: P.cardMeta }}>
      <span>{copy.credit}</span>
      <span>{footerCopy.fictional}</span>
    </div>
  )
}

/** 1200 × 630: the link preview (OG, Twitter) */
type CardProps = { lap: SharedLap; car: string; palette: Palette }

export function LinkCard({ lap, car, palette: P }: CardProps) {
  const t = cardText(lap)
  return (
    <div style={{ ...background(P), width: 1200, height: 630, display: 'flex', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 48, left: 64, right: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Brand P={P} size={30} />
        <span style={{ fontFamily: MONO, fontSize: 15, letterSpacing: '0.22em', color: P.ink3Dark }}>{copy.tag}</span>
      </div>
      <div style={{ position: 'absolute', top: 150, left: 64, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Headline P={P} lines={t.headline} size={46} />
        <Gap P={P} gap={t.gap} size={150} />
      </div>
      <div style={{ position: 'absolute', top: 128, right: 96, display: 'flex' }}>
        <Circuit P={P} width={330} />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- drawn by next/og, not a page */}
      <img src={car} width={590} height={197} style={{ position: 'absolute', right: -24, bottom: 92 }} alt="" />
      <div style={{ position: 'absolute', left: 64, bottom: 100, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {t.jumpStart && <span style={{ fontFamily: MONO, fontSize: 15, letterSpacing: '0.16em', color: P.redOnDark }}>{t.jumpStart}</span>}
        <span style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.12em', color: P.ink3Dark }}>{`${t.you} · ${t.messenger}`}</span>
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, bottom: 30, display: 'flex' }}>
        <Credits P={P} size={12} />
      </div>
    </div>
  )
}

/** 1080 × 1920: the story (board 17), what a phone shares */
export function StoryCard({ lap, car, palette: P }: CardProps) {
  const t = cardText(lap)
  return (
    <div style={{ ...background(P), width: 1080, height: 1920, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 96px 80px' }}>
      <Brand P={P} size={48} />
      {/* eslint-disable-next-line @next/next/no-img-element -- drawn by next/og, not a page */}
      <img src={car} width={1000} height={335} style={{ marginTop: 110 }} alt="" />
      <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'stretch', gap: 30, marginTop: 120 }}>
        <Headline P={P} lines={t.headline} size={72} />
        <Gap P={P} gap={t.gap} size={210} />
      </div>
      <div style={{ display: 'flex', alignSelf: 'stretch', marginTop: 110 }}>
        <Circuit P={P} width={420} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'stretch', gap: 14, marginTop: 'auto', fontFamily: MONO, fontSize: 34, letterSpacing: '0.12em', color: P.ink3Dark }}>
        {t.jumpStart && <span style={{ fontSize: 24, letterSpacing: '0.16em', color: P.redOnDark }}>{t.jumpStart}</span>}
        <span>{t.you}</span>
        <span>{t.messenger}</span>
      </div>
      <div style={{ display: 'flex', alignSelf: 'stretch', marginTop: 56 }}>
        <Credits P={P} size={18} />
      </div>
    </div>
  )
}
