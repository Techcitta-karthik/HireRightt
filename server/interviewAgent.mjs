/**
 * HIRERIGHT Interview Agent
 * Generates resume-accurate questions and scores answers.
 * Uses OpenAI when OPENAI_API_KEY / LLM_API_KEY is set; otherwise a strong local agent.
 */

const CATEGORIES = ['Communication', 'Technical', 'Problem Solving', 'Experience']

/**
 * @typedef {{ text: string, category: string, keywords: string[], hint: string, focus?: string }} Question
 * @typedef {{
 *   name?: string,
 *   currentRole?: string,
 *   totalExperience?: string,
 *   skills?: string[],
 *   whoAreYou?: string,
 *   whatDrivesYou?: string,
 *   keyStrengths?: string,
 *   experienceSummary?: string,
 *   workExperiences?: { jobTitle?: string, company?: string, description?: string }[],
 *   achievements?: string[],
 *   certifications?: { name?: string }[],
 *   resumeText?: string,
 *   resumeName?: string | null,
 * }} ProfileContext
 */

function clean(s) {
  return String(s || '').trim()
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))]
}

/** @param {ProfileContext} profile */
export function summarizeProfile(profile = {}) {
  const skills = unique((profile.skills || []).map((s) => clean(s))).slice(0, 16)
  const jobs = (profile.workExperiences || [])
    .filter((w) => w?.jobTitle || w?.company)
    .slice(0, 4)
    .map((w) => `${clean(w.jobTitle) || 'Role'} @ ${clean(w.company) || 'Company'}${w.description ? `: ${clean(w.description).slice(0, 180)}` : ''}`)
  const achievements = (profile.achievements || []).map(clean).filter(Boolean).slice(0, 5)
  const certs = (profile.certifications || []).map((c) => clean(c?.name)).filter(Boolean).slice(0, 5)
  const resumeSnippet = clean(profile.resumeText).slice(0, 3500)

  return {
    name: clean(profile.name) || 'Candidate',
    role: clean(profile.currentRole) || 'Software professional',
    experience: clean(profile.totalExperience) || 'Not specified',
    skills,
    whoAreYou: clean(profile.whoAreYou).slice(0, 600),
    whatDrivesYou: clean(profile.whatDrivesYou).slice(0, 400),
    keyStrengths: clean(profile.keyStrengths).slice(0, 400),
    experienceSummary: clean(profile.experienceSummary).slice(0, 800),
    jobs,
    achievements,
    certs,
    resumeSnippet,
    resumeName: profile.resumeName || null,
  }
}

