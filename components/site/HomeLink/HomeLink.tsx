import Link from 'next/link'
import { headerCopy, WORDMARK } from '@/content/copy/shared'
import { Mark } from '../Mark/Mark'
import styles from './HomeLink.module.css'

/** Mark + "HERMES" wordmark, linking home. */
export function HomeLink({ className, wordClassName }: { className?: string; wordClassName?: string }) {
  return (
    <Link href="/" aria-label={headerCopy.homeLabel} className={`${styles.link} ${className ?? ''}`}>
      <Mark />
      <span className={`${styles.word} ${wordClassName ?? ""}`} aria-hidden="true">
        {WORDMARK}
      </span>
    </Link>
  )
}
