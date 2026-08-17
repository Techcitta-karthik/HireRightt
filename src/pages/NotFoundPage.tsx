import { Link } from 'react-router-dom'
import { SiteNav } from '../components/SiteNav'
import { SiteFooter } from '../components/SiteFooter'
import styles from './AppPages.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <SiteNav />
        <main className={styles.main} style={{ textAlign: 'center', padding: '80px 16px' }}>
          <p style={{ letterSpacing: '0.12em', fontWeight: 700, color: '#64748b' }}>404</p>
          <h1 style={{ fontSize: '2.2rem', margin: '8px 0 12px' }}>Page not found</h1>
          <p style={{ color: '#475569', maxWidth: 420, margin: '0 auto 24px' }}>
            That link doesn’t exist in HireRight. Head back to the product or sign in
            to continue your hiring journey.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className={styles.primary}>
              Go home
            </Link>
            <Link to="/login" className={styles.secondary}>
              Sign in
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
