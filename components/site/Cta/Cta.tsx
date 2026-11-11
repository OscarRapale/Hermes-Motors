import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowIcon, CalendarIcon } from '../icons/icons'
import styles from './Cta.module.css'

type Props = {
  href: string
  children: ReactNode
  variant: 'primary' | 'secondary'
  /** The white knob on primary buttons */
  icon?: 'arrow' | 'calendar'
  /** A file download (the .ics): a plain <a download>, not client navigation */
  download?: string
  className?: string
}

/** The landing's pill buttons (boards 09/10): Redline primary with a white knob, glass secondary. */
export function Cta({ href, children, variant, icon = 'arrow', download, className = '' }: Props) {
  const content =
    variant === 'primary' ? (
      <>
        {children}
        <span className={styles.knob} aria-hidden="true">
          {icon === 'calendar' ? <CalendarIcon /> : <ArrowIcon />}
        </span>
      </>
    ) : (
      children
    )
  const classes = `${styles.cta} ${styles[variant]} ${className}`
  return download ? (
    <a href={href} download={download} className={classes}>
      {content}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {content}
    </Link>
  )
}
