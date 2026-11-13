'use client'

import { useImperativeHandle, useRef, type PointerEvent, type RefObject, type Ref } from 'react'
import { driveCopy } from '@/content/copy/drive'
import type { HudView } from '@/lib/drive/hud'
import type { Pad } from '@/lib/drive/touch'
import styles from './TouchControls.module.css'

const copy = driveCopy.touch

export type TouchHandle = { update: (view: Pick<HudView, 'overtake' | 'boost'>) => void }

type Props = {
  ref?: Ref<TouchHandle>
  /** The pads held now, and those pressed since the last step (a quick tap still counts once) */
  held: RefObject<Set<Pad>>
  taps: RefObject<Set<Pad>>
  /** A tap on BST: 2 s of Boost (Decision D29) */
  onBoost: () => void
}

/**
 * Board 16's thumb controls: steer ‹ › on the left (one thumb can slide from one to the other), BRAKE and
 * THROTTLE on the right with BST and OT above them. Each touch is tracked by its pointer, so both thumbs
 * work at once; the pressed state is written to the DOM, not rendered.
 */
export function TouchControls({ ref, held, taps, onBoost }: Props) {
  const root = useRef<HTMLDivElement>(null)
  // each touch down now: the pad it holds, and the element that captured it
  const pointers = useRef(new Map<number, { pad: Pad; el: HTMLElement }>())

  // the held set and the pressed look follow the touches down now
  const sync = () => {
    held.current.clear()
    pointers.current.forEach(({ pad }) => held.current.add(pad))
    root.current?.querySelectorAll<HTMLElement>('[data-pad]').forEach((el) => {
      el.toggleAttribute('data-pressed', held.current.has(el.dataset.pad as Pad))
    })
  }
  // the steering pair is one zone: which half the thumb is over, as it slides
  const side = (zone: HTMLElement, x: number): Pad => {
    const r = zone.getBoundingClientRect()
    return x < r.left + r.width / 2 ? 'left' : 'right'
  }

  // one set of handlers for every pad (delegated): what was touched says what it does
  const down = (e: PointerEvent<HTMLDivElement>) => {
    const target = e.target as Element
    if (target.closest('[data-tap="boost"]')) {
      e.preventDefault()
      onBoost()
      return
    }
    const zone = target.closest<HTMLElement>('[data-zone="steer"]')
    const el = zone ?? target.closest<HTMLElement>('[data-pad]')
    if (!el) return
    e.preventDefault()
    el.setPointerCapture(e.pointerId)
    const pad = zone ? side(zone, e.clientX) : (el.dataset.pad as Pad)
    pointers.current.set(e.pointerId, { pad, el })
    taps.current.add(pad)
    sync()
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const was = pointers.current.get(e.pointerId)
    if (!was || was.el.dataset.zone !== 'steer') return
    const pad = side(was.el, e.clientX)
    if (pad === was.pad) return
    pointers.current.set(e.pointerId, { pad, el: was.el })
    taps.current.add(pad)
    sync()
  }
  const up = (e: PointerEvent<HTMLDivElement>) => {
    if (pointers.current.delete(e.pointerId)) sync()
  }

  useImperativeHandle(ref, () => ({
    update(v) {
      const el = root.current
      if (!el) return
      if (el.dataset.ot !== v.overtake) el.dataset.ot = v.overtake
      const boost = v.boost ? 'on' : 'off'
      if (el.dataset.boost !== boost) el.dataset.boost = boost
    },
  }))

  return (
    <div
      ref={root}
      className={styles.touch}
      data-ot="off"
      data-boost="off"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onLostPointerCapture={up}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className={styles.left}>
        <span className={styles.caption} aria-hidden="true">
          {copy.caption}
        </span>
        <div className={styles.steer} data-zone="steer">
          <button type="button" data-pad="left" aria-label={copy.labels.left} className={`${styles.pad} ${styles.round}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button type="button" data-pad="right" aria-label={copy.labels.right} className={`${styles.pad} ${styles.round}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.column}>
          <div className={styles.buttons}>
            <button
              type="button"
              aria-label={copy.labels.boost}
              data-tap="boost"
              className={`${styles.pad} ${styles.bst}`}
              // a screen reader or a keyboard activates it without a pointer
              onClick={(e) => e.detail === 0 && onBoost()}
            >
              {copy.boost}
            </button>
            <button
              type="button"
              aria-label={copy.labels.overtake}
              className={`${styles.pad} ${styles.ot}`}
              data-pad="overtake"
              onClick={(e) => e.detail === 0 && taps.current.add('overtake')}
            >
              {copy.overtake}
            </button>
          </div>
          <button type="button" aria-label={copy.labels.brake} data-pad="brake" className={`${styles.pad} ${styles.brake}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 7h10M7 12h10M7 17h10" />
            </svg>
            <span aria-hidden="true">{copy.brake}</span>
          </button>
        </div>
        <button type="button" aria-label={copy.labels.throttle} data-pad="throttle" className={`${styles.pad} ${styles.throttle}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 19V6M6 11l6-6 6 6" />
          </svg>
          <span aria-hidden="true">{copy.throttle}</span>
        </button>
      </div>
    </div>
  )
}
