import { motion } from 'framer-motion'
import { easeOut, fadeUp, staggerFast } from '../motion/variants'
import styles from './PrivacyBanner.module.css'

export function PrivacyBanner() {
  return (
    <motion.aside
      className={styles.banner}
      aria-label="Privacy assurance"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easeOut, delay: 0.15 }}
      whileHover={{ y: -2 }}
    >
      <div className={styles.left}>
        <motion.div
          className={styles.shield}
          aria-hidden="true"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
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
        </motion.div>
        <p>
          Your data is encrypted and never shared without your consent. You
          control who sees your profile.
        </p>
      </div>
      <motion.div
        className={styles.badges}
        variants={staggerFast}
        initial="hidden"
        animate="show"
      >
        {['Encrypted', 'Private', 'Secure'].map((label) => (
          <motion.span
            key={label}
            className={styles.badge}
            variants={fadeUp}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.96 }}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect
                x="4"
                y="7"
                width="8"
                height="6"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M6 7V5.5a2 2 0 1 1 4 0V7"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            {label}
          </motion.span>
        ))}
      </motion.div>
    </motion.aside>
  )
}
