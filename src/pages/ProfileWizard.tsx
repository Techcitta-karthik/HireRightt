import { useEffect, useState } from 'react'
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
  const [step, setStep] = useState<WizardStep>(1)
  const [completedThrough, setCompletedThrough] = useState(0)
  const [data, setData] = useState<ProfileFormData>(initialFormData)
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)

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

  function showToast(message: string) {
    setToast(message)
  }

  async function persist(message: string) {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 450))
    setSaving(false)
    showToast(message)
  }

  async function handleSaveExit() {
    await persist('Progress saved. You can come back anytime.')
  }

  async function handleContinue() {
    await persist(
      step === 5
        ? 'Profile submitted successfully!'
        : `Step ${step} saved. Moving forward…`,
    )
    setCompletedThrough((prev) => Math.max(prev, step))
    if (step < 5) {
      setStep((prev) => (prev + 1) as WizardStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const meta = STEP_TITLES[step]
  const showAutoSaveFooter = step >= 2

  return (
    <div className={styles.layout}>
      <Sidebar step={step} />

      <div className={styles.main}>
        <TopBar />

        <header className={styles.pageHeader}>
          <h1>{meta.title}</h1>
          <p>{meta.subtitle}</p>
        </header>

        <Stepper
          current={step}
          completedThrough={completedThrough}
          onStepClick={(next) => setStep(next)}
        />

        <div key={step} className={styles.panel}>
          {step === 1 && <AboutYouStep data={data} onChange={updateField} />}
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
        </div>

        {step === 1 && <PrivacyBanner />}

        <footer
          className={`${styles.actions} ${showAutoSaveFooter ? styles.actionsSplit : ''}`}
        >
          {showAutoSaveFooter ? (
            <>
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => setStep((prev) => (prev - 1) as WizardStep)}
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
              </button>

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

              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleContinue}
                disabled={saving}
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
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={handleSaveExit}
                disabled={saving}
              >
                Save & Exit
              </button>

              <div className={styles.actionRight}>
                {step > 1 && (
                  <button
                    type="button"
                    className={styles.ghostBtn}
                    onClick={() => setStep((prev) => (prev - 1) as WizardStep)}
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleContinue}
                  disabled={saving}
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
                </button>
              </div>
            </>
          )}
        </footer>

        <p className={styles.stepHint}>
          Step {step} of {STEPS.length}
        </p>
      </div>

      {toast && (
        <div className={styles.toast} role="status">
          <span className={styles.toastDot} aria-hidden="true" />
          {toast}
        </div>
      )}
    </div>
  )
}
