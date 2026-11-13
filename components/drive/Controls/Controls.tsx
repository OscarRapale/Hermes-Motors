import { driveCopy } from '@/content/copy/drive'
import { KEYBOARD, KEYBOARD_H, KEYBOARD_W } from '@/lib/drive/keyboard'
import { CONTROLS, controlFor } from '@/lib/drive/keys'
import styles from './Controls.module.css'

const K = 40 // one key unit in the drawing's own units
const GAP = 4

/** A keyboard with the keys that drive the car lit, one colour per control (as the HUD colours its pedals) */
export function ControlsKeyboard() {
  const copy = driveCopy.controls
  return (
    <svg
      className={styles.keyboard}
      viewBox={`0 0 ${KEYBOARD_W * K} ${KEYBOARD_H * K}`}
      role="img"
      aria-label={copy.keyboardLabel}
    >
      {KEYBOARD.map((k) => {
        const control = controlFor(k.code)
        const w = k.w * K - GAP
        return (
          <g key={k.code} transform={`translate(${k.x * K + GAP / 2} ${k.y * K + GAP / 2})`} data-control={control ?? undefined}>
            <rect width={w} height={K - GAP} rx={7} />
            {control && (
              <text x={w / 2} y={(K - GAP) / 2} dominantBaseline="central" textAnchor="middle">
                {copy.keycaps[k.code]}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** The legend under the keyboard: what each control does and its keys, in words */
export function ControlsList() {
  const items = driveCopy.controls.items
  return (
    <dl className={styles.list}>
      {CONTROLS.map(({ id }) => {
        const item: { label: string; keys: string; note?: string } = items[id]
        return (
          <div key={id} className={styles.item} data-control={id}>
            <dt>
              <i aria-hidden="true" />
              {item.label}
            </dt>
            <dd className={styles.keys}>{item.keys}</dd>
            {item.note && <dd className={styles.note}>{item.note}</dd>}
          </div>
        )
      })}
    </dl>
  )
}
