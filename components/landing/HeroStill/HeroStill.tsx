import styles from './HeroStill.module.css'

const SOURCE = { width: 2495, height: 886 } // docs/design/assets.md
const WIDTHS = [1248, 2495] // 1x and 2x, written by `npm run assets`
// The car is 1180 px wide in a 1440 px card on desktop (82%), and ~98% of a phone's width.
const SIZES = '(max-width: 899.98px) 98vw, min(1180px, 82vw)'

const srcSet = (look: string, ext: 'avif' | 'webp') =>
  WIDTHS.map((w) => `/images/hero-${look}-${w}.${ext} ${w}w`).join(', ')

/**
 * One hero still (Decision D16). Both looks are in the page and CSS hides one; both are lazy, so
 * the hidden one is never fetched, and the hero's inline script makes the visible one eager and
 * high priority before first layout. `suppressHydrationWarning`: that script changes `loading`.
 */
export function HeroStill({ look, alt, className = '' }: { look: 'night' | 'day'; alt: string; className?: string }) {
  return (
    <picture className={`${styles.picture} ${className}`} data-hero-still={look}>
      <source type="image/avif" srcSet={srcSet(look, 'avif')} sizes={SIZES} />
      <source type="image/webp" srcSet={srcSet(look, 'webp')} sizes={SIZES} />
      <img
        className={styles.img}
        src={`/images/hero-${look}-${WIDTHS[0]}.webp`}
        width={SOURCE.width}
        height={SOURCE.height}
        alt={alt}
        loading="lazy"
        decoding="async"
        suppressHydrationWarning
      />
    </picture>
  )
}
