'use client'

import { useClock } from '@/lib/clock/client'
import { driveOpen, previewBanner } from '@/lib/drive/access'
import { Game } from '../Game/Game'
import { Locked } from '../Locked/Locked'
import styles from './Drive.module.css'

/**
 * /drive (ARCHITECTURE §3, §4.4): locked with the countdown before Day One; open from 06:00, or while
 * previewing First Light (Decision D3), with a banner. The locked page is in the server markup and CSS
 * hides it from the first paint when the drive is open; the game mounts once the clock says so.
 */
export function Drive() {
  const clock = useClock()
  return (
    <>
      <Locked className={styles.locked} />
      {driveOpen(clock) && <Game preview={previewBanner(clock)} />}
    </>
  )
}
