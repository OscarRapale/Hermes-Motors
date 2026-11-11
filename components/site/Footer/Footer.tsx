import Link from 'next/link'
import { footerCopy, WORDMARK } from '@/content/copy/shared'
import { footerColumns, legalLinks, socialLinks } from '@/content/nav'
import { HomeLink } from '../HomeLink/HomeLink'
import { RichText } from '../RichText/RichText'
import { TestDriveLink } from '../TestDriveLink/TestDriveLink'
import styles from './Footer.module.css'

/**
 * The footer card on every page (boards 20, 21; docs/design/01-navigation-footer.md).
 * Theme-dependent lines are rendered for both themes and hidden by CSS. The model credit and the
 * fictional-team line are required on every page (CLAUDE.md, docs/legal/credits.md).
 */
export function Footer() {
  const [first, middle, last] = footerCopy.statement
  return (
    <footer className={styles.footer}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.grid}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <HomeLink />
          </div>

          <div className={styles.actions}>
            <p className={`label ${styles.status}`}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span className="day-only">{footerCopy.statusDay}</span>
              <span className="night-only">
                <span className={styles.wideOnly}>{footerCopy.statusNight}</span>
                <span className={styles.phoneOnly}>{footerCopy.statusNightPhone}</span>
              </span>
            </p>
            <TestDriveLink variant="footer" />
          </div>
        </div>

        <div className={styles.intro}>
          <p className={`display ${styles.statement}`}>
            <span>{first}</span>
            <span className={styles.dim}>{middle}</span>
            <span>{last}</span>
          </p>
          <p className={styles.line}>
            <span className="day-only">{footerCopy.lineDay}</span>
            <span className="night-only">{footerCopy.lineNight}</span>
          </p>
        </div>

        <nav aria-label={footerCopy.socialLabel} className={styles.social}>
          <ul className={styles.socialList}>
            {socialLinks.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className={styles.pill}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={footerCopy.navLabel} className={styles.columns}>
          {footerColumns.map((column) => (
            <div key={column.heading} className={styles.column}>
              <h2 className={`label ${styles.heading}`}>{column.heading}</h2>
              <ul className={styles.links}>
                {column.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className={styles.link}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className={styles.fine}>
          <div className={styles.credits}>
            <p className={styles.fineText}>
              <RichText value={footerCopy.credit} linkClassName={styles.fineLink} />
            </p>
            <p className={styles.fineText}>{footerCopy.fictional}</p>
          </div>
          <p className={`${styles.fineText} ${styles.legal}`}>
            {legalLinks.map(({ label, href }) => (
              <span key={href} className={styles.legalItem}>
                <Link href={href} className={styles.fineLink}>
                  {label}
                </Link>
              </span>
            ))}
            <span className={styles.legalItem}>{footerCopy.madeBy}</span>
          </p>
        </div>
      </div>

      <div className={styles.outline} aria-hidden="true">
        <span>{WORDMARK}</span>
      </div>
    </footer>
  )
}
