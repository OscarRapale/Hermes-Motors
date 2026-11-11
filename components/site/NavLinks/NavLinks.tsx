'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { primaryNav } from '@/content/nav'

/** The primary nav links, marking the current page (aria-current="page"). */
export function NavLinks({ linkClassName, onNavigate }: { linkClassName?: string; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <>
      {primaryNav.map(({ label, href }) => {
        const current = !href.includes('#') && (pathname === href || pathname.startsWith(`${href}/`))
        return (
          <li key={href}>
            <Link href={href} className={linkClassName} aria-current={current ? 'page' : undefined} onClick={onNavigate}>
              {label}
            </Link>
          </li>
        )
      })}
    </>
  )
}
