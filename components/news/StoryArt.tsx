import Image from 'next/image'
import type { StoryArt as Art } from '@/content/news/stories'
import styles from './StoryArt.module.css'

const H = 'M50,72 L64,72 L80,8 L66,8 Z M78,72 L92,72 L108,8 L94,8 Z M70,46 L86,46 L88.5,36 L72.5,36 Z'
const FEATHERS = 'M59,23 L57,32 L13,18 L6,10 Z M55.5,38 L53.5,46.5 L20,35.5 L14,27.5 Z M52,53 L50,61 L29,53.5 L24,45.5 Z'

/** A story's image area (board 26): a still on its ground, the mark on Carbon, or feathers on black */
export function StoryArt({ art, sizes, priority = false }: { art: Art; sizes: string; priority?: boolean }) {
  if (art.kind === 'still') {
    return (
      <div className={styles.art} data-ground={art.ground}>
        <Image
          src={art.src}
          alt={art.alt}
          width={art.width}
          height={art.height}
          sizes={sizes}
          priority={priority}
          className={styles.img}
          data-fit={art.fit}
        />
      </div>
    )
  }
  if (art.kind === 'mark') {
    return (
      <div className={styles.art} data-ground="carbon">
        <svg viewBox="0 0 120 80" role="img" aria-label={art.alt} className={styles.mark}>
          <path d={H} className={styles.h} />
          <path d={FEATHERS} className={styles.feathers} />
        </svg>
      </div>
    )
  }
  return (
    <div className={styles.art} data-ground={art.ground}>
      <svg viewBox="0 0 90 70" role="img" aria-label={art.alt} className={styles.feathersArt}>
        <path d={art.path} className={styles.feathers} />
      </svg>
    </div>
  )
}
