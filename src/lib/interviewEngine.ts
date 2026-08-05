import type { AnswerAnalysis, InterviewResult } from './store'

export type Question = {
  text: string
  category: 'Communication' | 'Technical' | 'Problem Solving' | 'Experience'
  keywords: string[]
  hint: string
}

export const ROLES = [
  'Frontend Developer',
  'Full Stack Engineer',
  'Backend Developer',
  'Data Analyst',
  'AI / ML Engineer',
  'Product Manager',
] as const

export const LEVELS = ['Fresher', '1–3 years', '3–6 years', '6+ years'] as const

const COMMON_QUESTIONS: Question[] = [
  {
    text: 'Tell me about yourself and what drew you to this field.',
    category: 'Communication',
    keywords: ['experience', 'project', 'learn', 'passion', 'skill', 'built', 'team', 'year'],
    hint: 'Structure: background → key skills → why this role.',
  },
  {
    text: 'Describe a challenging problem you faced and how you solved it.',
    category: 'Problem Solving',
    keywords: ['problem', 'solution', 'approach', 'result', 'debug', 'fixed', 'improved', 'because', 'impact'],
    hint: 'Use the STAR method: Situation, Task, Action, Result.',
  },
  {
    text: 'Tell me about a time you worked in a team under a tight deadline.',
    category: 'Experience',
    keywords: ['team', 'deadline', 'priority', 'communicate', 'deliver', 'plan', 'collaborate', 'together'],
    hint: 'Mention your specific role and the outcome.',
  },
  {
    text: 'Where do you see yourself growing in the next two years?',
    category: 'Communication',
    keywords: ['grow', 'learn', 'goal', 'skill', 'lead', 'improve', 'contribute', 'plan'],
    hint: 'Tie your goals to real skills you want to build.',
  },
]

const ROLE_QUESTIONS: Record<string, Question> = {
  'Frontend Developer': {
    text: 'How do you make a web page fast and responsive across devices?',
    category: 'Technical',
    keywords: ['performance', 'responsive', 'lazy', 'bundle', 'cache', 'media', 'css', 'render', 'optimize', 'image'],
    hint: 'Think loading performance, rendering, and responsive layout.',
  },
  'Full Stack Engineer': {
    text: 'Walk me through how you would design an API and its database for a job-matching app.',
    category: 'Technical',
    keywords: ['api', 'database', 'schema', 'endpoint', 'auth', 'index', 'query', 'rest', 'model', 'scale'],
    hint: 'Cover endpoints, data models, and how they connect.',
  },
  'Backend Developer': {
    text: 'How would you scale a service that suddenly gets 10x more traffic?',
    category: 'Technical',
    keywords: ['scale', 'cache', 'load', 'balancer', 'queue', 'database', 'horizontal', 'monitor', 'bottleneck'],
    hint: 'Mention caching, load balancing, and finding bottlenecks.',
  },
  'Data Analyst': {
    text: 'How do you approach cleaning and analyzing a messy dataset?',
    category: 'Technical',
    keywords: ['clean', 'missing', 'outlier', 'sql', 'python', 'visualize', 'trend', 'insight', 'duplicate'],
    hint: 'Describe your process step by step, from raw data to insight.',
  },
  'AI / ML Engineer': {
    text: 'Explain how you would build and evaluate a model that predicts candidate–job fit.',
    category: 'Technical',
    keywords: ['model', 'feature', 'train', 'evaluate', 'accuracy', 'data', 'overfit', 'metric', 'label', 'test'],
    hint: 'Cover features, training, and evaluation metrics.',
  },
  'Product Manager': {
    text: 'How would you decide what feature to build next for a hiring platform?',
    category: 'Problem Solving',
    keywords: ['user', 'data', 'priority', 'impact', 'metric', 'research', 'feedback', 'roadmap', 'value'],
    hint: 'Show how you balance user needs, data, and business impact.',
  },
}

export function buildQuestionSet(role: string): Question[] {
  const roleQ = ROLE_QUESTIONS[role] ?? ROLE_QUESTIONS['Full Stack Engineer']
  return [COMMON_QUESTIONS[0], roleQ, COMMON_QUESTIONS[1], COMMON_QUESTIONS[2], COMMON_QUESTIONS[3]]
}

