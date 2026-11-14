import type { Metadata } from 'next'
import { Manifesto } from '@/components/manifesto/Manifesto'
import { seo } from '@/content/seo'

export const metadata: Metadata = { title: { absolute: seo.manifesto.title }, description: seo.manifesto.description }

export default function ManifestoPage() {
  return <Manifesto />
}
