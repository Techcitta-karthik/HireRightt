/** OpenATS-style recruiter data adapted for HireRight Admin. */

export type PipelineStage =
  | 'Applied'
  | 'Screening'
  | 'Shortlisted'
  | 'Technical'
  | 'HR'
  | 'Offer'
  | 'Hired'
  | 'Rejected'

export type AdminJob = {
  id: string
  title: string
  department: string
  location: string
  employmentType: string
  salaryRange: string
  minExperienceYears: number
  requiredSkills: string[]
  preferredSkills: string[]
  description: string
  status: 'Draft' | 'Active' | 'Paused' | 'Closed'
  createdAt: string
  applicantsCount: number
}

export type AdminCandidate = {
  id: string
  name: string
  email: string
  phone: string
  currentTitle: string
  location: string
  totalExperienceYears: number
  skills: string[]
  aiSummary: string
  tags: string[]
  stage: PipelineStage
  appliedJobId: string
  overallMatchScore: number
  interviewScore?: number
  createdAt: string
  source: string
}

export const PIPELINE_STAGES: PipelineStage[] = [
  'Applied',
  'Screening',
  'Shortlisted',
  'Technical',
  'HR',
  'Offer',
  'Hired',
  'Rejected',
]

export const ADMIN_JOBS: AdminJob[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Hyderabad / Hybrid',
    employmentType: 'Full-Time',
    salaryRange: '18–25 LPA',
    minExperienceYears: 4,
    requiredSkills: ['React', 'TypeScript', 'Next.js', 'CSS'],
    preferredSkills: ['Framer Motion', 'System Design'],
    description: 'Lead UI for HireRight candidate and interview experiences.',
    status: 'Active',
    createdAt: '2026-07-15',
    applicantsCount: 24,
  },
  {
    id: 'job-2',
    title: 'Full Stack Engineer',
    department: 'Platform',
    location: 'Bengaluru / Remote',
    employmentType: 'Full-Time',
    salaryRange: '16–22 LPA',
    minExperienceYears: 3,
    requiredSkills: ['Node.js', 'React', 'PostgreSQL', 'REST APIs'],
    preferredSkills: ['AWS', 'Docker'],
    description: 'Build matching APIs and profile services.',
    status: 'Active',
    createdAt: '2026-07-20',
    applicantsCount: 18,
  },
  {
    id: 'job-3',
    title: 'AI / ML Engineer',
    department: 'AI Research',
    location: 'Pune',
    employmentType: 'Full-Time',
    salaryRange: '20–28 LPA',
    minExperienceYears: 3,
    requiredSkills: ['Python', 'NLP', 'OpenAI API', 'Embeddings'],
    preferredSkills: ['LangChain', 'PyTorch'],
    description: 'Improve interview scoring and resume matching engines.',
    status: 'Active',
    createdAt: '2026-07-22',
    applicantsCount: 31,
  },
  {
    id: 'job-4',
    title: 'Product Designer (UX)',
    department: 'Design',
    location: 'Mumbai / Hybrid',
    employmentType: 'Full-Time',
    salaryRange: '14–20 LPA',
    minExperienceYears: 3,
    requiredSkills: ['Figma', 'UI Design', 'User Research'],
    preferredSkills: ['Motion', 'Design Systems'],
    description: 'Own interview studio and talent scorecard UX.',
    status: 'Paused',
    createdAt: '2026-07-10',
    applicantsCount: 12,
  },
]

