import type { Metadata } from 'next'
import { DrivePreload } from '@/components/drive/DrivePreload'
import { Footer } from '@/components/site/Footer/Footer'
import { Header } from '@/components/site/Header/Header'
import { Wipe } from '@/components/site/Wipe/Wipe'
import { headerCopy } from '@/content/copy/shared'
import { SITE_NAME, seo } from '@/content/seo'
import { ClockSync } from '@/lib/clock/client'
import { themeScript } from '@/lib/clock/themeScript'
import { fontVariables } from '@/lib/fonts'
import { heroPreloadSnippet } from '@/lib/landing/heroPreload'
import { siteUrl } from '@/lib/site'
import '@/styles/tokens.css'
import '@/styles/globals.css'
import styles from './layout.module.css'

export const metadata: Metadata = {
  // every absolute URL (canonical, link previews) from the site's address (Decision D5)
  metadataBase: new URL(siteUrl()),
  title: { default: seo.home.title, template: `%s · ${SITE_NAME}` },
  description: seo.home.description,
  openGraph: { siteName: SITE_NAME, type: 'website', locale: 'en' },
  twitter: { card: 'summary_large_image' },
}

// ARCHITECTURE §12: WebSite only, never Organization (the team is fictional)
const websiteData = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: siteUrl() })

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // data-phase / data-theme / data-preview are set by the inline script before first paint
    // (ARCHITECTURE §4.2), so the server markup and the live <html> differ on purpose.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript(undefined, heroPreloadSnippet()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteData }} />
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
        {/* The wipe registers first, so the clock's first correction can already play it. */}
        <Wipe />
        <ClockSync />
        <DrivePreload />
      </body>
    </html>
  )
}
