import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { easeOut } from '../motion/variants'
import styles from './SelectField.module.css'

interface SelectFieldProps {
  label: string
  value: string
  options: string[]
  placeholder: string
  onChange: (value: string) => void
}

export function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className={styles.field} ref={rootRef}>
      {label ? <label className={styles.label}>{label}</label> : null}
      <motion.button
        type="button"
        className={`${styles.trigger} ${open ? styles.open : ''} ${value ? styles.filled : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label || placeholder}
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.99 }}
      >
        <span>{value || placeholder}</span>
        <motion.svg
          className={styles.chevron}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          animate={{ rotate: open ? 180 : 0 }}
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
        {open && (
          <motion.ul
            className={styles.menu}
            role="listbox"
            id={listId}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: easeOut }}
          >
            {options.map((option) => (
              <li key={option} role="option" aria-selected={option === value}>
                <motion.button
                  type="button"
                  className={`${styles.option} ${option === value ? styles.selected : ''}`}
                  onClick={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                  whileHover={{ x: 4, backgroundColor: 'rgba(255,107,0,0.06)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {option}
                  {option === value && (
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M3.5 8.5L6.5 11.5L12.5 4.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </motion.button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
