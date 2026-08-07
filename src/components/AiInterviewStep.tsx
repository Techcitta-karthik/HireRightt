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

export function AiInterviewStep({ data, onChange }: AiInterviewStepProps) {
  const navigate = useNavigate()
  const name = firstName()
  const existing = getInterviewResult()

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
                : 'Your profile is ready — take the AI interview'}
            </h3>
            <p>
              Ava will ask about your experience using the skills and role you just added.
              Speak your answers on camera to get a talent score and unlock matches.
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
              <li>4. AI video interview → score</li>
              <li>5. Unlock matched roles</li>
            </ul>
          </aside>
        </div>

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
