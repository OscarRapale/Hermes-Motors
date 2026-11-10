'use client'

import { previewCopy } from '@/content/copy/shared'
import { togglePreview } from '@/lib/clock/client'
import styles from './PreviewToggle.module.css'

/**
 * The header's sun/moon button (ARCHITECTURE §4.4, board 09/10). Both labels and both icons are
 * rendered; CSS on <html data-theme> shows the right one, so the server markup never mismatches.
 */
export function PreviewToggle() {
  return (
    <span className={styles.wrap}>
      <button type="button" className={styles.button} onClick={togglePreview}>
        <span className="night-only">
          <span className="visually-hidden">{previewCopy.toDay}</span>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className={styles.icon}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
          </svg>
        </span>
        <span className="day-only">
          <span className="visually-hidden">{previewCopy.toNight}</span>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className={styles.icon}>
            <path d="M19.5 14.6A7.5 7.5 0 0 1 9.4 4.5a7.5 7.5 0 1 0 10.1 10.1Z" />
          </svg>
        </span>
      </button>
      <span className={`preview-only label ${styles.chip}`}>{previewCopy.chip}</span>
    </span>
  )
}
