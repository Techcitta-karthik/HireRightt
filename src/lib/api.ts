const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ??
  'http://localhost:8000/api/v1'

const TOKEN_KEY = 'hireright_access_token'

export interface User {
  id: string
  email: string
  full_name: string
  is_active: boolean
}

export interface AuthResponse {
  access_token: string
  token_type: 'bearer'
  expires_in: number
  user: User
}

export interface CandidateProfile {
  id: string
  user_id: string
  bio: string | null
  motivation: string | null
  strengths: string | null
  current_role: string | null
  total_experience_years: number | null
  current_location: string | null
  notice_period_days: number | null
  updated_at: string
}

export type CandidateProfileUpdate = Omit<
  CandidateProfile,
  'id' | 'user_id' | 'updated_at'
>

export interface Resume {
  id: string
  original_name: string
  content_type: string
  size_bytes: number
  created_at: string
}

export interface InterviewSlot {
  id: string
  starts_at: string
  duration_minutes: number
  capacity: number
  available_places: number
}

export interface InterviewBooking {
  id: string
  status: 'scheduled' | 'cancelled' | 'completed'
  created_at: string
  slot: InterviewSlot
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getAccessToken()

  if (!(init.body instanceof FormData) && init.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (authenticated && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(
      0,
      'Cannot reach the API. Make sure FastAPI is running on localhost:8000.',
    )
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) message = body.detail
    } catch {
      // The server did not return JSON.
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export async function registerCandidate(payload: {
  email: string
  full_name: string
  password: string
}) {
  return request<AuthResponse>(
    '/auth/register',
    { method: 'POST', body: JSON.stringify(payload) },
    false,
  )
}

export async function loginCandidate(payload: {
  email: string
  password: string
}) {
  return request<AuthResponse>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify(payload) },
    false,
  )
}

export function getCurrentUser() {
  return request<User>('/auth/me')
}

export function getProfile() {
  return request<CandidateProfile>('/profiles/me')
}

export function updateProfile(payload: Partial<CandidateProfileUpdate>) {
  return request<CandidateProfile>('/profiles/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function uploadResume(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<Resume>('/resumes', { method: 'POST', body: formData })
}

export function listResumes() {
  return request<Resume[]>('/resumes')
}

export function listInterviewSlots() {
  return request<InterviewSlot[]>('/interview-slots', {}, false)
}

export function listMyInterviews() {
  return request<InterviewBooking[]>('/interviews/me')
}

export function bookInterview(slotId: string) {
  return request<InterviewBooking>('/interviews', {
    method: 'POST',
    body: JSON.stringify({ slot_id: slotId }),
  })
}

export function cancelInterview(bookingId: string) {
  return request<InterviewBooking>(`/interviews/${bookingId}/cancel`, {
    method: 'POST',
  })
}

