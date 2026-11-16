import type { Metadata } from 'next'
import { PressKit } from '@/components/press/PressKit'
import { seo } from '@/content/seo'

export const metadata: Metadata = { title: { absolute: seo.press.title }, description: seo.press.description }

export default function PressPage() {
  return <PressKit />
}
