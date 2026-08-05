import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AboutYouStep } from '../components/AboutYouStep'
import { AiInterviewStep } from '../components/AiInterviewStep'
import { CompleteStep } from '../components/CompleteStep'
import { PerformanceStep } from '../components/PerformanceStep'
import { PrivacyBanner } from '../components/PrivacyBanner'
import { Sidebar } from '../components/Sidebar'
import { SkillsStep } from '../components/SkillsStep'
import { Stepper } from '../components/Stepper'
import { TopBar } from '../components/TopBar'
import {
  initialFormData,
  STEPS,
  type ProfileFormData,
  type WizardStep,
} from '../data/wizard'
import { firstName, getProfile, saveProfile } from '../lib/store'
import { apiHealth, apiSaveProfile } from '../lib/api'
import { MotionButton } from '../motion/MotionButton'
import { easeOut, fadeUp, stepPanel } from '../motion/variants'
import styles from './ProfileWizard.module.css'

const STEP_TITLES: Record<WizardStep, { title: string; subtitle: string }> = {
  1: {
    title: "Let's Build Your Profile",
    subtitle:
      'Start with the essentials — upload your resume and tell us a bit about yourself.',
  },
  2: {
    title: "Let's Add Your Skills & Experience",
    subtitle:
      'This helps us understand your expertise and match you with the best opportunities.',
  },
  3: {
    title: "Let's Highlight Your Performance",
    subtitle:
      'Share your achievements and contributions that demonstrate your impact.',
  },
  4: {
    title: 'AI Interview',
    subtitle: 'Your interview is confirmed. Here are all your details and next steps.',
  },
  5: {
    title: 'All Set!',
    subtitle: 'Everything is complete. Explore opportunities and go to your dashboard.',
  },
}

