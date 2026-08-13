import type { ProfileFormData } from '../data/wizard'

export type User = {
  id: string
  name: string
  email: string
  createdAt: string
}

/** Profile without File objects — safe for localStorage. */
export type SavedProfile = Omit<ProfileFormData, 'resumeFile'> & {
  resumeName: string | null
  /** Raw extracted resume text for Ava's resume-accurate questions. */
  resumeText?: string
  updatedAt: string
  completedSteps: number
}

export type AnswerAnalysis = {
  question: string
  answer: string
  score: number
  wordCount: number
  keywordsHit: string[]
  feedback: string
}

export type InterviewResult = {
  role: string
  level: string
  date: string
  overall: number
  categories: { label: string; score: number }[]
  strengths: string[]
  improvements: string[]
  answers: AnswerAnalysis[]
  resumeFitScore?: number
  agent?: string
  integrity?: {
    faceViolations: number
    singlePersonOk: boolean
    maxFacesSeen: number
    banned?: boolean
    banReason?: string
    sideLookWarnings?: number
    tooFarWarnings?: number
  }
}

export type Application = {
  id: string
  title: string
  company: string
  location: string
  match: number
  status: 'Applied' | 'In Review' | 'Interview' | 'Offer'
  appliedAt: string
}

const USERS_KEY = 'hireright.users'
const SESSION_KEY = 'hireright.session'
const PROFILE_KEY = 'hireright.profile'
const RESULT_KEY = 'hireright.interviewResult'
const APPS_KEY = 'hireright.applications'

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function readUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) {
      // Migrate legacy single-user key if present.
      const legacy = localStorage.getItem('hireright.user')
      if (legacy) {
        const legacyUser = JSON.parse(legacy) as User & { password?: string }
        const user: User = {
          id: legacyUser.id || uid(),
          name: legacyUser.name,
          email: legacyUser.email,
          createdAt: legacyUser.createdAt || new Date().toISOString(),
        }
        writeUsers([user])
        localStorage.removeItem('hireright.user')
        return [user]
      }
      return []
    }
    return (JSON.parse(raw) as Array<User & { password?: string }>).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }))
  } catch {
    return []
  }
}

function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function saveUser(input: Omit<User, 'createdAt'> & { createdAt?: string }): User {
  const users = readUsers()
  const email = input.email.trim().toLowerCase()
  const previous = users.find((entry) => entry.id === input.id)
  const user: User = {
    id: input.id,
    name: input.name.trim(),
    email,
    createdAt: input.createdAt ?? new Date().toISOString(),
  }
  writeUsers([...users.filter((entry) => entry.id !== user.id && entry.email !== email), user])
  if (previous && previous.email !== email) {
    const previousProfileKey = `${PROFILE_KEY}.${previous.email}`
    const nextProfileKey = `${PROFILE_KEY}.${email}`
    const profile = localStorage.getItem(previousProfileKey)
    if (profile) {
      localStorage.setItem(nextProfileKey, profile)
      localStorage.removeItem(previousProfileKey)
    }
  }
  localStorage.setItem(SESSION_KEY, user.email)
  window.dispatchEvent(new Event('hireright-auth'))
  return user
}

export function getUser(): User | null {
  const email = localStorage.getItem(SESSION_KEY)
  if (!email) return null
  return readUsers().find((u) => u.email === email) ?? null
}

export function isLoggedIn(): boolean {
  return Boolean(getUser())
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new Event('hireright-auth'))
}

export function updateUserName(name: string): User | null {
  const user = getUser()
  if (!user) return null
  const next = name.trim()
  if (!next) return user
  const users = readUsers().map((entry) =>
    entry.email === user.email ? { ...entry, name: next } : entry,
  )
  writeUsers(users)
  return users.find((entry) => entry.email === user.email) ?? null
}

export type AccountPrefs = {
  emailMatchAlerts: boolean
  interviewReminders: boolean
  productTips: boolean
  profileVisibleToEmployers: boolean
  shareScoreOnApplications: boolean
  showOnlineStatus: boolean
}

const PREFS_KEY = 'hireright.prefs'

