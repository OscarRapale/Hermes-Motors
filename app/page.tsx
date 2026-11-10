import { PreviewToggle } from '@/components/site/PreviewToggle/PreviewToggle'
import { SITE_NAME } from '@/content/seo'

// Placeholder until M1 builds the hero. The preview toggle moves into the header in the next PR.
export default function Home() {
  return (
    <main>
      <h1>{SITE_NAME}</h1>
      <PreviewToggle />
    </main>
  )
}
