import type { Metadata } from 'next'
import { SITE_NAME, seo } from '@/content/seo'

export const metadata: Metadata = {
  title: { default: seo.home.title, template: `%s · ${SITE_NAME}` },
  description: seo.home.description,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
