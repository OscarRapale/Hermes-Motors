'use client'

import { useEffect } from 'react'
import { driveHref } from '@/content/nav'

const DRIVERS = '/drivers'

/**
 * Warms the 3D on intent (rules/three.md): the first hover, focus or touch on a link to /drive starts loading
 * the test drive's scene and car; on a link to /drivers, the live helmet and its model. Not on visibility:
 * the header's links are on every page, and the landing page loads no three.js before scroll
 * (ARCHITECTURE §10).
 */
export function DrivePreload(): null {
  useEffect(() => {
    const done = new Set<string>()
    const onIntent = (e: Event) => {
      if (!(e.target instanceof Element)) return
      const href = e.target.closest('a')?.getAttribute('href')
      if (!href || done.has(href)) return
      if (href === driveHref) {
        void import('@/components/hermes/HermesCar').then((m) => m.preloadHermesCar('game'))
        void import('@/components/drive/DriveScene/DriveScene')
      } else if (href === DRIVERS) {
        void import('@/components/hermes/HermesHelmet').then((m) => m.preloadHermesHelmet())
        void import('@/components/drivers/DriverHelmet')
      } else return
      done.add(href)
      if (done.size === 2) remove()
    }
    const events = ['pointerover', 'focusin', 'touchstart'] as const
    const remove = () => events.forEach((type) => document.removeEventListener(type, onIntent))
    events.forEach((type) => document.addEventListener(type, onIntent, { passive: true }))
    return remove
  }, [])
  return null
}
