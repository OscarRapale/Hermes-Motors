import Link from 'next/link'
import { headerCopy } from '@/content/copy/shared'
import { storeHref } from '@/content/nav'
import { HomeLink } from '../HomeLink/HomeLink'
import { BagIcon } from '../icons/icons'
import { MenuDialog } from '../MenuDialog/MenuDialog'
import { NavLinks } from '../NavLinks/NavLinks'
import { PreviewToggle } from '../PreviewToggle/PreviewToggle'
import { TestDriveLink } from '../TestDriveLink/TestDriveLink'
import styles from './Header.module.css'

/**
 * The glass header pill (docs/design/01-navigation-footer.md). From 900 px: nav, Store, preview,
 * Test drive. Under 900 px: wordmark, preview and the menu button (MenuDialog).
 */
export function Header() {
  return (
    <header className={styles.header}>
      <HomeLink wordClassName={styles.homeWord} />
      <nav aria-label={headerCopy.primaryNavLabel} className={styles.nav}>
        <ul className={styles.list}>
          <NavLinks linkClassName={styles.link} />
        </ul>
      </nav>
      <div className={styles.actions}>
        <Link href={storeHref} aria-label={headerCopy.storeLabel} className={`${styles.circle} ${styles.wide}`}>
          <BagIcon />
        </Link>
        <PreviewToggle />
        <span className={styles.wide}>
          <TestDriveLink variant="header" />
        </span>
        <MenuDialog />
      </div>
    </header>
  )
}
