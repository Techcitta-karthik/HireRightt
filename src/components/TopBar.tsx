import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { firstName, getUser } from '../lib/store'
import { easeOut } from '../motion/variants'
import styles from './TopBar.module.css'

interface TopBarProps {
  userName?: string
}

export function TopBar({ userName }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [name, setName] = useState(() => userName ?? firstName())
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setName(userName ?? firstName())
  }, [userName])

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function go(path: string) {
    setMenuOpen(false)
    navigate(path)
  }

  function signOut() {
    setMenuOpen(false)
    navigate('/logout')
  }

  const initials = (getUser()?.name ?? name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?'

  return (
    <motion.div
      className={styles.topbar}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <motion.div
        className={styles.safe}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <span className={styles.shield} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3L5 6.5V11.5C5 16 8.2 19.8 12 21C15.8 19.8 19 16 19 11.5V6.5L12 3Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 12L11.2 13.7L14.8 10"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        Your data is safe with us
      </motion.div>

      <div className={styles.userWrap} ref={ref}>
        <motion.button
          type="button"
          className={styles.userBtn}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className={styles.avatar} aria-hidden="true">
            {initials}
          </span>
          <span>Hi, {name}</span>
          <motion.svg
            className={`${styles.chevron} ${menuOpen ? styles.open : ''}`}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            animate={{ rotate: menuOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className={styles.menu}
              role="menu"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.18, ease: easeOut }}
            >
              <motion.button
                type="button"
                role="menuitem"
                onClick={() => go('/profile')}
                whileHover={{ x: 4, backgroundColor: 'rgba(255,107,0,0.06)' }}
                whileTap={{ scale: 0.98 }}
              >
                View profile
              </motion.button>
              <motion.button
                type="button"
                role="menuitem"
                onClick={() => go('/settings')}
                whileHover={{ x: 4, backgroundColor: 'rgba(255,107,0,0.06)' }}
                whileTap={{ scale: 0.98 }}
              >
                Account settings
              </motion.button>
              <motion.button
                type="button"
                role="menuitem"
                onClick={() => go('/dashboard')}
                whileHover={{ x: 4, backgroundColor: 'rgba(255,107,0,0.06)' }}
                whileTap={{ scale: 0.98 }}
              >
                Dashboard
              </motion.button>
              <motion.button
                type="button"
                role="menuitem"
                className={styles.danger}
                onClick={signOut}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign out
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
