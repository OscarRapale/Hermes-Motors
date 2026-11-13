import type { Metadata } from 'next'
import { PageHero } from '@/components/pages/PageHero/PageHero'
import { Cta } from '@/components/site/Cta/Cta'
import { notFoundCopy } from '@/content/copy/pages/legal'
import { seo } from '@/content/seo'

export const metadata: Metadata = { title: { absolute: seo.notFound.title }, robots: { index: false } }

/** Any route that doesn't exist (copy.md → Pages: 404) */
export default function NotFound() {
  return (
    <PageHero
      eyebrow={notFoundCopy.eyebrow}
      headline={notFoundCopy.headline}
      intro={notFoundCopy.body}
      aside={
        <Cta href="/" variant="primary">
          {notFoundCopy.cta}
        </Cta>
      }
    />
  )
}
