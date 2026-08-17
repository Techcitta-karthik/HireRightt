import mammoth from 'mammoth'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import {
  LOCATION_OPTIONS,
  ROLE_OPTIONS,
  SKILL_OPTIONS,
  type ProfileFormData,
  type WorkExperience,
} from '../data/wizard'

GlobalWorkerOptions.workerSrc = pdfWorker

export type ResumeExtract = Partial<
  Pick<
    ProfileFormData,
    | 'whoAreYou'
    | 'whatDrivesYou'
    | 'keyStrengths'
    | 'currentRole'
    | 'totalExperience'
    | 'currentLocation'
    | 'skills'
    | 'experienceSummary'
    | 'workExperiences'
    | 'achievements'
  >
> & {
  fullName?: string
  /** Full extracted text used by Ava for resume-accurate questions. */
  resumeText?: string
}

async function extractPdfText(file: File): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await getDocument({ data }).promise
  const chunks: string[] = []
  for (let page = 1; page <= pdf.numPages; page += 1) {
    const content = await (await pdf.getPage(page)).getTextContent()
    const line = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    chunks.push(line)
  }
  return chunks.join('\n')
}

async function extractDocxText(file: File): Promise<string> {
  const result = await mammoth.extractRawText({
    arrayBuffer: await file.arrayBuffer(),
  })
  return result.value
}

export async function extractResumeText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (file.type === 'application/pdf' || ext === 'pdf') {
    return extractPdfText(file)
  }
  if (
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    return extractDocxText(file)
  }
  if (file.type === 'application/msword' || ext === 'doc') {
    throw new Error(
      'Legacy .doc files can’t be parsed here. Please upload a PDF or DOCX.',
    )
  }
  throw new Error('Unsupported file type for extraction.')
}

function cleanLines(text: string): string[] {
  return text
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function sectionBody(text: string, labels: string[]): string {
  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:${labels.join('|')})\\s*[:\\-]?\\s*\\n?([\\s\\S]*?)(?=\\n\\s*(?:${[
      'experience',
      'work experience',
      'employment',
      'education',
      'skills',
      'projects',
      'certifications?',
      'achievements?',
      'awards?',
      'summary',
      'profile',
      'objective',
      'contact',
    ].join('|')})\\b|$)`,
    'i',
  )
  const match = text.match(pattern)
  return match?.[1]?.trim() ?? ''
}

function clip(value: string, max: number) {
  const trimmed = value.replace(/\s+/g, ' ').trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1).trimEnd()}…`
}

function pickRole(text: string): string {
  const lower = text.toLowerCase()
  const ranked = [...ROLE_OPTIONS].sort((a, b) => b.length - a.length)
  for (const role of ranked) {
    if (lower.includes(role.toLowerCase())) return role
  }
  const titleMatch = text.match(
    /\b((?:senior|junior|lead|principal|staff)?\s?(?:software|frontend|backend|full[\s-]?stack|product|data|devops|ui\/?ux)?\s?(?:engineer|developer|manager|designer|scientist|analyst))\b/i,
  )
  if (titleMatch) {
    const candidate = titleMatch[1].replace(/\s+/g, ' ').trim()
    const close = ROLE_OPTIONS.find(
      (role) => role.toLowerCase() === candidate.toLowerCase(),
    )
    return close ?? candidate
  }
  return ''
}

function pickLocation(text: string): string {
  for (const location of LOCATION_OPTIONS) {
    if (new RegExp(`\\b${location.replace(/\s+/g, '\\s+')}\\b`, 'i').test(text)) {
      return location
    }
  }
  if (/\bremote\b/i.test(text)) return 'Remote'
  return ''
}

function pickExperience(text: string): string {
  const range = text.match(
    /(\d+(?:\.\d+)?)\s*(?:\+|to|–|-)\s*(\d+(?:\.\d+)?)\s*\+?\s*years?/i,
  )
  const single = text.match(/(\d+(?:\.\d+)?)\s*\+?\s*years?(?:\s+of\s+experience)?/i)
  const years = range
    ? (Number(range[1]) + Number(range[2])) / 2
    : single
      ? Number(single[1])
      : NaN

  if (Number.isNaN(years)) return ''
  if (years < 1) return 'Fresher / 0 years'
  if (years < 2) return '0 – 1 Years'
  if (years < 3) return '1 – 2 Years'
  if (years < 4) return '2 – 3 Years'
  if (years < 6) return '3 – 5 Years'
  if (years < 9) return '5 – 8 Years'
  if (years < 13) return '8 – 12 Years'
  return '12+ Years'
}