/** Local resume-aware question bank (no API key required). */
/** @param {ReturnType<typeof summarizeProfile>} ctx */
/** @param {string} role */
/** @param {string} level */
export function generateLocalQuestions(ctx, role, level) {
  /** @type {Question[]} */
  const questions = []
  const skillA = ctx.skills[0]
  const skillB = ctx.skills[1] || ctx.skills[0]
  const skillC = ctx.skills[2]
  const job = ctx.jobs[0]
  const achievement = ctx.achievements[0]

  questions.push({
    text: ctx.whoAreYou
      ? `${ctx.name}, your profile says you are focused on “${ctx.role}”. Walk me through your background in 90 seconds — what should a hiring manager remember about you?`
      : `Tell me about yourself as a ${role} with ${level} experience. What should we remember about you?`,
    category: 'Communication',
    keywords: unique([
      'experience',
      'project',
      'skill',
      'built',
      'team',
      ...ctx.skills.slice(0, 4).map((s) => s.toLowerCase()),
      ctx.role.toLowerCase(),
    ]),
    hint: 'Background → strongest skills → one concrete win.',
    focus: 'intro',
  })

  if (skillA) {
    questions.push({
      text: `Your resume/profile lists ${skillA}${skillB && skillB !== skillA ? ` and ${skillB}` : ''}. Describe a real project where you used ${skillA}: what you built, your role, and the measurable outcome.`,
      category: 'Technical',
      keywords: unique([
        skillA.toLowerCase(),
        ...(skillB ? [skillB.toLowerCase()] : []),
        'project',
        'built',
        'result',
        'impact',
        'challenge',
      ]),
      hint: 'Name the skill, the project, actions, and a metric.',
      focus: 'skill-depth',
    })
  } else {
    questions.push({
      text: `As a ${role}, what technical skill are you strongest in, and how have you applied it in production?`,
      category: 'Technical',
      keywords: ['skill', 'production', 'built', 'project', 'result', role.toLowerCase()],
      hint: 'Pick one skill and give a production example.',
      focus: 'skill-depth',
    })
  }

  if (job) {
    questions.push({
      text: `On your profile I see ${job.split(':')[0]}. What was the hardest problem you owned there, and how did you solve it?`,
      category: 'Problem Solving',
      keywords: unique([
        'problem',
        'solution',
        'approach',
        'result',
        'owned',
        'impact',
        ...job.toLowerCase().split(/\W+/).filter((w) => w.length > 3).slice(0, 6),
      ]),
      hint: 'STAR: situation → task → action → result.',
      focus: 'experience',
    })
  } else if (ctx.experienceSummary) {
    questions.push({
      text: `Based on your experience summary, describe a challenge you faced and how you solved it end-to-end.`,
      category: 'Problem Solving',
      keywords: ['problem', 'solution', 'approach', 'result', 'challenge', 'because'],
      hint: 'Be specific about actions and outcomes.',
      focus: 'experience',
    })
  } else {
    questions.push({
      text: 'Describe a challenging technical or product problem you faced and how you solved it.',
      category: 'Problem Solving',
      keywords: ['problem', 'solution', 'approach', 'result', 'debug', 'impact'],
      hint: 'Use STAR and include a measurable result.',
      focus: 'experience',
    })
  }

  if (achievement) {
    questions.push({
      text: `You mentioned this achievement: “${achievement.slice(0, 160)}”. How did you personally drive that result, and what would you do differently next time?`,
      category: 'Experience',
      keywords: unique([
        'result',
        'impact',
        'led',
        'improved',
        'metric',
        ...achievement.toLowerCase().split(/\W+/).filter((w) => w.length > 3).slice(0, 5),
      ]),
      hint: 'Your contribution vs the team, plus a lesson learned.',
      focus: 'achievement',
    })
  } else if (skillC) {
    questions.push({
      text: `How would you compare your depth in ${skillA || role} versus ${skillC}? Give an example that proves the difference.`,
      category: 'Experience',
      keywords: unique([
        (skillA || role).toLowerCase(),
        skillC.toLowerCase(),
        'example',
        'depth',
        'project',
      ]),
      hint: 'Contrast two skills with concrete proof.',
      focus: 'achievement',
    })
  } else {
    questions.push({
      text: 'Tell me about a time you delivered under a tight deadline. What did you prioritize and what shipped?',
      category: 'Experience',
      keywords: ['deadline', 'priority', 'deliver', 'team', 'shipped', 'plan'],
      hint: 'Priorities, trade-offs, and the outcome.',
      focus: 'achievement',
    })
  }

  questions.push({
    text: skillA
      ? `For a ${role} role at your level (${level}), how would you ramp up in the first 90 days using strengths like ${skillA}? What would you learn next?`
      : `Where do you want to grow as a ${role} over the next two years, and how does that connect to this interview track?`,
    category: 'Communication',
    keywords: unique([
      'grow',
      'learn',
      'goal',
      'plan',
      'contribute',
      ...(skillA ? [skillA.toLowerCase()] : []),
    ]),
    hint: 'Tie growth to real skills and business impact.',
    focus: 'growth',
  })

  return questions.slice(0, 5)
}

/**
 * Optional OpenAI / OpenAI-compatible LLM generation.
 * @param {ReturnType<typeof summarizeProfile>} ctx
 * @param {string} role
 * @param {string} level
 * @returns {Promise<Question[] | null>}
 */
export async function generateLlmQuestions(ctx, role, level) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY
  if (!apiKey) return null

  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const model = process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'gpt-4o-mini'

  const system = `You are Ava, HIRERIGHT's expert AI interviewer. Create exactly 5 interview questions tailored to THIS candidate's resume/profile. Questions must reference real skills, jobs, or achievements when available. Return ONLY valid JSON: {"questions":[{"text":"...","category":"Communication|Technical|Problem Solving|Experience","keywords":["..."],"hint":"..."}]}`

  const user = JSON.stringify({
    interviewRole: role,
    level,
    candidate: ctx,
    rules: [
      'Do not invent employers or skills not present in the profile.',
      'At least 2 questions must explicitly reference listed skills or jobs.',
      'Keep each question under 280 characters.',
      'Categories must be one of the allowed values.',
    ],
  })

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    })
    if (!res.ok) {
      console.warn('[interview-agent] LLM questions failed:', res.status, await res.text())
      return null
    }
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) return null
    const parsed = JSON.parse(content)
    const list = Array.isArray(parsed.questions) ? parsed.questions : []
    const normalized = list
      .map((q) => ({
        text: clean(q.text),
        category: CATEGORIES.includes(q.category) ? q.category : 'Technical',
        keywords: unique((q.keywords || []).map((k) => clean(k).toLowerCase())).slice(0, 12),
        hint: clean(q.hint) || 'Be specific and use a real example.',
        focus: 'llm',
      }))
      .filter((q) => q.text.length > 20)
    return normalized.length >= 3 ? normalized.slice(0, 5) : null
  } catch (err) {
    console.warn('[interview-agent] LLM error:', err)
    return null
  }
}

