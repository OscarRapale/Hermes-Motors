import type { Metadata } from 'next'
import { SITE_NAME, seo } from '@/content/seo'
import { fontVariables } from '@/lib/fonts'
import '@/styles/tokens.css'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: seo.home.title, template: `%s · ${SITE_NAME}` },
  description: seo.home.description,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}
