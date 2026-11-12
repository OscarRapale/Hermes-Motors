import type { Metadata } from 'next'
import { Drive } from '@/components/drive/Drive/Drive'
import { seo } from '@/content/seo'

// The test drive (ARCHITECTURE §7): a static shell; the game is a client island, its 3D loaded on demand.
export const metadata: Metadata = {
  title: { absolute: seo.drive.title },
  description: seo.drive.description,
}

export default function DrivePage() {
  return <Drive />
}
