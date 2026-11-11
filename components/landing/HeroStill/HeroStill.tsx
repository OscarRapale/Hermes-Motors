import { HERO_SIZES, HERO_SOURCE, heroFallbackSrc, heroSrcSet, type Look } from '@/lib/landing/heroStill'
import styles from './HeroStill.module.css'

/**
 * One hero still (Decision D16). Both looks are in the page and CSS hides one; both are lazy, so
 * the hidden one is never fetched. For the visible one, the head script preloads it at high
 * priority (on /) and the hero's inline script switches it to eager before first layout.
 * `suppressHydrationWarning`: that script changes `loading`.
 */
export function HeroStill({ look, alt, className = '' }: { look: Look; alt: string; className?: string }) {
  return (
    <picture className={`${styles.picture} ${className}`} data-hero-still={look}>
      <source type="image/avif" srcSet={heroSrcSet(look, 'avif')} sizes={HERO_SIZES} />
      <source type="image/webp" srcSet={heroSrcSet(look, 'webp')} sizes={HERO_SIZES} />
      <img
        className={styles.img}
        src={heroFallbackSrc(look)}
        width={HERO_SOURCE.width}
        height={HERO_SOURCE.height}
        alt={alt}
        loading="lazy"
        suppressHydrationWarning
      />
    </picture>
  )
}
