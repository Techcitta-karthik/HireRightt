import type { ProfileFormData } from '../data/wizard'

export type User = {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

/** Profile without File objects — safe for localStorage. */
export type SavedProfile = Omit<ProfileFormData, 'resumeFile'> & {
  resumeName: string | null
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
        const user = JSON.parse(legacy) as User
        if (!user.id) user.id = uid()
        writeUsers([user])
        localStorage.removeItem('hireright.user')
        return [user]
      }
      return []
    }
    return JSON.parse(raw) as User[]
  } catch {
    return []
  }
}

function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function saveUser(input: Omit<User, 'id' | 'createdAt'> & { createdAt?: string }): User {
  const users = readUsers()
  const email = input.email.trim().toLowerCase()
  if (users.some((u) => u.email === email)) {
    throw new Error('An account with this email already exists.')
  }
  const user: User = {
    id: uid(),
    name: input.name.trim(),
    email,
    password: input.password,
    createdAt: input.createdAt ?? new Date().toISOString(),
  }
  users.push(user)
  writeUsers(users)
  localStorage.setItem(SESSION_KEY, user.email)
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

export function login(email: string, password: string): User | null {
  const user = readUsers().find(
    (u) => u.email === email.trim().toLowerCase() && u.password === password,
  )
  if (!user) return null
  localStorage.setItem(SESSION_KEY, user.email)
  return user
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
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
  if (!profile) return 12
  let score = 8
  if (profile.resumeName) score += 10
  if (profile.whoAreYou.length > 40) score += 8
  if (profile.whatDrivesYou.length > 20) score += 6
  if (profile.keyStrengths.length > 10) score += 6
  if (profile.currentRole) score += 6
  if (profile.totalExperience) score += 5
  if (profile.currentLocation) score += 4
  if (profile.skills.length >= 3) score += 10
  if (profile.skills.length >= 8) score += 4
  if (profile.workExperiences.some((w) => w.jobTitle && w.company)) score += 10
  if (profile.achievements.filter(Boolean).length > 0) score += 6
  if (profile.metrics.some((m) => m.metric)) score += 6
  if (profile.certifications.some((c) => c.name)) score += 5
  if (profile.selfRating > 0) score += 4
  if (profile.preferredRoles.length > 0) score += 4
  if (getInterviewResult()) score += 8
  return Math.min(100, score)
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
