import type { ProfileFormData } from '../data/wizard'
import styles from './CompleteStep.module.css'

interface CompleteStepProps {
  data: ProfileFormData
  onEditStep: (step: 1 | 2 | 3 | 4) => void
}

export function CompleteStep({ data, onEditStep }: CompleteStepProps) {
  return (
    <div className={styles.stack}>
      <section className={`${styles.card} ${styles.hero}`}>
        <div className={styles.successOrb} aria-hidden="true">
          ✓
        </div>
        <div>
          <p className={styles.congrats}>Congratulations, Arjun!</p>
          <h3>You&apos;re All Set!</h3>
          <p>
            Your profile is complete and verified. You&apos;re now visible to top
            employers and our AI is already finding the best opportunities for
            you.
          </p>
        </div>
        <div className={styles.bot} aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <rect x="12" y="18" width="40" height="30" rx="14" fill="currentColor" />
            <circle cx="26" cy="33" r="3" fill="#fff" />
            <circle cx="38" cy="33" r="3" fill="#fff" />
            <rect x="29" y="10" width="6" height="8" rx="3" fill="currentColor" />
          </svg>
        </div>
      </section>

      <section className={styles.card}>
        <h4>What&apos;s Next?</h4>
        <p className={styles.sub}>
          We&apos;re already working behind the scenes to find the perfect matches
          for you.
        </p>
        <div className={styles.nextGrid}>
          <article>
            <span className={styles.nextIcon}>
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="5.8" stroke="currentColor" strokeWidth="1.6" />
                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <h5>AI is Matching You</h5>
            <p>Our AI is scanning opportunities that match your profile.</p>
          </article>
          <article>
            <span className={styles.nextIcon}>
              <svg viewBox="0 0 20 20" fill="none">
                <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M4 7L10 11L16 7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </span>
            <h5>Get Interview Invites</h5>
            <p>You&apos;ll receive interview requests from top companies.</p>
          </article>
          <article>
            <span className={styles.nextIcon}>
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M10 3.5A3.5 3.5 0 0 0 6.5 7V10.5L5 13.5H15L13.5 10.5V7A3.5 3.5 0 0 0 10 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </span>
            <h5>Stay Notified</h5>
            <p>We&apos;ll keep you updated on opportunities and profile views.</p>
          </article>
          <article>
            <span className={styles.nextIcon}>
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M3 16H17M5.5 13V9M10 13V6M14.5 13V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <h5>Track Your Progress</h5>
            <p>Monitor applications, interviews, and offers from your dashboard.</p>
          </article>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.summaryHead}>
          <h4>Your Profile Summary</h4>
          <button type="button" className={styles.linkBtn} onClick={() => onEditStep(1)}>
            View Full Profile
          </button>
        </div>
        <div className={styles.profileRow}>
          <div className={styles.avatar} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M5 20C6.2 16.8 8.8 15 12 15C15.2 15 17.8 16.8 19 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h5>Arjun Kumar</h5>
            <p>{data.currentRole || 'Software Engineer'}</p>
            <small>Hyderabad, India</small>
          </div>
          <span className={styles.completeTag}>Profile Complete</span>
        </div>
        <div className={styles.statsRow}>
          <button type="button" onClick={() => onEditStep(2)}>
            <strong>{data.totalExperience || '2 – 3 Years'}</strong>
            <span>Experience</span>
          </button>
          <button type="button" onClick={() => onEditStep(2)}>
            <strong>{data.skills.length}</strong>
            <span>Skills Added</span>
          </button>
          <button type="button" onClick={() => onEditStep(3)}>
            <strong>{data.achievements.filter(Boolean).length}</strong>
            <span>Achievements</span>
          </button>
          <button type="button" onClick={() => onEditStep(3)}>
            <strong>{data.certifications.length}</strong>
            <span>Certifications</span>
          </button>
          <button type="button" onClick={() => onEditStep(4)}>
            <strong>{data.interviewNotes ? 'Yes' : 'Ready'}</strong>
            <span>Interview Ready</span>
          </button>
        </div>
      </section>

      <section className={`${styles.card} ${styles.journey}`}>
        <div className={styles.trophy} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M8 4H16V8A4 4 0 0 1 12 12A4 4 0 0 1 8 8V4Z" stroke="currentColor" strokeWidth="1.7" />
            <path d="M10 12V15H14V12M8 20H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M8 6H5A2 2 0 0 0 3 8C3 10.2 4.8 12 7 12H8M16 6H19A2 2 0 0 1 21 8C21 10.2 19.2 12 17 12H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h4>Your Journey Starts Now!</h4>
          <p>
            Opportunities are waiting for you. Let&apos;s make your next career move
            your best one yet.
          </p>
        </div>
        <div className={styles.journeyActions}>
          <button type="button" className={styles.primaryWide}>
            Go to Dashboard →
          </button>
          <button type="button" className={styles.secondaryWide}>
            Explore Opportunities
          </button>
        </div>
      </section>

      <section className={styles.quickLinks}>
        <button type="button" className={styles.smallLink} onClick={() => onEditStep(1)}>
          ← Back
        </button>
        <button type="button" className={styles.smallLink} onClick={() => onEditStep(4)}>
          Review Interview
        </button>
      </section>
    </div>
  )
}
