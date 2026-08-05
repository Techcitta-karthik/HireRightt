import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import type { ProfileFormData } from '../data/wizard'
import { firstName, getInterviewResult, getUser } from '../lib/store'
import { MotionButton } from '../motion/MotionButton'
import { MotionItem, MotionStack } from '../motion/MotionStack'
import styles from './CompleteStep.module.css'

interface CompleteStepProps {
  data: ProfileFormData
  onEditStep: (step: 1 | 2 | 3 | 4) => void
}

export function CompleteStep({ data, onEditStep }: CompleteStepProps) {
  const navigate = useNavigate()
  const name = firstName()
  const fullName = getUser()?.name ?? name
  const location = data.currentLocation || 'Location not set'
  const interview = getInterviewResult()

  return (
    <MotionStack className={styles.stack}>
      <MotionItem as="section" className={`${styles.card} ${styles.hero}`}>
        <motion.div
          className={styles.successOrb}
          aria-hidden="true"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 14 }}
        >
          ✓
        </motion.div>
        <div>
          <p className={styles.congrats}>Congratulations, {name}!</p>
          <h3>You&apos;re All Set!</h3>
          <p>
            Your profile is complete and verified. You&apos;re now visible to top
            employers and our AI is already finding the best opportunities for
            you.
          </p>
        </div>
        <motion.img
          src="/rocket.png"
          alt=""
          className={styles.rocket}
          aria-hidden="true"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </MotionItem>

      <MotionItem as="section" className={styles.card}>
        <h4>What&apos;s Next?</h4>
        <p className={styles.sub}>
          We&apos;re already working behind the scenes to find the perfect matches
          for you.
        </p>
        <div className={styles.nextGrid}>
          {[
            {
              title: interview ? 'Unlock matched roles' : 'Take AI interview',
              desc: interview
                ? `Your score is ${interview.overall}. Browse roles ranked by that score.`
                : 'Enter the studio with Ava — required to unlock job applications.',
              to: interview ? '/jobs' : '/interview',
            },
            {
              title: 'Open talent scorecard',
              desc: 'See category scores, strengths, and what to improve next.',
              to: '/profile',
            },
            {
              title: 'Retake anytime',
              desc: 'Improve your AI interview score to climb the match list.',
              to: '/interview',
            },
            {
              title: 'Dashboard',
              desc: 'Track applications and readiness in one place.',
              to: '/dashboard',
            },
          ].map((item) => (
            <motion.article key={item.title} whileHover={{ y: -4, scale: 1.02 }}>
              <Link to={item.to} className={styles.nextLink}>
                <span className={styles.nextIcon} aria-hidden="true">
                  →
                </span>
                <h5>{item.title}</h5>
                <p>{item.desc}</p>
              </Link>
            </motion.article>
          ))}
        </div>
      </MotionItem>

      <MotionItem as="section" className={styles.card}>
        <div className={styles.summaryHead}>
          <h4>Your Profile Summary</h4>
          <MotionButton
            type="button"
            className={styles.linkBtn}
            onClick={() => navigate('/profile')}
          >
            View Full Profile
          </MotionButton>
        </div>
        <div className={styles.profileRow}>
          <div className={styles.avatar} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M5 20C6.2 16.8 8.8 15 12 15C15.2 15 17.8 16.8 19 20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h5>{fullName}</h5>
            <p>{data.currentRole || 'Role not set'}</p>
            <small>{location}</small>
          </div>
          <span className={styles.completeTag}>
            {interview ? `Score ${interview.overall}` : 'Interview pending'}
          </span>
        </div>
        <div className={styles.statsRow}>
          {(
            [
              [2, data.totalExperience || '—', 'Experience'],
              [2, String(data.skills.length), 'Skills'],
              [3, String(data.achievements.filter(Boolean).length), 'Achievements'],
              [4, interview ? String(interview.overall) : '—', 'AI Score'],
              [4, interview ? 'Certified' : 'Take interview', 'Status'],
            ] as const
          ).map(([step, value, label]) => (
            <motion.button
              key={label}
              type="button"
              onClick={() => onEditStep(step)}
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <strong>{value}</strong>
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </MotionItem>

      <MotionItem as="section" className={`${styles.card} ${styles.journey}`}>
        <motion.div
          className={styles.trophy}
          aria-hidden="true"
          animate={{ y: [0, -6, 0], rotate: [0, -4, 4, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M8 4H16V8A4 4 0 0 1 12 12A4 4 0 0 1 8 8V4Z"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="M10 12V15H14V12M8 20H16"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <path
              d="M8 6H5A2 2 0 0 0 3 8C3 10.2 4.8 12 7 12H8M16 6H19A2 2 0 0 1 21 8C21 10.2 19.2 12 17 12H16"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
        <div>
          <h4>
            {interview ? 'Matches unlocked' : 'Interview to unlock matches'}
          </h4>
          <p>
            {interview
              ? 'Your AI score is live. Browse ranked roles and apply with proof of skill.'
              : 'Finish the AI video interview with Ava to unlock applications.'}
          </p>
        </div>
        <div className={styles.journeyActions}>
          <MotionButton
            type="button"
            className={styles.primaryWide}
            onClick={() => navigate(interview ? '/jobs' : '/interview')}
            lift
          >
            {interview ? 'Browse matched roles →' : 'Enter interview studio →'}
          </MotionButton>
          <MotionButton
            type="button"
            className={styles.secondaryWide}
            onClick={() => navigate('/dashboard')}
            lift
          >
            Go to dashboard
          </MotionButton>
        </div>
      </MotionItem>

      <motion.section
        className={styles.quickLinks}
        variants={{ hidden: {}, show: {} }}
      >
        <MotionButton
          type="button"
          className={styles.smallLink}
          onClick={() => onEditStep(1)}
        >
          ← Back
        </MotionButton>
        <MotionButton
          type="button"
          className={styles.smallLink}
          onClick={() => onEditStep(4)}
        >
          Review Interview
        </MotionButton>
      </motion.section>
    </MotionStack>
  )
}
