'use client'

import { useState } from 'react'
import { pressCopy } from '@/content/copy/pages/press'
import styles from './PressKit.module.css'

const c = pressCopy.boilerplate

/** COPY: puts the boilerplate on the clipboard; the label reads COPIED for 1.6 s (09-press-kit) */
export function CopyBoilerplate() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // no clipboard: the text is on the page to select
    }
  }
  return (
    <button type="button" className={styles.copy} onClick={copy} aria-label={c.copyLabel}>
      <span aria-live="polite">{copied ? c.copied : c.copy}</span>
    </button>
  )
}
