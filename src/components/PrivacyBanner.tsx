import styles from './PrivacyBanner.module.css'

export function PrivacyBanner() {
  return (
    <aside className={styles.banner} aria-label="Privacy assurance">
      <div className={styles.left}>
        <div className={styles.shield} aria-hidden="true">
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
        </div>
        <p>
          Your data is encrypted and never shared without your consent. You
          control who sees your profile.
        </p>
      </div>
      <div className={styles.badges}>
        {['Encrypted', 'Private', 'Secure'].map((label) => (
          <span key={label} className={styles.badge}>
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
          </span>
        ))}
      </div>
    </aside>
  )
}
