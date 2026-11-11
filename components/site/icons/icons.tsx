// Line icons from the boards (24 × 24, stroked in currentColor). Decorative: always aria-hidden.
import styles from './icons.module.css'

type IconProps = { className?: string }

const svg = (className: string | undefined, children: React.ReactNode) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={`${styles.icon} ${className ?? ''}`}>
    {children}
  </svg>
)

export const BagIcon = ({ className }: IconProps) => svg(className, <path d="M5 8h14l-1.2 12H6.2L5 8Zm4 0V6.5a3 3 0 0 1 6 0V8" />)

export const LockIcon = ({ className }: IconProps) =>
  svg(
    className,
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>,
  )

export const ArrowIcon = ({ className }: IconProps) => svg(className, <path d="M5 12h13M13 6l6 6-6 6" />)

export const MenuIcon = ({ className }: IconProps) => svg(className, <path d="M4 8h16M4 16h16" />)

export const CloseIcon = ({ className }: IconProps) => svg(className, <path d="M6 6l12 12M18 6L6 18" />)

export const SunIcon = ({ className }: IconProps) =>
  svg(
    className,
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
    </>,
  )

export const MoonIcon = ({ className }: IconProps) => svg(className, <path d="M19.5 14.6A7.5 7.5 0 0 1 9.4 4.5a7.5 7.5 0 1 0 10.1 10.1Z" />)