const DEFAULT_PREFS: AccountPrefs = {
  emailMatchAlerts: true,
  interviewReminders: true,
  productTips: false,
  profileVisibleToEmployers: true,
  shareScoreOnApplications: true,
  showOnlineStatus: false,
}

export function getAccountPrefs(): AccountPrefs {
  const user = getUser()
  if (!user) return { ...DEFAULT_PREFS }
  try {
    const raw = localStorage.getItem(`${PREFS_KEY}.${user.email}`)
    if (!raw) return { ...DEFAULT_PREFS }
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<AccountPrefs>) }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function saveAccountPrefs(prefs: AccountPrefs): AccountPrefs {
  const user = getUser()
  if (!user) return prefs
  localStorage.setItem(`${PREFS_KEY}.${user.email}`, JSON.stringify(prefs))
  return prefs
}

export function profileKey(email?: string) {
  const e = email ?? getUser()?.email
  return e ? `${PROFILE_KEY}.${e}` : PROFILE_KEY
}

export function saveProfile(data: ProfileFormData, completedSteps = 0): SavedProfile {
  const user = getUser()
  const saved: SavedProfile = {
    whoAreYou: data.whoAreYou,
    whatDrivesYou: data.whatDrivesYou,
    keyStrengths: data.keyStrengths,
    currentRole: data.currentRole,
    totalExperience: data.totalExperience,
    currentLocation: data.currentLocation,
    noticePeriod: data.noticePeriod,
    skills: data.skills,
    experienceSummary: data.experienceSummary,
    workExperiences: data.workExperiences,
    achievements: data.achievements,
    metrics: data.metrics,
    awards: data.awards,
    certifications: data.certifications,
    selfRating: data.selfRating,
    preferredRoles: data.preferredRoles,
    preferredLocations: data.preferredLocations,
    workMode: data.workMode,
    salaryExpectation: data.salaryExpectation,
    interviewNotes: data.interviewNotes,
    resumeName: data.resumeFile?.name ?? getProfile()?.resumeName ?? null,
    resumeText: data.resumeText || getProfile()?.resumeText || '',
    updatedAt: new Date().toISOString(),
    completedSteps: Math.max(completedSteps, getProfile()?.completedSteps ?? 0),
  }
  localStorage.setItem(profileKey(user?.email), JSON.stringify(saved))
  return saved
}

export function getProfile(): SavedProfile | null {
  const user = getUser()
  const raw =
    localStorage.getItem(profileKey(user?.email)) ??
    localStorage.getItem(PROFILE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SavedProfile
  } catch {
    return null
  }
}

export function calcProfileStrength(profile: SavedProfile | null): number {
  if (!profile) {
    const interviewOnly = getInterviewResult()
    return interviewOnly ? Math.min(100, 28 + Math.round(interviewOnly.overall * 0.35)) : 8
  }
  let score = 6
  if (profile.resumeName) score += 6
  if (profile.whoAreYou.length > 40) score += 5
  if (profile.whatDrivesYou.length > 20) score += 4
  if (profile.keyStrengths.length > 10) score += 4
  if (profile.currentRole) score += 4
  if (profile.totalExperience) score += 3
  if (profile.currentLocation) score += 3
  if (profile.skills.length >= 3) score += 6
  if (profile.skills.length >= 8) score += 3
  if (profile.workExperiences.some((w) => w.jobTitle && w.company)) score += 6
  if (profile.achievements.filter(Boolean).length > 0) score += 4
  if (profile.metrics.some((m) => m.metric)) score += 3
  if (profile.certifications.some((c) => c.name)) score += 3
  if (profile.selfRating > 0) score += 2
  if (profile.preferredRoles.length > 0) score += 3
  const interview = getInterviewResult()
  if (interview) score += 20 + Math.round(interview.overall * 0.25)
  return Math.min(100, score)
}

/** Minimum AI interview score required to apply to jobs. */
export const MIN_APPLY_SCORE = 40

export function hasInterviewScore(): boolean {
  return Boolean(getInterviewResult())
}

