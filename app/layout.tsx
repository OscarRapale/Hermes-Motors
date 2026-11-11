import type { Metadata } from 'next'
import { Footer } from '@/components/site/Footer/Footer'
import { Header } from '@/components/site/Header/Header'
import { headerCopy } from '@/content/copy/shared'
import { SITE_NAME, seo } from '@/content/seo'
import { ClockSync } from '@/lib/clock/client'
import { themeScript } from '@/lib/clock/themeScript'
import { fontVariables } from '@/lib/fonts'
import '@/styles/tokens.css'
import '@/styles/globals.css'
import styles from './layout.module.css'

export const metadata: Metadata = {
  title: { default: seo.home.title, template: `%s · ${SITE_NAME}` },
  description: seo.home.description,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // data-phase / data-theme / data-preview are set by the inline script before first paint
    // (ARCHITECTURE §4.2), so the server markup and the live <html> differ on purpose.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      </head>
      <body>
        <a href="#main" className={styles.skip}>
          {headerCopy.skipLink}
        </a>
        <div className={styles.frame}>
          <div className={styles.page}>
            <Header />
            <main id="main" tabIndex={-1} className={styles.main}>
              {children}
            </main>
          </div>
          <Footer />
        </div>
        <ClockSync />
      </body>
    </html>
  )
}
