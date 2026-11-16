'use client'

import { soundCopy } from '@/content/copy/shared'
import { setSoundOn } from '@/lib/audio/prefs'
import { useSoundOn } from '@/lib/audio/useSound'
import styles from './SoundToggle.module.css'

// Two and a half periods of a sine (period 16, height ±4.5 around 6), drawn with quadratic halves; the
// path scrolls left by one period and repeats, so the 24-unit window always shows a moving wave.
const WAVE = 'M0 6 Q4 1.5 8 6 T16 6 T24 6 T32 6 T40 6 T48 6'

/**
 * "SOUND:" and a live wave (ARCHITECTURE §7.7, Oscar's reference): the wave runs while sound is on and
 * flattens to a line when it's off. One preference for the whole site; used by the dashboard and the
 * test drive. Reduced motion: the wave stands still.
 */
export function SoundToggle({ className = '' }: { className?: string }) {
  const on = useSoundOn()
  return (
    <button
      type="button"
      className={`${styles.toggle} ${className}`}
      aria-label={soundCopy.name}
      aria-pressed={on}
      onClick={() => setSoundOn(!on)}
    >
      <span className={styles.label} aria-hidden="true">
        {soundCopy.label}
      </span>
      <svg className={styles.wave} viewBox="0 0 24 12" aria-hidden="true" focusable="false">
        <g className={styles.height}>
          <path className={styles.line} d={WAVE} />
        </g>
      </svg>
    </button>
  )
}
