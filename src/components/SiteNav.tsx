import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { easeOut } from '../motion/variants'
import { firstName, isLoggedIn, logout } from '../lib/store'
import styles from './SiteNav.module.css'

const NAV = [
  { to: '/job-seekers', label: 'For Job Seekers' },
  { to: '/why', label: 'Why HIRERIGHT' },
  { to: '/solutions', label: 'Solutions' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/interview', label: 'AI Interview' },
  { to: '/about', label: 'About' },
]

type SiteNavProps = {
  variant?: 'light' | 'dark'
}

export function SiteNav({ variant = 'light' }: SiteNavProps) {
  const dark = variant === 'dark'
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [name, setName] = useState('there')

  useEffect(() => {
    setLoggedIn(isLoggedIn())
    setName(firstName())
  }, [])

  function handleLogout() {
    logout()
    setLoggedIn(false)
    setOpen(false)
    navigate('/')
  }

  return (
    <motion.header
      className={`${styles.navbar} ${dark ? styles.dark : ''}`}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easeOut }}
    >
      <Link to="/" className={styles.brand} onClick={() => setOpen(false)}>
        <h1>
          HIRERIGHT<sup>TTT</sup>
        </h1>
        <p>
          TALENT <span>TO</span> TALENT
        </p>
      </Link>

      <nav className={styles.navLinks} aria-label="Primary">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.navActions}>
        {loggedIn ? (
          <>
            <Link to="/dashboard" className={styles.loginBtn}>
              Hi, {name}
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/dashboard"
                className={dark ? styles.ctaBtnDark : styles.ctaBtn}
              >
                Dashboard
              </Link>
            </motion.div>
          </>
        ) : (
          <>
            {!dark && (
              <Link to="/login" className={styles.loginBtn}>
                Login
              </Link>
            )}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/signup"
                className={dark ? styles.ctaBtnDark : styles.ctaBtn}
              >
                Sign Up Free
                <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </>
        )}

        <button
          type="button"
          className={styles.menuBtn}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7H20M4 12H20M4 17H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: easeOut }}
            aria-label="Mobile"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? `${styles.mobileLink} ${styles.mobileActive}`
                    : styles.mobileLink
                }
              >
                {item.label}
              </NavLink>
            ))}
            {loggedIn && (
              <>
                <NavLink
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className={styles.mobileLink}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className={styles.mobileLink}
                >
                  Profile
                </NavLink>
              </>
            )}
            <div className={styles.mobileActions}>
              {loggedIn ? (
                <button type="button" className={styles.loginBtn} onClick={handleLogout}>
                  Sign out
                </button>
              ) : (
                <Link
                  to="/login"
                  className={styles.loginBtn}
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
              )}
              <Link
                to={loggedIn ? '/dashboard' : '/signup'}
                className={styles.ctaBtn}
                onClick={() => setOpen(false)}
              >
                {loggedIn ? 'Dashboard →' : 'Sign Up Free →'}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
