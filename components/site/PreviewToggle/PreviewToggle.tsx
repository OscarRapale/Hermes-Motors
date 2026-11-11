'use client'

import { previewCopy } from '@/content/copy/shared'
import { togglePreview } from '@/lib/clock/client'
import { MoonIcon, SunIcon } from '../icons/icons'
import styles from './PreviewToggle.module.css'

/**
 * The header's sun/moon button (ARCHITECTURE §4.4, boards 09/10). Both labels and both icons are
 * rendered; CSS on <html data-theme> shows the right one, so the server markup never mismatches.
 */
export function PreviewToggle() {
  return (
    <span className={styles.wrap}>
      <span className={`preview-only label ${styles.chip}`}>{previewCopy.chip}</span>
      <button type="button" className={styles.button} onClick={togglePreview}>
        <span className="night-only">
          <span className="visually-hidden">{previewCopy.toDay}</span>
          <SunIcon />
        </span>
        <span className="day-only">
          <span className="visually-hidden">{previewCopy.toNight}</span>
          <MoonIcon />
        </span>
      </button>
    </span>
  )
}
