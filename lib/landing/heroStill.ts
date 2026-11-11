// The hero stills' responsive sources (Decision D16), shared by <HeroStill> and the head script's
// preload, so both ask for exactly the same file.

export type Look = 'night' | 'day'

export const HERO_SOURCE = { width: 2495, height: 886 } // docs/design/assets.md
export const HERO_WIDTHS = [1248, 2495] as const // 1x and 2x, written by `npm run assets`
// The car is 1180 px wide in the 1412 px desktop card, and the full width of a phone.
export const HERO_SIZES = '(max-width: 899.98px) 100vw, min(1180px, 82vw)'

export const heroSrcSet = (look: Look, ext: 'avif' | 'webp') =>
  HERO_WIDTHS.map((w) => `/images/hero-${look}-${w}.${ext} ${w}w`).join(', ')

export const heroFallbackSrc = (look: Look) => `/images/hero-${look}-${HERO_WIDTHS[0]}.webp`