/**
 * @param {ProfileContext} profile
 * @param {string} role
 * @param {string} level
 */
export async function buildInterviewQuestions(profile, role, level) {
  const ctx = summarizeProfile(profile)
  const llm = await generateLlmQuestions(ctx, role, level)
  if (llm) {
    return { questions: llm, agent: 'llm', context: ctx }
  }
  return { questions: generateLocalQuestions(ctx, role, level), agent: 'hireright-agent', context: ctx }
}

const STRUCTURE_SIGNALS = [
  'for example',
  'first',
  'then',
  'finally',
  'as a result',
  'because',
  'situation',
  'task',
  'action',
  'result',
  'so i',
  'which led',
  'in the end',
]

/**
 * @param {Question} question
 * @param {string} answer
 * @param {ReturnType<typeof summarizeProfile>} ctx
 */
function analyzeAnswer(question, answer, ctx) {
  const text = clean(answer)
  const lower = text.toLowerCase()
  const words = text.split(/\s+/).filter(Boolean)
  const wordCount = words.length

  let lengthScore = 0
  if (wordCount >= 10) lengthScore = 8
  if (wordCount >= 30) lengthScore = 16
  if (wordCount >= 60) lengthScore = 28
  if (wordCount > 280) lengthScore = 22

  const keywordsHit = (question.keywords || []).filter((k) => lower.includes(String(k).toLowerCase()))
  const keywordScore = Math.min(
    30,
    Math.round((keywordsHit.length / Math.min(Math.max(question.keywords.length, 1), 5)) * 30),
  )

  const structureHits = STRUCTURE_SIGNALS.filter((s) => lower.includes(s)).length
  const structureScore = Math.min(12, structureHits * 4)

  const hasNumbers = /\d/.test(text)
  const specificityScore =
    (hasNumbers ? 5 : 0) +
    (/\b(react|node|python|sql|aws|docker|typescript|java|kafka|figma|excel)\b/i.test(text) ? 5 : 0)

  // Resume fidelity — did they evidence claimed skills/employers?
  const skillsHit = ctx.skills.filter((s) => s.length >= 2 && lower.includes(s.toLowerCase()))
  const companyTokens = ctx.jobs
    .flatMap((j) => j.split(/[@:]/).map((p) => p.trim().toLowerCase()))
    .filter((t) => t.length >= 3 && !['role', 'company', 'at'].includes(t))
  const companiesHit = companyTokens.filter((t) => lower.includes(t))
  const resumeFit = Math.min(20, skillsHit.length * 3 + companiesHit.length * 4 + (ctx.resumeSnippet && wordCount > 40 ? 2 : 0))

  const score = Math.min(100, lengthScore + keywordScore + structureScore + specificityScore + resumeFit)

  let feedback
  if (wordCount < 12) {
    feedback = 'Too brief for a hiring interview. Aim for 60–150 words with a concrete example.'
  } else if (skillsHit.length === 0 && ctx.skills.length > 0) {
    feedback = `Connect the answer to skills on your resume (e.g. ${ctx.skills.slice(0, 3).join(', ')}).`
  } else if (structureHits === 0) {
    feedback = 'Good content — structure it as situation → action → result for clarity.'
  } else if (score >= 78) {
    feedback =
      skillsHit.length > 0
        ? `Strong, resume-aligned answer (referenced: ${skillsHit.slice(0, 2).join(', ')}).`
        : 'Strong answer — specific, structured, and relevant.'
  } else {
    feedback = 'Solid base. Add a measurable outcome and name tools from your profile.'
  }

  return {
    question: question.text,
    answer: text,
    score,
    wordCount,
    keywordsHit: unique([...keywordsHit, ...skillsHit]),
    feedback,
    resumeSkillsHit: skillsHit,
  }
}

/**
 * Optional LLM scoring pass (refines overall feedback).
 * @param {object} payload
 */
async function refineWithLlm(payload) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY
  if (!apiKey) return null
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const model = process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'gpt-4o-mini'

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are Ava scoring a video interview for resume accuracy and communication. Return JSON: {"overallAdjust":-5to5,"strengths":["..."],"improvements":["..."],"resumeFitSummary":"..."}',
          },
          { role: 'user', content: JSON.stringify(payload) },
        ],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return JSON.parse(data.choices?.[0]?.message?.content || 'null')
  } catch {
    return null
  }
}

/**
 * @param {{
 *   role: string,
 *   level: string,
 *   questions: Question[],
 *   answers: string[],
 *   profile: ProfileContext,
 *   integrity?: { faceViolations?: number, singlePersonOk?: boolean, maxFacesSeen?: number }
 * }} input
 */