const STRUCTURE_SIGNALS = [
  'for example', 'first', 'then', 'finally', 'as a result', 'because',
  'situation', 'task', 'action', 'result', 'so i', 'which led', 'in the end',
]

function analyzeAnswer(question: Question, answer: string): AnswerAnalysis {
  const text = answer.trim()
  const lower = text.toLowerCase()
  const words = text.split(/\s+/).filter(Boolean)
  const wordCount = words.length

  // Length: 0–35 pts. Ideal is 60–200 words.
  let lengthScore = 0
  if (wordCount >= 10) lengthScore = 10
  if (wordCount >= 30) lengthScore = 20
  if (wordCount >= 60) lengthScore = 35
  if (wordCount > 260) lengthScore = 28

  // Keyword coverage: 0–40 pts.
  const keywordsHit = question.keywords.filter((k) => lower.includes(k))
  const keywordScore = Math.min(40, Math.round((keywordsHit.length / Math.min(question.keywords.length, 5)) * 40))

  // Structure signals: 0–15 pts.
  const structureHits = STRUCTURE_SIGNALS.filter((s) => lower.includes(s)).length
  const structureScore = Math.min(15, structureHits * 5)

  // Specificity (numbers, named tools): 0–10 pts.
  const hasNumbers = /\d/.test(text)
  const specificityScore = (hasNumbers ? 5 : 0) + (wordCount > 0 && /[A-Z][a-z]+[A-Z]|\b(react|node|python|sql|aws|figma|excel)\b/i.test(text) ? 5 : 0)

  const score = Math.min(100, lengthScore + keywordScore + structureScore + specificityScore)

  let feedback: string
  if (wordCount < 10) {
    feedback = 'Too brief — interviewers need detail to assess your thinking. Aim for 60–150 words.'
  } else if (keywordsHit.length === 0) {
    feedback = `Stayed too general. Bring in specifics like ${question.keywords.slice(0, 3).join(', ')}.`
  } else if (structureHits === 0) {
    feedback = 'Good content, but structure it: situation → action → result makes answers land better.'
  } else if (score >= 75) {
    feedback = 'Strong answer — specific, structured, and relevant to the question.'
  } else {
    feedback = 'Solid base. Add a concrete example with a measurable result to push this higher.'
  }

  return { question: question.text, answer: text, score, wordCount, keywordsHit, feedback }
}

export function scoreInterview(
  role: string,
  level: string,
  questions: Question[],
  answers: string[],
): InterviewResult {
  const analyses = questions.map((q, i) => analyzeAnswer(q, answers[i] ?? ''))

  const byCategory = new Map<string, number[]>()
  questions.forEach((q, i) => {
    const list = byCategory.get(q.category) ?? []
    list.push(analyses[i].score)
    byCategory.set(q.category, list)
  })

  const categories = ['Communication', 'Technical', 'Problem Solving', 'Experience'].map((label) => {
    const scores = byCategory.get(label)
    const score = scores && scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : Math.round(analyses.reduce((a, b) => a + b.score, 0) / analyses.length)
    return { label, score }
  })

  const overall = Math.round(analyses.reduce((a, b) => a + b.score, 0) / analyses.length)

  const strengths: string[] = []
  const improvements: string[] = []

  const avgWords = analyses.reduce((a, b) => a + b.wordCount, 0) / analyses.length
  if (avgWords >= 50) strengths.push('You give detailed, substantial answers.')
  else improvements.push('Expand your answers — aim for 60–150 words each.')

  const totalKeywords = analyses.reduce((a, b) => a + b.keywordsHit.length, 0)
  if (totalKeywords >= 8) strengths.push('You use relevant, role-specific vocabulary.')
  else improvements.push('Use more role-specific terms and name real tools you have used.')

  const best = [...categories].sort((a, b) => b.score - a.score)[0]
  const worst = [...categories].sort((a, b) => a.score - b.score)[0]
  if (best.score >= 60) strengths.push(`${best.label} is your standout area (${best.score}/100).`)
  if (worst.score < 60) improvements.push(`${worst.label} needs the most practice (${worst.score}/100).`)

  if (strengths.length === 0) strengths.push('You completed the full interview — consistency matters.')
  if (improvements.length === 0) improvements.push('Keep practicing with tougher, role-specific questions.')

  return {
    role,
    level,
    date: new Date().toISOString(),
    overall,
    categories,
    strengths,
    improvements,
    answers: analyses,
  }
}
