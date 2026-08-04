import { Link, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { easeOut } from '../motion/variants'
import styles from './SiteNav.module.css'

const NAV = [
  { to: '/job-seekers', label: 'For Job Seekers', hasChevron: true },
  { to: '/why', label: 'Why HRERIGHT', hasChevron: true },
  { to: '/solutions', label: 'Solutions', hasChevron: true },
  { to: '/resources', label: 'Resources', hasChevron: true },
  { to: '/about', label: 'About Us', hasChevron: false },
]

export function SiteNav() {
  return (
    <motion.header
      className={styles.navbar}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easeOut }}
    >
      <Link to="/" className={styles.brand}>
        <h1>
          HRERIGHT<sup>TTT</sup>
        </h1>
        <p>
          TALENT <span>TO</span> TALENT
        </p>
      </Link>

      <nav className={styles.navLinks}>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            {item.label}
            {item.hasChevron ? <span className={styles.chevron} /> : null}
          </NavLink>
        ))}
      </nav>

      <div className={styles.navActions}>
        <Link to="/login" className={styles.loginBtn}>
          Login
        </Link>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Link to="/onboarding" className={styles.ctaBtn}>
            Get Started Free
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4 10H16M16 10L11 5M16 10L11 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </motion.header>
  )
}