export const ADMIN_CANDIDATES: AdminCandidate[] = [
  {
    id: 'cand-1',
    name: 'Alexandra Chen',
    email: 'alex.chen@example.com',
    phone: '+1 (555) 349-2041',
    currentTitle: 'Senior Frontend Architect',
    location: 'San Francisco, CA',
    totalExperienceYears: 8,
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'System Design'],
    aiSummary:
      'Staff-level frontend candidate. Strong React/Next.js depth and dashboard performance work.',
    tags: ['Top Tier', 'Fast Track'],
    stage: 'Shortlisted',
    appliedJobId: 'job-1',
    overallMatchScore: 96,
    interviewScore: 88,
    createdAt: '2026-07-25',
    source: 'AI Resume Matcher',
  },
  {
    id: 'cand-2',
    name: 'Marcus Vance',
    email: 'm.vance@example.com',
    phone: '+1 (555) 891-3320',
    currentTitle: 'Lead Backend Engineer',
    location: 'Seattle, WA',
    totalExperienceYears: 9,
    skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
    aiSummary: 'High-scale backend lead with queueing and Postgres expertise.',
    tags: ['Backend Expert'],
    stage: 'Technical',
    appliedJobId: 'job-2',
    overallMatchScore: 94,
    interviewScore: 82,
    createdAt: '2026-07-26',
    source: 'LinkedIn Recruiter',
  },
  {
    id: 'cand-3',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '+91 98765 43210',
    currentTitle: 'ML Engineer',
    location: 'Bengaluru, India',
    totalExperienceYears: 5,
    skills: ['Python', 'NLP', 'OpenAI API', 'LangChain', 'PyTorch'],
    aiSummary: 'Strong ML systems profile focused on embeddings and screening pipelines.',
    tags: ['AI Specialist'],
    stage: 'Screening',
    appliedJobId: 'job-3',
    overallMatchScore: 91,
    interviewScore: 79,
    createdAt: '2026-07-28',
    source: 'Direct Careers Portal',
  },
  {
    id: 'cand-4',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@example.com',
    phone: '+91 99887 66554',
    currentTitle: 'Full Stack Developer',
    location: 'Hyderabad, India',
    totalExperienceYears: 4,
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'REST APIs'],
    aiSummary: 'Solid full-stack generalist with shipping velocity and clear communication.',
    tags: ['Interview Ready'],
    stage: 'Applied',
    appliedJobId: 'job-2',
    overallMatchScore: 84,
    interviewScore: 74,
    createdAt: '2026-07-29',
    source: 'Employee Referrals',
  },
  {
    id: 'cand-5',
    name: 'Sofia Alvarez',
    email: 'sofia.a@example.com',
    phone: '+1 (555) 220-1188',
    currentTitle: 'Product Designer',
    location: 'Austin, TX',
    totalExperienceYears: 6,
    skills: ['Figma', 'UI Design', 'User Research', 'Design Systems'],
    aiSummary: 'Product designer with polished hiring-product and dashboard craft.',
    tags: ['Design'],
    stage: 'HR',
    appliedJobId: 'job-4',
    overallMatchScore: 89,
    interviewScore: 85,
    createdAt: '2026-07-27',
    source: 'LinkedIn Recruiter',
  },
  {
    id: 'cand-6',
    name: 'Dev Patel',
    email: 'dev.patel@example.com',
    phone: '+91 91234 56780',
    currentTitle: 'Software Engineer',
    location: 'Pune, India',
    totalExperienceYears: 3,
    skills: ['React', 'JavaScript', 'CSS', 'Git'],
    aiSummary: 'Early-career engineer with strong fundamentals; needs deeper system design.',
    tags: ['Junior'],
    stage: 'Rejected',
    appliedJobId: 'job-1',
    overallMatchScore: 61,
    interviewScore: 48,
    createdAt: '2026-07-21',
    source: 'Direct Careers Portal',
  },
  {
    id: 'cand-7',
    name: 'Hannah Brooks',
    email: 'h.brooks@example.com',
    phone: '+1 (555) 441-9090',
    currentTitle: 'Staff Frontend Engineer',
    location: 'New York, NY',
    totalExperienceYears: 10,
    skills: ['React', 'TypeScript', 'Next.js', 'System Design', 'WebSockets'],
    aiSummary: 'Top-tier staff FE candidate; excellent interview communication score.',
    tags: ['Top Tier', 'Offer Ready'],
    stage: 'Offer',
    appliedJobId: 'job-1',
    overallMatchScore: 98,
    interviewScore: 93,
    createdAt: '2026-07-24',
    source: 'AI Resume Matcher',
  },
  {
    id: 'cand-8',
    name: 'Arjun Sharma',
    email: 'arjun.s@example.com',
    phone: '+91 90000 11122',
    currentTitle: 'Backend Engineer',
    location: 'Chennai, India',
    totalExperienceYears: 5,
    skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    aiSummary: 'Reliable platform engineer; strong match for full-stack platform roles.',
    tags: ['Platform'],
    stage: 'Hired',
    appliedJobId: 'job-2',
    overallMatchScore: 90,
    interviewScore: 86,
    createdAt: '2026-07-18',
    source: 'Employee Referrals',
  },
]

export const MONTHLY_TRENDS = [
  { month: 'Jan', applications: 240, screened: 140, hired: 18 },
  { month: 'Feb', applications: 310, screened: 190, hired: 24 },
  { month: 'Mar', applications: 450, screened: 280, hired: 32 },
  { month: 'Apr', applications: 390, screened: 240, hired: 29 },
  { month: 'May', applications: 520, screened: 330, hired: 41 },
  { month: 'Jun', applications: 610, screened: 410, hired: 52 },
]

export const SOURCE_MIX = [
  { name: 'LinkedIn Recruiter', value: 42, color: '#0a66c2' },
  { name: 'AI Resume Matcher', value: 28, color: '#f0510e' },
  { name: 'Direct Careers Portal', value: 18, color: '#16a34a' },
  { name: 'Employee Referrals', value: 12, color: '#d97706' },
]

export const SKILL_DEMAND = [
  { skill: 'React / Next.js', candidates: 142, demand: 85 },
  { skill: 'Node.js', candidates: 118, demand: 90 },
  { skill: 'TypeScript', candidates: 160, demand: 100 },
  { skill: 'Python / AI', candidates: 84, demand: 95 },
  { skill: 'PostgreSQL', candidates: 95, demand: 78 },
]

const STORAGE_KEY = 'hireright.admin.candidates'

export function loadAdminCandidates(): AdminCandidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AdminCandidate[]
  } catch {
    // fall through
  }
  return ADMIN_CANDIDATES.map((c) => ({ ...c }))
}

export function saveAdminCandidates(candidates: AdminCandidate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates))
}

export function funnelFromCandidates(candidates: AdminCandidate[]) {
  return PIPELINE_STAGES.map((stage) => ({
    stage,
    count: candidates.filter((c) => c.stage === stage).length,
  }))
}

export function adminKpis(candidates: AdminCandidate[], jobs: AdminJob[]) {
  const activeJobs = jobs.filter((j) => j.status === 'Active').length
  const topMatches = candidates.filter((c) => c.overallMatchScore >= 90).length
  const hired = candidates.filter((c) => c.stage === 'Hired').length
  const interviews = candidates.filter((c) =>
    ['Technical', 'HR', 'Offer', 'Shortlisted'].includes(c.stage),
  ).length
  const avgInterview =
    candidates.reduce((sum, c) => sum + (c.interviewScore ?? 0), 0) /
    Math.max(1, candidates.filter((c) => c.interviewScore).length)

  return {
    totalTalent: candidates.length,
    activeJobs,
    topMatches,
    interviewsScheduled: interviews,
    hired,
    avgInterviewScore: Math.round(avgInterview || 0),
    avgTimeToHireDays: 14.2,
    aiAccuracy: 96.8,
    totalApplications: MONTHLY_TRENDS.reduce((s, m) => s + m.applications, 0),
  }
}
