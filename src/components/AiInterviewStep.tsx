import { useState } from 'react'
import type { ProfileFormData } from '../data/wizard'
import styles from './AiInterviewStep.module.css'

interface AiInterviewStepProps {
  data: ProfileFormData
  onChange: <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) => void
}

export function AiInterviewStep({ onChange }: AiInterviewStepProps) {
  const [selectedReminder, setSelectedReminder] = useState(2)
  const [status, setStatus] = useState('')

  function handleCalendar() {
    onChange(
      'interviewNotes',
      `Interview confirmed for Mon, 19 May 2025 at 01:30 PM (IST).`,
    )
    setStatus('Calendar event prepared.')
  }

  function handleGuide() {
    setStatus('Interview guide opened.')
  }

  return (
    <div className={styles.stack}>
      <section className={`${styles.card} ${styles.banner}`}>
        <div className={styles.bannerLeft}>
          <div className={styles.successIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13L9.5 17.5L19 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.bannerText}>
            <p className={styles.bannerEyebrow}>All Set, Arjun!</p>
            <h3>Your 15-Minute AI Interview is Confirmed!</h3>
            <p>
              We&apos;re excited to connect with you and help you take the next
              step in your career journey.
            </p>
          </div>
        </div>
        <div className={styles.botWrap} aria-hidden="true">
          <div className={styles.bot}>
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <rect x="12" y="18" width="40" height="30" rx="14" fill="currentColor" />
              <circle cx="26" cy="33" r="3" fill="#fff" />
              <circle cx="38" cy="33" r="3" fill="#fff" />
              <rect x="29" y="10" width="6" height="8" rx="3" fill="currentColor" />
            </svg>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h4 className={styles.sectionTitle}>Your Interview Details</h4>
        <div className={styles.detailsGrid}>
          <div className={styles.detailsList}>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3 8.5H17M7 3V6M13 3V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <p className={styles.detailLabel}>Date</p>
                <p className={styles.detailValue}>Monday, 19 May 2025</p>
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 6V10L12.8 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <p className={styles.detailLabel}>Time</p>
                <p className={styles.detailValue}>
                  01:30 PM (IST) <span className={styles.badge}>15 Min Interview</span>
                </p>
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="3" y="6" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M13 8L17 6.7V13.3L13 12V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className={styles.detailLabel}>Interview Mode</p>
                <p className={styles.detailValue}>AI Video Interview</p>
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 3.5A3 3 0 0 0 7 6.5V13A3.5 3.5 0 0 0 10.5 16.5H11A3.5 3.5 0 0 0 14.5 13V7A3.5 3.5 0 0 0 11 3.5H10Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
              <div>
                <p className={styles.detailLabel}>Interview Type</p>
                <p className={styles.detailValue}>Technical + Behavioral Assessment</p>
              </div>
            </div>
          </div>

          <aside className={styles.nextCard}>
            <h5>What&apos;s Next?</h5>
            <ul>
              <li>Our AI will conduct a fair and personalized conversation.</li>
              <li>Showcase your skills, experiences and problem-solving approach.</li>
              <li>Get matched with opportunities that are right for you.</li>
            </ul>
          </aside>
        </div>

        <div className={styles.detailActions}>
          <button type="button" className={styles.outlineBtn} onClick={handleCalendar}>
            Add to Calendar
          </button>
          <button type="button" className={styles.primaryBtn} onClick={handleGuide}>
            View Interview Guide →
          </button>
        </div>
      </section>

      <section className={styles.card}>
        <h4 className={styles.sectionTitle}>We&apos;ve Sent You a Confirmation!</h4>
        <p className={styles.subtitle}>
          Check your email and WhatsApp for all the details.
        </p>
        <div className={styles.confirmGrid}>
          <article className={styles.confirmCard}>
            <div className={styles.confirmHead}>
              <p>Email Sent</p>
              <span className={styles.sent}>Sent</span>
            </div>
            <div className={styles.messageBox}>
              <p>Hi Arjun,</p>
              <p>Your 15-minute AI interview is confirmed.</p>
              <p>Date: Monday, 19 May 2025</p>
              <p>Time: 01:30 PM (IST)</p>
            </div>
            <button type="button" className={styles.outlineBtn}>
              Open Email
            </button>
          </article>
          <article className={styles.confirmCard}>
            <div className={styles.confirmHead}>
              <p>WhatsApp Sent</p>
              <span className={styles.sent}>Sent</span>
            </div>
            <div className={styles.messageBox}>
              <p>Hi Arjun,</p>
              <p>Your 15-minute AI interview is confirmed.</p>
              <p>Mon, 19 May 2025 · 01:30 PM (IST)</p>
            </div>
            <button type="button" className={styles.whatsappBtn}>
              Open WhatsApp
            </button>
          </article>
        </div>
      </section>

      <section className={styles.card}>
        <h4 className={styles.sectionTitle}>We&apos;ll Remind You!</h4>
        <p className={styles.subtitle}>
          You&apos;ll get reminders so you never miss your interview.
        </p>
        <div className={styles.reminders}>
          {[
            '24 Hours Before',
            '1 Hour Before',
            '15 Minutes Before',
            'Interview Time',
          ].map((item, index) => (
            <button
              key={item}
              type="button"
              className={`${styles.reminderItem} ${selectedReminder === index ? styles.reminderActive : ''}`}
              onClick={() => setSelectedReminder(index)}
            >
              <span className={styles.reminderDot} />
              <div>
                <p>{item}</p>
                <span>
                  {index === 3
                    ? 'Join and ace your AI interview'
                    : 'Quick reminder with interview instructions'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={`${styles.card} ${styles.finalCard}`}>
        <div className={styles.finalIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3.5L14.6 9.1L20.8 9.8L16.2 13.9L17.5 20L12 16.8L6.5 20L7.8 13.9L3.2 9.8L9.4 9.1L12 3.5Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div>
          <h4>
            You&apos;ve Taken the <span>Right Step!</span>
          </h4>
          <p>
            Believe in yourself. Showcase your best. Opportunities are waiting
            for you.
          </p>
          <small>
            If you need any help, reach out to us at care@hreright.com
          </small>
        </div>
      </section>

      {status && <p className={styles.status}>{status}</p>}
    </div>
  )
}
