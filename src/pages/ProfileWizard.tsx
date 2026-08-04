import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
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
import {
  ApiError,
  bookInterview,
  cancelInterview,
  getProfile,
  listInterviewSlots,
  listMyInterviews,
  listResumes,
  updateProfile,
  uploadResume,
  type InterviewBooking,
  type InterviewSlot,
} from '../lib/api'
import styles from './ProfileWizard.module.css'

const DRAFT_KEY = 'hireright_wizard_draft'

function experienceToYears(value: string): number | null {
  if (!value) return null
  if (value.toLowerCase().includes('fresher')) return 0
  const numbers = value.match(/\d+/g)?.map(Number) ?? []
  return numbers.at(-1) ?? null
}

function yearsToExperience(years: number | null): string {
  if (years === null) return ''
  if (years === 0) return 'Fresher / 0 years'
  if (years <= 1) return '0 – 1 Years'
  if (years <= 2) return '1 – 2 Years'
  if (years <= 3) return '2 – 3 Years'
  if (years <= 5) return '3 – 5 Years'
  if (years <= 8) return '5 – 8 Years'
  if (years <= 12) return '8 – 12 Years'
  return '12+ Years'
}

function noticeToDays(value: string): number | null {
  if (!value) return null
  if (value === 'Immediate') return 0
  const days = value.match(/\d+/)?.[0]
  return days ? Number(days) : null
}

function daysToNotice(days: number | null): string {
  if (days === null) return ''
  if (days === 0) return 'Immediate'
  if (days <= 15) return '15 days'
  if (days <= 30) return '30 days'
  if (days <= 60) return '60 days'
  return '90 days'
}

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
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<WizardStep>(1)
  const [completedThrough, setCompletedThrough] = useState(0)
  const [data, setData] = useState<ProfileFormData>(initialFormData)
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [uploadedResumeName, setUploadedResumeName] = useState('')
  const [uploadedFileSignature, setUploadedFileSignature] = useState('')
  const [slots, setSlots] = useState<InterviewSlot[]>([])
  const [booking, setBooking] = useState<InterviewBooking | null>(null)
  const [interviewLoading, setInterviewLoading] = useState(false)

  useEffect(() => {
    let active = true

    async function loadBackendData() {
      try {
        const [profile, resumes, interviews, availableSlots] =
          await Promise.all([
            getProfile(),
            listResumes(),
            listMyInterviews(),
            listInterviewSlots(),
          ])
        if (!active) return

        const draft = localStorage.getItem(DRAFT_KEY)
        if (draft) {
          try {
            setData((current) => ({ ...current, ...JSON.parse(draft) }))
          } catch {
            localStorage.removeItem(DRAFT_KEY)
          }
        }
        setData((current) => ({
          ...current,
          whoAreYou: profile.bio ?? current.whoAreYou,
          whatDrivesYou: profile.motivation ?? current.whatDrivesYou,
          keyStrengths: profile.strengths ?? current.keyStrengths,
          currentRole: profile.current_role ?? current.currentRole,
          totalExperience:
            profile.total_experience_years === null
              ? current.totalExperience
              : yearsToExperience(profile.total_experience_years),
          currentLocation: profile.current_location ?? current.currentLocation,
          noticePeriod:
            profile.notice_period_days === null
              ? current.noticePeriod
              : daysToNotice(profile.notice_period_days),
        }))
        setUploadedResumeName(resumes[0]?.original_name ?? '')
        setBooking(
          interviews.find((item) => item.status === 'scheduled') ?? null,
        )
        setSlots(availableSlots)
      } catch (caught) {
        if (!active) return
        if (caught instanceof ApiError && caught.status === 401) {
          logout()
          navigate('/login', { replace: true })
          return
        }
        showToast(
          caught instanceof ApiError
            ? caught.message
            : 'Could not load your saved profile.',
        )
      } finally {
        if (active) setLoadingProfile(false)
      }
    }

    void loadBackendData()
    return () => {
      active = false
    }
  }, [logout, navigate])

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
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ ...data, resumeFile: null }),
      )

      if (step === 1) {
        await updateProfile({
          bio: data.whoAreYou || null,
          motivation: data.whatDrivesYou || null,
          strengths: data.keyStrengths || null,
          current_role: data.currentRole || null,
          total_experience_years: experienceToYears(data.totalExperience),
          current_location: data.currentLocation || null,
          notice_period_days: noticeToDays(data.noticePeriod),
        })

        if (data.resumeFile) {
          const signature = `${data.resumeFile.name}:${data.resumeFile.size}:${data.resumeFile.lastModified}`
          if (signature !== uploadedFileSignature) {
            const resume = await uploadResume(data.resumeFile)
            setUploadedResumeName(resume.original_name)
            setUploadedFileSignature(signature)
          }
        }
      }
      showToast(message)
      return true
    } catch (caught) {
      showToast(
        caught instanceof ApiError
          ? caught.message
          : 'Your changes could not be saved.',
      )
      return false
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveExit() {
    await persist('Progress saved. You can come back anytime.')
  }

  async function handleContinue() {
    const saved = await persist(
      step === 5
        ? 'Profile submitted successfully!'
        : `Step ${step} saved. Moving forward…`,
    )
    if (!saved) return
    setCompletedThrough((prev) => Math.max(prev, step))
    if (step < 5) {
      setStep((prev) => (prev + 1) as WizardStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function handleBookInterview(slotId: string) {
    setInterviewLoading(true)
    try {
      const created = await bookInterview(slotId)
      setBooking(created)
      setSlots((current) => current.filter((slot) => slot.id !== slotId))
      showToast('Your interview has been booked.')
    } catch (caught) {
      showToast(
        caught instanceof ApiError
          ? caught.message
          : 'The interview could not be booked.',
      )
      const refreshed = await listInterviewSlots().catch(() => [])
      setSlots(refreshed)
    } finally {
      setInterviewLoading(false)
    }
  }

  async function handleCancelInterview() {
    if (!booking) return
    setInterviewLoading(true)
    try {
      await cancelInterview(booking.id)
      setBooking(null)
      setSlots(await listInterviewSlots())
      showToast('Your interview booking was cancelled.')
    } catch (caught) {
      showToast(
        caught instanceof ApiError
          ? caught.message
          : 'The interview could not be cancelled.',
      )
    } finally {
      setInterviewLoading(false)
    }
  }

  function handleSignOut() {
    logout()
    navigate('/', { replace: true })
  }

  const meta = STEP_TITLES[step]
  const showAutoSaveFooter = step >= 2

  return (
    <div className={styles.layout}>
      <Sidebar step={step} />

      <div className={styles.main}>
        <TopBar
          userName={user?.full_name.split(' ')[0] ?? 'Candidate'}
          onSignOut={handleSignOut}
        />

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
          {step === 1 && (
            <AboutYouStep
              data={data}
              onChange={updateField}
              uploadedResumeName={uploadedResumeName}
            />
          )}
          {step === 2 && <SkillsStep data={data} onChange={updateField} />}
          {step === 3 && (
            <PerformanceStep data={data} onChange={updateField} />
          )}
          {step === 4 && (
            <AiInterviewStep
              data={data}
              onChange={updateField}
              userName={user?.full_name ?? 'Candidate'}
              slots={slots}
              booking={booking}
              loading={interviewLoading}
              onBook={handleBookInterview}
              onCancel={handleCancelInterview}
            />
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
                disabled={saving || loadingProfile}
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
                disabled={saving || loadingProfile}
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
                  disabled={saving || loadingProfile}
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
