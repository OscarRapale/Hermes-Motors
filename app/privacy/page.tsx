import type { Metadata } from 'next'
import { Doc } from '@/components/pages/Doc/Doc'
import { privacyCopy } from '@/content/copy/pages/legal'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata('privacy', '/privacy')

export default function PrivacyPage() {
  return <Doc copy={privacyCopy} />
}
