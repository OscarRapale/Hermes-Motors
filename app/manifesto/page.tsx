import type { Metadata } from 'next'
import { Manifesto } from '@/components/manifesto/Manifesto'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata('manifesto', '/manifesto')

export default function ManifestoPage() {
  return <Manifesto />
}
