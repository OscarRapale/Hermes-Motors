'use client'

import { useEffect } from 'react'
import { driveHref } from '@/content/nav'

/**
 * Warms the test drive on intent: the first hover, focus or touch on a link to /drive starts loading
 * the 3D scene and the game car (rules/three.md). Not on visibility: the header's Test drive button is
 * visible on every page, and the landing page loads no three.js before scroll (ARCHITECTURE §10).
 */
export function DrivePreload(): null {
  useEffect(() => {
    let done = false
    const onIntent = (e: Event) => {
      if (done || !(e.target instanceof Element) || !e.target.closest(`a[href="${driveHref}"]`)) return
      done = true
      void import('@/components/hermes/HermesCar').then((m) => m.preloadHermesCar('game'))
      void import('@/components/drive/DriveScene/DriveScene')
      remove()
    }
    const events = ['pointerover', 'focusin', 'touchstart'] as const
    const remove = () => events.forEach((type) => document.removeEventListener(type, onIntent))
    events.forEach((type) => document.addEventListener(type, onIntent, { passive: true }))
    return remove
  }, [])
  return null
}
