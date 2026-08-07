import { Link } from 'react-router-dom'
import styles from './SiteFooter.module.css'

const COLUMNS = [
  {
    title: 'Get started',
    links: [
      { label: 'Get Started', to: '/signup' },
      { label: 'Interview Studio', to: '/interview' },
      { label: 'How It Works', to: '/how-it-works' },
      { label: 'Interview Prep', to: '/resources' },
      { label: 'Job Matches', to: '/jobs' },
    ],
  },
  {
    title: 'For Candidates',
    links: [
      { label: 'Why Interview-First', to: '/why' },
      { label: 'For Candidates', to: '/job-seekers' },
      { label: 'Solutions', to: '/solutions' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Admin ATS', to: '/admin' },
      { label: 'Resources', to: '/resources' },
      { label: 'Privacy', to: '/why' },
    ],
  },
]

const SOCIALS = [
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.5 8.8H3.6V20h2.9V8.8ZM5 7.4a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM20.4 13.9c0-3.2-1.7-4.7-4-4.7-1.8 0-2.6 1-3.1 1.7V8.8h-2.9V20h2.9v-5.9c0-1.3.6-2.1 1.8-2.1 1.1 0 1.6.8 1.6 2.1V20h2.9l-.2-6.1Z" />
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
        <circle cx="17" cy="7" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.4 20v-6.9h2.3l.4-2.7h-2.7V8.6c0-.8.2-1.3 1.3-1.3h1.5V4.9c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7v1.9H8.2v2.7h2.3V20h2.9Z" />
      </svg>
    ),
  },
  {
    name: 'X',
    href: 'https://x.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.2 4h2.6l-5.7 6.6L20.9 20h-5.3l-4.1-5.4L6.8 20H4.2l6.1-7.1L3.9 4h5.4l3.7 5 4.2-5Zm-.9 14.4h1.4L8.5 5.5H7l9.3 12.9Z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="6" width="18" height="12" rx="3.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M10.5 9.7L14.7 12L10.5 14.3V9.7Z" fill="currentColor" />
      </svg>
    ),
  },
]

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <Link to="/" className={styles.brand}>
              HIRE<span>RIGHT</span>
              <sup>TTT</sup>
            </Link>
            <p>Right People. Right Opportunities.</p>
          </div>

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

          <div className={styles.col}>
            <h4>Stay Connected</h4>
            <div className={styles.socials}>
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© 2026 HIRERIGHT. All rights reserved.</p>
          <div className={styles.legal}>
            <Link to="/resources">Privacy Policy</Link>
            <span aria-hidden="true">|</span>
            <Link to="/resources">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
