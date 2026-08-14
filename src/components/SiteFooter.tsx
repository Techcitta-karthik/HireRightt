import { Link } from 'react-router-dom'
import styles from './SiteFooter.module.css'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'AI Matching', to: '/solutions' },
      { label: 'Resume Intelligence', to: '/solutions' },
      { label: 'Pipeline Management', to: '/solutions' },
      { label: 'Analytics & Reports', to: '/solutions' },
      { label: 'Integrations', to: '/solutions' },
      { label: 'Pricing', to: '/pricing' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'For Staffing Agencies', to: '/solutions' },
      { label: 'For Enterprises', to: '/solutions' },
      { label: 'For HR Teams', to: '/solutions' },
      { label: 'Remote Hiring', to: '/solutions' },
      { label: 'Diversity Hiring', to: '/solutions' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', to: '/resources' },
      { label: 'Case Studies', to: '/resources' },
      { label: 'Help Center', to: '/resources' },
      { label: 'Templates', to: '/resources' },
      { label: 'Ebooks', to: '/resources' },
      { label: 'Webinars', to: '/resources' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers', to: '/about' },
      { label: 'Contact Us', to: '/about' },
      { label: 'Privacy Policy', to: '/about' },
      { label: 'Terms of Service', to: '/about' },
    ],
  },
]

const SOCIALS = [
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
      </svg>
    ),
  },
  {
    name: 'X',
    href: 'https://x.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
]

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.topGrid}>
          <div className={styles.brandCol}>
            <Link to="/" className={styles.brand}>
              <span className={styles.logoBadge}>HR</span>
              <span className={styles.logoText}>
                HIRERIGHT<sup className={styles.supTt}>TT</sup>
              </span>
            </Link>
            <p className={styles.brandDesc}>
              AI-powered recruitment platform that helps you find, evaluate, and hire the best talent faster.
            </p>
            <div className={styles.socials}>
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className={styles.socialLink}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.navColumns}>
            {COLUMNS.map((col) => (
              <div key={col.title} className={styles.col}>
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className={styles.subscribeCol}>
            <h4>Subscribe to our newsletter</h4>
            <p>Get the latest updates and insights delivered to your inbox.</p>
            <form className={styles.subForm} onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" required className={styles.subInput} />
              <button type="submit" className={styles.subBtn} aria-label="Subscribe">
                →
              </button>
            </form>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>© 2025 HIRERIGHT<sup className={styles.supTt}>TT</sup>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