function pickSkills(text: string): string[] {
  const lower = text.toLowerCase()
  const found = SKILL_OPTIONS.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${escaped.replace(/\s+/g, '\\s+')}\\b`, 'i').test(lower)
  })
  return [...new Set(found)].slice(0, 12)
}

function pickName(lines: string[]): string {
  for (const line of lines.slice(0, 8)) {
    if (/@|http|www\.|linkedin|github|phone|mobile|\d{5,}/i.test(line)) continue
    if (/summary|objective|profile|experience|education|skills/i.test(line)) continue
    const words = line.split(/\s+/).filter(Boolean)
    if (words.length >= 2 && words.length <= 4 && words.every((w) => /^[A-Za-z.'-]+$/.test(w))) {
      return words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    }
  }
  return ''
}

function pickWorkExperiences(text: string): WorkExperience[] {
  const body =
    sectionBody(text, [
      'work experience',
      'professional experience',
      'employment history',
      'experience',
    ]) || text
  const blocks = body
    .split(/\n(?=[A-Z][^\n]{2,80})/)
    .map((block) => block.trim())
    .filter((block) => block.length > 40)
    .slice(0, 3)

  const experiences: WorkExperience[] = []
  for (const block of blocks) {
    const firstLine = block.split('\n')[0] ?? block
    const atMatch = firstLine.match(/^(.+?)\s+(?:at|@|-|–|,)\s+(.+)$/i)
    const role = (atMatch?.[1] ?? (pickRole(firstLine) || firstLine)).trim()
    const company = (atMatch?.[2] ?? '').replace(/\s+/g, ' ').trim()
    if (!role || role.length > 80) continue
    experiences.push({
      id: crypto.randomUUID(),
      jobTitle: clip(role, 80),
      company: clip(company || 'Company', 80),
      employmentType: 'Full-time',
      startDate: '',
      endDate: '',
      currentlyWorking: /present|current/i.test(block),
      location: pickLocation(block),
      responsibilities: clip(
        block
          .split('\n')
          .slice(1)
          .join('\n')
          .replace(/^[•\-*]\s*/gm, '• '),
        800,
      ),
    })
  }
  return experiences
}

function pickAchievements(text: string): string[] {
  const body = sectionBody(text, ['achievements?', 'accomplishments?', 'awards?'])
  if (!body) {
    return text
      .split('\n')
      .filter((line) => /^[•\-*]/.test(line) || /\d+%|increased|reduced|improved/i.test(line))
      .map((line) => clip(line.replace(/^[•\-*]\s*/, ''), 180))
      .filter(Boolean)
      .slice(0, 4)
  }
  return body
    .split('\n')
    .map((line) => clip(line.replace(/^[•\-*]\s*/, ''), 180))
    .filter((line) => line.length > 12)
    .slice(0, 4)
}

export function parseResumeText(raw: string): ResumeExtract {
  const text = raw.split('\0').join(' ')
  const lines = cleanLines(text)
  const joined = lines.join('\n')

  const fullName = pickName(lines)
  const currentRole = pickRole(joined)
  const currentLocation = pickLocation(joined)
  const skills = pickSkills(joined)

  const summary =
    sectionBody(joined, ['professional summary', 'summary', 'profile', 'about me']) ||
    lines.slice(1, 6).join(' ')

  const objective =
    sectionBody(joined, ['objective', 'career objective', 'career goal']) ||
    ''

  const strengthsBody =
    sectionBody(joined, ['strengths', 'core competencies', 'key skills']) ||
    skills.slice(0, 6).join(', ')

  const whoAreYou = clip(
    [
      fullName && currentRole
        ? `I'm ${fullName}, a ${currentRole}`
        : fullName
          ? `I'm ${fullName}`
          : currentRole
            ? `I'm a ${currentRole}`
            : '',
      summary && !summary.toLowerCase().startsWith("i'm")
        ? summary
        : summary,
    ]
      .filter(Boolean)
      .join('. ')
      .replace(/\.\./g, '.'),
    300,
  )

  const whatDrivesYou = clip(
    objective ||
      (skills.length
        ? `I'm driven by building high-quality products with ${skills.slice(0, 3).join(', ')}, and growing through meaningful impact.`
        : ''),
    300,
  )

  const keyStrengths = clip(strengthsBody || skills.join(', '), 250)
  const experienceSummary = clip(summary || whoAreYou, 500)
  const workExperiences = pickWorkExperiences(joined)
  const achievements = pickAchievements(joined)

  const extract: ResumeExtract = {}
  if (fullName) extract.fullName = fullName
  if (whoAreYou) extract.whoAreYou = whoAreYou
  if (whatDrivesYou) extract.whatDrivesYou = whatDrivesYou
  if (keyStrengths) extract.keyStrengths = keyStrengths
  if (currentRole && (ROLE_OPTIONS.includes(currentRole) || currentRole.length > 2)) {
    extract.currentRole = ROLE_OPTIONS.includes(currentRole)
      ? currentRole
      : ROLE_OPTIONS.find((r) =>
          currentRole.toLowerCase().includes(r.toLowerCase()),
        ) || currentRole
  }
  const experience = pickExperience(joined)
  if (experience) extract.totalExperience = experience
  if (currentLocation) extract.currentLocation = currentLocation
  if (skills.length) extract.skills = skills
  if (experienceSummary) extract.experienceSummary = experienceSummary
  if (workExperiences.length) extract.workExperiences = workExperiences
  if (achievements.length) extract.achievements = achievements
  extract.resumeText = clip(joined, 8000)

  return extract
}

export async function parseResumeFile(file: File): Promise<ResumeExtract> {
  const text = await extractResumeText(file)
  if (!text.trim()) {
    throw new Error('Could not read text from this file. Try another PDF or DOCX.')
  }
  const extract = parseResumeText(text)
  if (!extract.resumeText) extract.resumeText = text.slice(0, 8000)
  return extract
}
