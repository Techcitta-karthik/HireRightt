import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ProfileFormData } from '../data/wizard'
import { firstName, getInterviewResult } from '../lib/store'
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

const PRESET_SLOTS = [
  'Tomorrow, 10:00 AM',
  'Tomorrow, 3:00 PM',
  'In 2 Days, 11:00 AM',
]

export function AiInterviewStep({ data, onChange }: AiInterviewStepProps) {
  const navigate = useNavigate()
  const name = firstName()
  const existing = getInterviewResult()

  const [showSchedule, setShowSchedule] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(PRESET_SLOTS[0])
  const [customDate, setCustomDate] = useState('')

  const isScheduled = data.interviewNotes?.startsWith('Scheduled:')

  function enterStudio() {
    onChange(
      'interviewNotes',
      existing
        ? `Retake from profile wizard · previous score ${existing.overall}.`
        : `Profile ready (${data.skills.length} skills, role: ${data.currentRole || 'not set'}). Entering AI Interview Studio.`,
    )
    sessionStorage.setItem('hireright.returnToWizard', '1')
    navigate('/interview')
  }

  function confirmSchedule() {
    const slot = customDate
      ? new Date(customDate).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : selectedSlot

    onChange('interviewNotes', `Scheduled: ${slot}`)
    setShowSchedule(false)
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
            <p className={styles.bannerEyebrow}>Great progress, {name}</p>
            <h3>
              {existing
                ? `You scored ${existing.overall} — retake to improve`
                : isScheduled
                  ? 'Interview Scheduled — Start Now or Return Later'
                  : 'Your profile is ready — take the AI interview'}
            </h3>
            <p>
              {isScheduled
                ? `Your interview is scheduled for ${data.interviewNotes.replace('Scheduled: ', '')}. You can start right now or return at your scheduled time.`
                : 'Ava will ask about your experience using the skills and role you just added. Speak your answers on camera or schedule for another time.'}
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
        <h4 className={styles.sectionTitle}>What Ava will use from your profile</h4>
        <div className={styles.detailsGrid}>
          <div className={styles.detailsList}>
            {[
              ['Role', data.currentRole || 'Select on interview lobby'],
              ['Experience', data.totalExperience || 'Not set yet'],
              ['Skills', data.skills.length ? data.skills.slice(0, 6).join(', ') : 'Add skills in step 2'],
              ['Location', data.currentLocation || 'Not set yet'],
            ].map(([label, value]) => (
              <div key={label} className={styles.detailItem}>
                <span className={styles.detailIcon} aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <div>
                  <p className={styles.detailLabel}>{label}</p>
                  <p className={styles.detailValue}>{value}</p>
                </div>
              </div>
            ))}
          </div>
          <aside className={styles.nextCard}>
            <h5>Your path</h5>
            <ul>
              <li>1. About You + resume</li>
              <li>2. Skills & experience</li>
              <li>3. Performance highlights</li>
              <li>4. AI video interview (Start or Schedule)</li>
              <li>5. Unlock matched roles</li>
            </ul>
          </aside>
        </div>

        {/* Scheduled Confirmation Banner */}
        {isScheduled && !showSchedule && (
          <div className={styles.scheduledBanner}>
            <div className={styles.scheduledTop}>
              <span className={styles.scheduledBadge}>
                ✓ Interview Scheduled: {data.interviewNotes.replace('Scheduled: ', '')}
              </span>
              <button
                type="button"
                className={styles.rescheduleLink}
                onClick={() => setShowSchedule(true)}
              >
                Reschedule
              </button>
            </div>
            <p className={styles.scheduledNote}>
              Calendar reminder active. You can launch into the interview studio now anytime or return at your scheduled time.
            </p>
          </div>
        )}

        {/* Schedule Selector Box */}
        {showSchedule && (
          <div className={styles.scheduleBox}>
            <div className={styles.scheduleHead}>
              <h4>📅 Schedule AI Interview</h4>
              <button
                type="button"
                className={styles.rescheduleLink}
                onClick={() => setShowSchedule(false)}
              >
                Close
              </button>
            </div>
            <p className={styles.subtitle}>
              Pick a time slot or select a custom date. We&apos;ll set a calendar reminder for your AI interview.
            </p>

            <div className={styles.presetGrid}>
              {PRESET_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={selectedSlot === slot && !customDate ? styles.presetBtnActive : styles.presetBtn}
                  onClick={() => {
                    setSelectedSlot(slot)
                    setCustomDate('')
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>

            <div className={styles.customDateTime}>
              <label htmlFor="custom-interview-date">Or select custom date & time:</label>
              <input
                id="custom-interview-date"
                type="datetime-local"
                className={styles.dateInput}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            </div>

            <div className={styles.scheduleActions}>
              <MotionButton
                type="button"
                className={styles.outlineBtn}
                onClick={() => setShowSchedule(false)}
              >
                Cancel
              </MotionButton>
              <MotionButton
                type="button"
                className={styles.primaryBtn}
                onClick={confirmSchedule}
              >
                Confirm Schedule ✓
              </MotionButton>
            </div>
          </div>
        )}

        <div className={styles.detailActions}>
          <MotionButton
            type="button"
            className={styles.outlineBtn}
            onClick={() => navigate('/onboarding')}
            lift
          >
            Edit earlier steps
          </MotionButton>
          <MotionButton
            type="button"
            className={styles.outlineBtn}
            onClick={() => setShowSchedule((prev) => !prev)}
            lift
          >
            {isScheduled ? '📅 Reschedule' : '📅 Schedule for later'}
          </MotionButton>
          <MotionButton
            type="button"
            className={styles.primaryBtn}
            onClick={enterStudio}
            lift
          >
            {existing ? 'Retake AI interview →' : 'Start interview now →'}
          </MotionButton>
        </div>
      </MotionItem>
    </MotionStack>
  )
}
