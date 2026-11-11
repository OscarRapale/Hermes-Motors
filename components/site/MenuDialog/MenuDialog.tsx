'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { footerCopy, headerCopy } from '@/content/copy/shared'
import { HomeLink } from '../HomeLink/HomeLink'
import { CloseIcon, MenuIcon } from '../icons/icons'
import { NavLinks } from '../NavLinks/NavLinks'
import { RichText } from '../RichText/RichText'
import { TestDriveLink } from '../TestDriveLink/TestDriveLink'
import styles from './MenuDialog.module.css'

const DIALOG_ID = 'site-menu'

/**
 * The menu under 900 px: a full-screen glass sheet. A native modal <dialog> traps focus, makes the
 * page inert and closes on Escape; focus goes back to the menu button on close.
 */
export function MenuDialog() {
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close after navigating to another page.
  useEffect(() => {
    dialog.current?.close()
  }, [pathname])

  const show = () => {
    dialog.current?.showModal()
    setOpen(true)
    closeButton.current?.focus()
  }
  const close = () => dialog.current?.close()

  // A modal <dialog> makes the page inert, but Tab can still leave for the browser's own UI.
  // Two sentinels at the ends of the sheet send focus back around (01-navigation-footer: "focus
  // trapped"). They work whatever the browser treats as tabbable (Safari skips links by default).
  const controls = () =>
    [...(dialog.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])].filter(
      (el) => el.offsetParent !== null,
    )
  const focusFirst = () => controls()[0]?.focus()
  const focusLast = () => controls().at(-1)?.focus()

  return (
    <>
      <button
        type="button"
        ref={menuButton}
        className={styles.menuButton}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={DIALOG_ID}
        onClick={show}
      >
        <span className="visually-hidden">{headerCopy.menuOpen}</span>
        <MenuIcon />
      </button>
      <dialog
        id={DIALOG_ID}
        ref={dialog}
        aria-label={headerCopy.menuOpen}
        className={styles.dialog}
        onClose={() => {
          setOpen(false)
          // Safari doesn't focus a clicked button, so the dialog may have nothing to return to.
          menuButton.current?.focus()
        }}
      >
        <span tabIndex={0} className={styles.sentinel} onFocus={focusLast} />
        <div className={styles.sheet}>
          <div className={styles.top}>
            <HomeLink />
            <button type="button" ref={closeButton} className={styles.close} onClick={close}>
              <span className="visually-hidden">{headerCopy.menuClose}</span>
              <CloseIcon />
            </button>
          </div>
          <nav aria-label={headerCopy.menuNavLabel}>
            <ul className={styles.list}>
              {/* same-page anchors (HM-27 → /#specs) don't change the pathname, so close here too */}
              <NavLinks linkClassName={styles.link} onNavigate={close} />
            </ul>
          </nav>
          <div className={styles.cta}>
            <TestDriveLink variant="menu" />
          </div>
          <p className={styles.credit}>
            <RichText value={footerCopy.credit} linkClassName={styles.creditLink} />
          </p>
        </div>
        <span tabIndex={0} className={styles.sentinel} onFocus={focusFirst} />
      </dialog>
    </>
  )
}
