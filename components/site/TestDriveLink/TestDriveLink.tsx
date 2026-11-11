import Link from 'next/link'
import { testDriveCopy } from '@/content/copy/shared'
import { driveHref } from '@/content/nav'
import { ArrowIcon, LockIcon } from '../icons/icons'
import styles from './TestDriveLink.module.css'

type Variant = 'header' | 'footer' | 'menu'

/**
 * Test drive button. Both states are rendered and CSS shows one by theme: open by day (First Light,
 * or previewing it, Decision D3), locked "opens 06:00" at night. The locked pill still links to
 * /drive, which shows the countdown until DAY_ONE (ARCHITECTURE §3).
 */
export function TestDriveLink({ variant, className = '' }: { variant: Variant; className?: string }) {
  const open =
    variant === 'header' ? (
      <Link href={driveHref} className={`day-only ${styles.base} ${styles.dark} ${className}`}>
        <span className={styles.dot} aria-hidden="true" />
        {testDriveCopy.open}
      </Link>
    ) : (
      <Link href={driveHref} className={`day-only ${styles.base} ${styles.red} ${styles[variant]} ${className}`}>
        {testDriveCopy.open}
        <span className={styles.knob} aria-hidden="true">
          <ArrowIcon className={styles.arrow} />
        </span>
      </Link>
    )

  return (
    <>
      {open}
      <Link href={driveHref} className={`night-only ${styles.base} ${styles.locked} ${styles[variant]} ${className}`}>
        <LockIcon className={styles.lock} />
        {testDriveCopy.locked}
      </Link>
    </>
  )
}
