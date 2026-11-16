import type { Metadata } from 'next'
import { PressKit } from '@/components/press/PressKit'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata('press', '/press')

export default function PressPage() {
  return <PressKit />
}
