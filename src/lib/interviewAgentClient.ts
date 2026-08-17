/**
 * Interview session client — 100% local (no API / LLM).
 * Questions and scoring come from the resume-aware local agent.
 */
import type { Question } from './interviewEngine'
import type { InterviewResult, SavedProfile } from './store'
import {
  buildResumeInterviewQuestions,
  runLocalInterviewScore,
} from './localInterview'

export type InterviewStartResponse = {
  sessionId: string | null
  agent: string
  llm: boolean
  total: number
  questions: Question[]
  question: Question
  offline?: boolean
}

export type IntegritySnapshot = {
  faceViolations: number
  singlePersonOk: boolean
  maxFacesSeen: number
  banned?: boolean
  banReason?: string
  sideLookWarnings?: number
  tooFarWarnings?: number
}

/** @deprecated use buildResumeInterviewQuestions — kept for imports */
export function buildLocalResumeQuestions(
  role: string,
  level: string,
  profile: SavedProfile | null,
  jobDescription?: string,
): Question[] {
  return buildResumeInterviewQuestions(role, level, profile, jobDescription)
}

export async function startInterviewSession(
  role: string,
  level: string,
  profile: SavedProfile | null,
  jobDescription?: string,
): Promise<InterviewStartResponse> {
  const questions = buildResumeInterviewQuestions(role, level, profile, jobDescription)
  const sessionId = `local-${Date.now().toString(36)}`
  return {
    sessionId,
    agent: 'local-resume-agent',
    llm: false,
    total: questions.length,
    questions,
    question: questions[0],
    offline: true,
  }
}

export async function pingInterviewIntegrity(
  _sessionId: string | null,
  _faceCount: number,
): Promise<void> {
  // Local-only: integrity is tracked in memory on the client.
}

export async function scoreInterviewRemote(options: {
  sessionId: string | null
  role: string
  level: string
  questions: Question[]
  answers: string[]
  profile: SavedProfile | null
  integrity: IntegritySnapshot
}): Promise<InterviewResult> {
  return runLocalInterviewScore(options)
}
