import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ProfileFormData } from '../data/wizard'
import { firstName } from '../lib/store'
import { MotionButton } from '../motion/MotionButton'
import { MotionItem, MotionStack } from '../motion/MotionStack'
import styles from './AiInterviewStep.module.css'

interface AiInterviewStepProps {
  data: ProfileFormData
  onChange: <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) => void
}

export function AiInterviewStep({ onChange }: AiInterviewStepProps) {
  const navigate = useNavigate()
  const [selectedReminder, setSelectedReminder] = useState(2)
  const [status, setStatus] = useState('')
  const name = firstName()
  const interviewWhen = (() => {
    const when = new Date()
    when.setDate(when.getDate() + 2)
    when.setHours(13, 30, 0, 0)
    return when
  })()
  const dateLabel = interviewWhen.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const shortDateLabel = interviewWhen.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const timeLabel = interviewWhen.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  function handleCalendar() {
    onChange(
      'interviewNotes',
      `Interview scheduled for ${shortDateLabel} at ${timeLabel}.`,
    )
    setStatus('Calendar event prepared. Opening your calendar…')
    const start = interviewWhen
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
    const endDate = new Date(interviewWhen.getTime() + 15 * 60 * 1000)
    const end = endDate
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=HIRERIGHT%20AI%20Interview&dates=${start}/${end}&details=15-minute%20AI%20Interview`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  function handleGuide() {
    setStatus('Opening your video AI interview room…')
    navigate('/interview')
  }

  return (
    <MotionStack className={styles.stack}>
      <MotionItem as="section" className={`${styles.card} ${styles.banner}`}>
        <div className={styles.bannerLeft}>
          <motion.div
            className={styles.successIcon}
            aria-hidden="true"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 16 }}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13L9.5 17.5L19 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
          <div className={styles.bannerText}>
            <p className={styles.bannerEyebrow}>All Set, {name}!</p>
            <h3>Your 15-Minute AI Interview is Confirmed!</h3>
            <p>
              We&apos;re excited to connect with you and help you take the next
              step in your career journey.
            </p>
          </div>
        </div>
        <motion.div
          className={styles.botWrap}
          aria-hidden="true"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className={styles.bot}>
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <rect x="12" y="18" width="40" height="30" rx="14" fill="currentColor" />
              <circle cx="26" cy="33" r="3" fill="#fff" />
              <circle cx="38" cy="33" r="3" fill="#fff" />
              <rect x="29" y="10" width="6" height="8" rx="3" fill="currentColor" />
            </svg>
          </div>
        </motion.div>
      </MotionItem>

      <MotionItem as="section" className={styles.card}>
        <h4 className={styles.sectionTitle}>Your Interview Details</h4>
        <div className={styles.detailsGrid}>
          <div className={styles.detailsList}>
            {[
              {
                label: 'Date',
                value: dateLabel,
                icon: (
                  <>
                    <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 8.5H17M7 3V6M13 3V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                ),
              },
              {
                label: 'Time',
                value: (
                  <>
                    {timeLabel}{' '}
                    <span className={styles.badge}>15 Min Interview</span>
                  </>
                ),
                icon: (
                  <>
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 6V10L12.8 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                ),
              },
              {
                label: 'Interview Mode',
                value: 'AI Video Interview',
                icon: (
                  <>
                    <rect x="3" y="6" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M13 8L17 6.7V13.3L13 12V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </>
                ),
              },
              {
                label: 'Interview Type',
                value: 'Technical + Behavioral Assessment',
                icon: (
                  <path d="M10 3.5A3 3 0 0 0 7 6.5V13A3.5 3.5 0 0 0 10.5 16.5H11A3.5 3.5 0 0 0 14.5 13V7A3.5 3.5 0 0 0 11 3.5H10Z" stroke="currentColor" strokeWidth="1.5" />
                ),
              },
            ].map((item) => (
              <motion.div
                key={item.label}
                className={styles.detailItem}
                whileHover={{ x: 4 }}
              >
                <span className={styles.detailIcon}>
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    {item.icon}
                  </svg>
                </span>
                <div>
                  <p className={styles.detailLabel}>{item.label}</p>
                  <p className={styles.detailValue}>{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.aside
            className={styles.nextCard}
            whileHover={{ y: -3, scale: 1.01 }}
          >
            <h5>What&apos;s Next?</h5>
            <ul>
              <li>Our AI will run a live video interview — camera on, spoken answers.</li>
              <li>Showcase your skills, experiences and problem-solving approach.</li>
              <li>Get matched with opportunities that are right for you.</li>
            </ul>
          </motion.aside>
        </div>

        <div className={styles.detailActions}>
          <MotionButton
            type="button"
            className={styles.outlineBtn}
            onClick={handleCalendar}
            lift
          >
            Add to Calendar
          </MotionButton>
          <MotionButton
            type="button"
            className={styles.primaryBtn}
            onClick={handleGuide}
            lift
          >
            Start video interview →
          </MotionButton>
        </div>
      </MotionItem>

      <MotionItem as="section" className={styles.card}>
        <h4 className={styles.sectionTitle}>We&apos;ve Sent You a Confirmation!</h4>
        <p className={styles.subtitle}>
          Check your email and WhatsApp for all the details.
        </p>
        <div className={styles.confirmGrid}>
          <motion.article
            className={styles.confirmCard}
            whileHover={{ y: -4 }}
          >
            <div className={styles.confirmHead}>
              <p>Email Sent</p>
              <span className={styles.sent}>Sent</span>
            </div>
            <div className={styles.messageBox}>
              <p>Hi {name},</p>
              <p>Your 15-minute AI interview is confirmed.</p>
              <p>Date: {dateLabel}</p>
              <p>Time: {timeLabel}</p>
            </div>
            <MotionButton
              type="button"
              className={styles.outlineBtn}
              lift
              onClick={() => {
                window.location.href =
                  'mailto:arjun@example.com?subject=AI%20Interview%20Confirmation'
              }}
            >
              Open Email
            </MotionButton>
          </motion.article>
          <motion.article
            className={styles.confirmCard}
            whileHover={{ y: -4 }}
          >
            <div className={styles.confirmHead}>
              <p>WhatsApp Sent</p>
              <span className={styles.sent}>Sent</span>
            </div>
            <div className={styles.messageBox}>
              <p>Hi {name},</p>
              <p>Your 15-minute AI interview is confirmed.</p>
              <p>
                {shortDateLabel} · {timeLabel}
              </p>
            </div>
            <MotionButton
              type="button"
              className={styles.whatsappBtn}
              lift
              onClick={() => {
                window.open('https://wa.me/', '_blank', 'noopener,noreferrer')
              }}
            >
              Open WhatsApp
            </MotionButton>
          </motion.article>
        </div>
      </MotionItem>

      <MotionItem as="section" className={styles.card}>
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
            <motion.button
              key={item}
              type="button"
              className={`${styles.reminderItem} ${selectedReminder === index ? styles.reminderActive : ''}`}
              onClick={() => setSelectedReminder(index)}
              whileHover={{ x: 4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              animate={
                selectedReminder === index ? { scale: 1.02 } : { scale: 1 }
              }
            >
              <span className={styles.reminderDot} />
              <div>
                <p>{item}</p>
                <span>
                  {index === 3
                    ? 'Join your video AI interview'
                    : 'Quick reminder with interview instructions'}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </MotionItem>

      <MotionItem as="section" className={`${styles.card} ${styles.finalCard}`}>
        <motion.div
          className={styles.finalIcon}
          aria-hidden="true"
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3.5L14.6 9.1L20.8 9.8L16.2 13.9L17.5 20L12 16.8L6.5 20L7.8 13.9L3.2 9.8L9.4 9.1L12 3.5Z"
              fill="currentColor"
            />
          </svg>
        </motion.div>
        <div>
          <h4>
            You&apos;ve Taken the <span>Right Step!</span>
          </h4>
          <p>
            Believe in yourself. Showcase your best. Opportunities are waiting
            for you.
          </p>
          <small>
            If you need any help, reach out to us at care@HIRERIGHT.com
          </small>
        </div>
      </MotionItem>

      {status && (
        <motion.p
          className={styles.status}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {status}
        </motion.p>
      )}
    </MotionStack>
  )
}