export async function scoreInterviewSession(input) {
  const ctx = summarizeProfile(input.profile)
  const analyses = input.questions.map((q, i) => analyzeAnswer(q, input.answers[i] || '', ctx))

  const byCategory = new Map()
  input.questions.forEach((q, i) => {
    const list = byCategory.get(q.category) || []
    list.push(analyses[i].score)
    byCategory.set(q.category, list)
  })

  const categories = CATEGORIES.map((label) => {
    const scores = byCategory.get(label)
    const score =
      scores && scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : Math.round(analyses.reduce((a, b) => a + b.score, 0) / Math.max(analyses.length, 1))
    return { label, score }
  })

  let overall = Math.round(analyses.reduce((a, b) => a + b.score, 0) / Math.max(analyses.length, 1))

  const joined = (input.answers || []).join(' ').toLowerCase()
  const skillsReferenced = ctx.skills.filter((s) => joined.includes(s.toLowerCase())).length
  let resumeFitScore = Math.min(
    100,
    Math.round(
      (skillsReferenced / Math.max(Math.min(ctx.skills.length, 5), 1)) * 70 +
        (analyses.reduce((a, b) => a + (b.resumeSkillsHit?.length || 0), 0) > 0 ? 20 : 0) +
        (ctx.jobs.some((j) => joined.includes(j.split('@')[0]?.toLowerCase?.() || '___never')) ? 10 : 0),
    ),
  )

  if (ctx.skills.length >= 3 && skillsReferenced >= 2) overall = Math.min(100, overall + 4)
  if (ctx.skills.length >= 3 && skillsReferenced === 0) overall = Math.max(0, overall - 5)

  const integrity = input.integrity || {}
  if (integrity.singlePersonOk === false) overall = Math.max(0, overall - 8)
  if ((integrity.faceViolations || 0) > 3) overall = Math.max(0, overall - 5)

  const strengths = []
  const improvements = []
  const avgWords = analyses.reduce((a, b) => a + b.wordCount, 0) / Math.max(analyses.length, 1)
  if (avgWords >= 50) strengths.push('Answers are detailed enough for a live hiring screen.')
  else improvements.push('Expand answers to roughly 60–150 words with concrete examples.')

  if (skillsReferenced >= 2) {
    strengths.push(
      `Resume alignment: you evidenced ${ctx.skills
        .filter((s) => joined.includes(s.toLowerCase()))
        .slice(0, 3)
        .join(', ')}.`,
    )
  } else if (ctx.skills.length) {
    improvements.push(`Reference skills from your resume (${ctx.skills.slice(0, 3).join(', ')}).`)
  }

  const best = [...categories].sort((a, b) => b.score - a.score)[0]
  const worst = [...categories].sort((a, b) => a.score - b.score)[0]
  if (best?.score >= 60) strengths.push(`${best.label} stands out (${best.score}/100).`)
  if (worst?.score < 60) improvements.push(`${worst.label} needs more practice (${worst.score}/100).`)

  if (integrity.singlePersonOk === false) {
    improvements.push('Keep exactly one person in frame — multi-person presence reduced integrity score.')
  }

  const llmRefine = await refineWithLlm({
    role: input.role,
    level: input.level,
    overall,
    resumeFitScore,
    categories,
    answers: analyses.map((a) => ({ question: a.question, score: a.score, feedback: a.feedback })),
    skills: ctx.skills,
  })

  if (llmRefine) {
    if (typeof llmRefine.overallAdjust === 'number') {
      overall = Math.max(0, Math.min(100, overall + Math.max(-5, Math.min(5, llmRefine.overallAdjust))))
    }
    if (Array.isArray(llmRefine.strengths)) strengths.push(...llmRefine.strengths.slice(0, 2))
    if (Array.isArray(llmRefine.improvements)) improvements.push(...llmRefine.improvements.slice(0, 2))
  }

  return {
    role: input.role,
    level: input.level,
    date: new Date().toISOString(),
    overall,
    resumeFitScore,
    categories,
    strengths: unique(strengths).slice(0, 6),
    improvements: unique(improvements).slice(0, 6),
    answers: analyses.map(({ resumeSkillsHit, ...rest }) => rest),
    integrity: {
      faceViolations: integrity.faceViolations || 0,
      singlePersonOk: integrity.singlePersonOk !== false,
      maxFacesSeen: integrity.maxFacesSeen || 1,
    },
    agent: process.env.OPENAI_API_KEY || process.env.LLM_API_KEY ? 'llm+hireright-agent' : 'hireright-agent',
  }
}

export function llmConfigured() {
  return Boolean(process.env.OPENAI_API_KEY || process.env.LLM_API_KEY)
}
