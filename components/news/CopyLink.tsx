'use client'

import { useState } from 'react'
import { newsCopy } from '@/content/copy/pages/news'
import styles from './Article.module.css'

/** The article's share link (ARCHITECTURE §8): copies this page's address */
export function CopyLink() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // no clipboard: the address bar has it
    }
  }
  return (
    <button type="button" className={styles.copy} onClick={copy} aria-live="polite">
      {copied ? newsCopy.article.copied : newsCopy.article.copy}
    </button>
  )
}