export function canApplyToJobs(): boolean {
  const interview = getInterviewResult()
  return Boolean(interview && interview.overall >= MIN_APPLY_SCORE)
}

export type RankedJob = {
  title: string
  company: string
  location: string
  match: number
  locked: boolean
}

export function getRankedJobs(): RankedJob[] {
  const interview = getInterviewResult()
  const profile = getProfile()
  const unlocked = Boolean(interview)
  const boost = interview ? Math.round(interview.overall / 20) : 0
  const roleHint = (
    interview?.role ||
    profile?.currentRole ||
    profile?.preferredRoles[0] ||
    ''
  ).toLowerCase()

  return JOB_MATCHES.map((job) => {
    let match = job.match
    if (unlocked) {
      match = Math.min(99, job.match + boost)
      if (roleHint && job.title.toLowerCase().includes(roleHint.split(' ')[0] ?? '')) {
        match = Math.min(99, match + 3)
      }
      if (profile?.skills.some((s) => job.title.toLowerCase().includes(s.toLowerCase().slice(0, 4)))) {
        match = Math.min(99, match + 2)
      }
    } else {
      match = Math.max(40, job.match - 18)
    }
    return {
      ...job,
      match,
      locked: !unlocked,
    }
  }).sort((a, b) => b.match - a.match)
}

export function saveInterviewResult(result: InterviewResult) {
  const user = getUser()
  const key = user ? `${RESULT_KEY}.${user.email}` : RESULT_KEY
  localStorage.setItem(key, JSON.stringify(result))
}

export function getInterviewResult(): InterviewResult | null {
  const user = getUser()
  const raw =
    (user && localStorage.getItem(`${RESULT_KEY}.${user.email}`)) ||
    localStorage.getItem(RESULT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as InterviewResult
  } catch {
    return null
  }
}

function appsKey() {
  const user = getUser()
  return user ? `${APPS_KEY}.${user.email}` : APPS_KEY
}

export function getApplications(): Application[] {
  try {
    const raw = localStorage.getItem(appsKey())
    return raw ? (JSON.parse(raw) as Application[]) : []
  } catch {
    return []
  }
}

export function applyToJob(job: {
  title: string
  company: string
  location: string
  match: number
}): Application {
  if (!canApplyToJobs()) {
    throw new Error(
      `Complete an AI interview scoring at least ${MIN_APPLY_SCORE} to apply.`,
    )
  }
  const apps = getApplications()
  if (apps.some((a) => a.title === job.title && a.company === job.company)) {
    return apps.find((a) => a.title === job.title)!
  }
  const app: Application = {
    id: uid(),
    ...job,
    status: 'Applied',
    appliedAt: new Date().toISOString(),
  }
  apps.unshift(app)
  localStorage.setItem(appsKey(), JSON.stringify(apps))
  return app
}

export function applicationStats() {
  const apps = getApplications()
  return {
    applied: apps.length,
    inReview: apps.filter((a) => a.status === 'In Review').length || Math.min(apps.length, Math.floor(apps.length * 0.4)),
    interviews: apps.filter((a) => a.status === 'Interview').length || (getInterviewResult() ? 1 : 0),
    offers: apps.filter((a) => a.status === 'Offer').length,
  }
}

export function firstName(): string {
  const user = getUser()
  if (!user) return 'there'
  return user.name.split(' ')[0]
}

export const JOB_MATCHES = [
  {
    title: 'Senior Frontend Developer',
    company: 'TechCitta Solutions',
    location: 'Hyderabad, India',
    match: 98,
  },
  {
    title: 'Full Stack Engineer',
    company: 'InnovatTech',
    location: 'Bengaluru, India',
    match: 95,
  },
  {
    title: 'Software Engineer (AI/ML)',
    company: 'MindCraft AI',
    location: 'Hyderabad, India',
    match: 92,
  },
  {
    title: 'Backend Engineer',
    company: 'CloudNest',
    location: 'Pune, India',
    match: 89,
  },
  {
    title: 'Product Analyst',
    company: 'Pulse Labs',
    location: 'Remote',
    match: 86,
  },
]
