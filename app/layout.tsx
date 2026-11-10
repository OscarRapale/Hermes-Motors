import type { Metadata } from 'next'
import { SITE_NAME, seo } from '@/content/seo'
import { ClockSync } from '@/lib/clock/client'
import { themeScript } from '@/lib/clock/themeScript'
import { fontVariables } from '@/lib/fonts'
import '@/styles/tokens.css'
import '@/styles/globals.css'

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
        {children}
        <ClockSync />
      </body>
    </html>
  )
}
