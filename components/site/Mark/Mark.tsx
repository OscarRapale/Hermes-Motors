import styles from './Mark.module.css'

/** The winged H (Brand-Mark board): letterform in currentColor, feathers in Redline, leaning 14°. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" aria-hidden="true" focusable="false" className={`${styles.mark} ${className ?? ''}`}>
      <path className={styles.h} d="M50,72 L64,72 L80,8 L66,8 Z M78,72 L92,72 L108,8 L94,8 Z M70,46 L86,46 L88.5,36 L72.5,36 Z" />
      <path className={styles.feathers} d="M59,23 L57,32 L13,18 L6,10 Z M55.5,38 L53.5,46.5 L20,35.5 L14,27.5 Z M52,53 L50,61 L29,53.5 L24,45.5 Z" />
    </svg>
  )
}
