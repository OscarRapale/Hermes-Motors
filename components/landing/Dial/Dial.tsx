import { DIAL_SWEEP_DEG, formatReading, needleDeg, tickDashes, type DialReading } from '@/lib/landing/ignition'
import styles from './Dial.module.css'

const MINOR = tickDashes(5, 0.4)
const MAJOR = tickDashes(27, 0.8)

type Props = {
  id: string
  reading: DialReading
  unit: string
  sub?: string
  caption: string
  label: string
  size: 's' | 'm' | 'l'
}

/**
 * One dashboard dial (board 10), drawn at its settled value so it reads correctly without
 * JavaScript; the Dashboard animates it through the data-* hooks. `role="img"` with the full value.
 */
export function Dial({ id, reading, unit, sub, caption, label, size }: Props) {
  const large = size === 'l'
  const fraction = reading.value / reading.max
  const r = large ? 72 : 74
  return (
    <figure className={`${styles.dial} ${styles[size]}`}>
      <svg viewBox="0 0 200 200" role="img" aria-label={label} data-dial={id} className={styles.svg}>
        <circle className={large ? styles.bezelLarge : styles.bezel} cx="100" cy="100" r="95" />
        <circle className={styles.minor} cx="100" cy="100" r="88" pathLength="360" transform="rotate(135 100 100)" strokeDasharray={MINOR} />
        <circle className={styles.major} cx="100" cy="100" r="88" pathLength="360" transform="rotate(135 100 100)" strokeDasharray={MAJOR} />
        {large && (
          // the red zone at the top of the scale
          <circle className={styles.zone} cx="100" cy="100" r="81" pathLength="360" transform="rotate(135 100 100)" strokeDasharray="0 243 27 90" />
        )}
        <circle
          className={styles.track}
          cx="100"
          cy="100"
          r={r}
          pathLength="360"
          transform="rotate(135 100 100)"
          strokeDasharray={`${DIAL_SWEEP_DEG} 360`}
          strokeWidth={large ? 7 : 6}
        />
        <circle
          className={styles.arc}
          cx="100"
          cy="100"
          r={r}
          pathLength="360"
          transform="rotate(135 100 100)"
          strokeDasharray={`${(DIAL_SWEEP_DEG * fraction).toFixed(1)} 360`}
          strokeWidth={large ? 7 : 6}
          data-arc
        />
        <g transform={`rotate(${needleDeg(fraction).toFixed(1)} 100 100)`} data-needle className={styles.needle}>
          <path d={large ? 'M98,97.8 L170,99.5 L170,100.5 L98,102.2 Z' : 'M98,97.6 L172,99.4 L172,100.6 L98,102.4 Z'} />
        </g>
        <circle className={styles.hub} cx="100" cy="100" r={large ? 5 : 6} />
        <text className={large ? styles.valueLarge : styles.value} x="100" y={large ? 142 : 150} data-value data-decimals={reading.decimals}>
          {formatReading(reading.value, reading.decimals)}
        </text>
        <text className={large ? styles.unitLarge : styles.unit} x="100" y={large ? 162 : 172}>
          {unit}
        </text>
        {sub && (
          <text className={styles.sub} x="100" y="182">
            {sub}
          </text>
        )}
      </svg>
      <figcaption className={`label ${large ? styles.captionLarge : styles.caption}`}>{caption}</figcaption>
    </figure>
  )
}