export function ProfileWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState<WizardStep>(1)
  const [completedThrough, setCompletedThrough] = useState(0)
  const [userName, setUserName] = useState(() => firstName())
  const [data, setData] = useState<ProfileFormData>(() => {
    const saved = getProfile()
    if (!saved) return initialFormData
    return {
      ...initialFormData,
      whoAreYou: saved.whoAreYou,
      whatDrivesYou: saved.whatDrivesYou,
      keyStrengths: saved.keyStrengths,
      currentRole: saved.currentRole,
      totalExperience: saved.totalExperience,
      currentLocation: saved.currentLocation,
      noticePeriod: saved.noticePeriod,
      skills: saved.skills,
      experienceSummary: saved.experienceSummary,
      workExperiences: saved.workExperiences,
      achievements: saved.achievements,
      metrics: saved.metrics,
      awards: saved.awards,
      certifications: saved.certifications,
      selfRating: saved.selfRating,
      preferredRoles: saved.preferredRoles,
      preferredLocations: saved.preferredLocations,
      workMode: saved.workMode,
      salaryExpectation: saved.salaryExpectation,
      interviewNotes: saved.interviewNotes,
      resumeFile: null,
    }
  })
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const saved = getProfile()
    if (saved?.completedSteps) {
      setCompletedThrough(saved.completedSteps)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  function updateField<K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function patchFields(patch: Partial<ProfileFormData>) {
    setData((prev) => ({ ...prev, ...patch }))
  }

  function showToast(message: string) {
    setToast(message)
  }

  async function persist(message: string, nextCompleted?: number) {
    setSaving(true)
    const saved = saveProfile(data, nextCompleted ?? completedThrough)
    try {
      if (await apiHealth()) await apiSaveProfile(saved)
    } catch {
      // local save is enough when API is offline
    }
    await new Promise((resolve) => setTimeout(resolve, 350))
    setSaving(false)
    showToast(message)
  }

  async function handleSaveExit() {
    await persist('Progress saved. You can come back anytime.')
  }

  async function handleContinue() {
    const nextCompleted = Math.max(completedThrough, step)
    await persist(
      step === 5
        ? 'Profile submitted successfully!'
        : `Step ${step} saved. Moving forward…`,
      nextCompleted,
    )
    setCompletedThrough(nextCompleted)
    if (step < 5) {
      setStep((prev) => (prev + 1) as WizardStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/dashboard')
    }
  }

  const meta = STEP_TITLES[step]
  const showAutoSaveFooter = step >= 2

  return (
    <motion.div
      className={styles.layout}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: easeOut }}
    >
      <Sidebar step={step} />

      <div className={styles.main}>
        <TopBar userName={userName} />

        <motion.header
          className={styles.pageHeader}
          key={`header-${step}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeOut }}
        >
          <h1>{meta.title}</h1>
          <p>{meta.subtitle}</p>
        </motion.header>

        <Stepper
          current={step}
          completedThrough={completedThrough}
          onStepClick={(next) => setStep(next)}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className={styles.panel}
            variants={stepPanel}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {step === 1 && (
              <AboutYouStep
                data={data}
                onChange={updateField}
                onPatch={patchFields}
                onExtracted={({ firstName: extractedName, fieldCount }) => {
                  if (extractedName) setUserName(extractedName)
                  if (fieldCount > 0) {
                    showToast(
                      extractedName
                        ? `Welcome, ${extractedName} — profile pre-filled from your resume.`
                        : 'Profile pre-filled from your resume.',
                    )
                  }
                }}
              />
            )}
            {step === 2 && <SkillsStep data={data} onChange={updateField} />}
            {step === 3 && (
              <PerformanceStep data={data} onChange={updateField} />
            )}
            {step === 4 && (
              <AiInterviewStep data={data} onChange={updateField} />
            )}
            {step === 5 && (
              <CompleteStep
                data={data}
                onEditStep={(next) => setStep(next)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {step === 1 && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <PrivacyBanner />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.footer
          className={`${styles.actions} ${showAutoSaveFooter ? styles.actionsSplit : ''}`}
          layout
          transition={{ duration: 0.25, ease: easeOut }}
        >
          {showAutoSaveFooter ? (
            <>
              <MotionButton
                type="button"
                className={styles.backBtn}
                onClick={() => setStep((prev) => (prev - 1) as WizardStep)}
                lift
              >
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M16 10H4M4 10L9 5M4 10L9 15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back
              </MotionButton>

              <p className={styles.autoSave}>
                <span className={styles.autoSaveDot} aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3.5 8.5L6.5 11.5L12.5 4.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                All changes are saved automatically
              </p>

              <MotionButton
                type="button"
                className={styles.primaryBtn}
                onClick={handleContinue}
                disabled={saving}
                lift
              >
                {saving
                  ? 'Saving…'
                  : step === 5
                    ? 'Finish & Go to Dashboard'
                    : 'Save & Continue'}
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M4 10H16M16 10L11 5M16 10L11 15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </MotionButton>
            </>
          ) : (
            <>
              <MotionButton
                type="button"
                className={styles.secondaryBtn}
                onClick={handleSaveExit}
                disabled={saving}
                lift
              >
                Save & Exit
              </MotionButton>

              <div className={styles.actionRight}>
                {step > 1 && (
                  <MotionButton
                    type="button"
                    className={styles.ghostBtn}
                    onClick={() => setStep((prev) => (prev - 1) as WizardStep)}
                  >
                    Back
                  </MotionButton>
                )}
                <MotionButton
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleContinue}
                  disabled={saving}
                  lift
                >
                  {saving ? 'Saving…' : step === 5 ? 'Finish' : 'Save & Continue'}
                  {step < 5 && (
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M4 10H16M16 10L11 5M16 10L11 15"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </MotionButton>
              </div>
            </>
          )}
        </motion.footer>

        <p className={styles.stepHint}>
          Step {step} of {STEPS.length}
        </p>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className={styles.toast}
            role="status"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            <span className={styles.toastDot} aria-hidden="true" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
