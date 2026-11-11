import { SITE_NAME } from '@/content/seo'
import styles from './page.module.css'

// Placeholder until M1 builds the hero. The layout provides <main>.
export default function Home() {
  return (
    <section className={styles.placeholder}>
      <h1>{SITE_NAME}</h1>
    </section>
  )
}
