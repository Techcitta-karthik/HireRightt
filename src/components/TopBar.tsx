import { useEffect, useRef, useState } from 'react'
import styles from './TopBar.module.css'

interface TopBarProps {
  userName?: string
}

export function TopBar({ userName = 'Arjun' }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className={styles.topbar}>
      <div className={styles.safe}>
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
      </div>

      <div className={styles.userWrap} ref={ref}>
        <button
          type="button"
          className={styles.userBtn}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <img
            className={styles.avatar}
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces"
            alt=""
          />
          <span>Hi, {userName}</span>
          <svg
            className={`${styles.chevron} ${menuOpen ? styles.open : ''}`}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {menuOpen && (
          <div className={styles.menu} role="menu">
            <button type="button" role="menuitem">
              View profile
            </button>
            <button type="button" role="menuitem">
              Account settings
            </button>
            <button type="button" role="menuitem" className={styles.danger}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
