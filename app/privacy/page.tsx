import type { Metadata } from 'next'
import { Doc } from '@/components/pages/Doc/Doc'
import { privacyCopy } from '@/content/copy/pages/legal'
import { seo } from '@/content/seo'

export const metadata: Metadata = { title: { absolute: seo.privacy.title }, description: seo.privacy.description }

export default function PrivacyPage() {
  return <Doc copy={privacyCopy} />
}
