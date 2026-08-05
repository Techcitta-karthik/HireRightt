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

export function AiInterviewStep({ onChange }: AiInterviewStepProps) {
  const navigate = useNavigate()
  const name = firstName()
  const existing = getInterviewResult()

  function enterStudio() {
    onChange(
      'interviewNotes',
      existing
        ? `Retake from profile wizard · previous score ${existing.overall}.`
        : 'Entered HireRight AI Interview Studio from profile wizard.',
    )
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
            <p className={styles.bannerEyebrow}>Ready, {name}</p>
            <h3>
              {existing
                ? `Your score is ${existing.overall} — retake anytime`
                : 'Next: live AI video interview with Ava'}
            </h3>
            <p>
              Camera on, speak your answers, get scored instantly — then unlock ranked job
              matches. This is the core of HIRERIGHT.
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
        <h4 className={styles.sectionTitle}>What happens in the studio</h4>
        <div className={styles.detailsGrid}>
          <div className={styles.detailsList}>
            {[
              ['Mode', 'Live AI video interview'],
              ['Interviewer', 'Ava · HireRight'],
              ['Format', 'Spoken answers · 5 questions'],
              ['Outcome', 'Instant talent score + unlocked matches'],
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
            <h5>Tips before you join</h5>
            <ul>
              <li>Quiet space and good lighting</li>
              <li>Allow camera & microphone</li>
              <li>Answer out loud — Ava listens and transcribes</li>
            </ul>
          </aside>
        </div>

        <div className={styles.detailActions}>
          <MotionButton
            type="button"
            className={styles.outlineBtn}
            onClick={() => navigate('/dashboard')}
            lift
          >
            Skip to dashboard
          </MotionButton>
          <MotionButton
            type="button"
            className={styles.primaryBtn}
            onClick={enterStudio}
            lift
          >
            {existing ? 'Retake AI interview →' : 'Enter interview studio →'}
          </MotionButton>
        </div>
      </MotionItem>
    </MotionStack>
  )
}
