/** Thin client for the optional Node API. Falls back silently when offline. */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787'

const TOKEN_KEY = 'hireright.apiToken'

export function getApiToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setApiToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  const token = getApiToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export async function apiHealth() {
  try {
    const data = await request('/api/health')
    return Boolean(data.ok)
  } catch {
    return false
  }
}

export async function apiSignup(name: string, email: string, password: string) {
  const data = await request('/api/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
  setApiToken(data.token)
  return data.user
}

export async function apiLogin(email: string, password: string) {
  const data = await request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setApiToken(data.token)
  return data.user
}

export async function apiSaveProfile(profile: unknown) {
  return request('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  })
}

export async function apiSaveInterview(interview: unknown) {
  return request('/api/interview', {
    method: 'POST',
    body: JSON.stringify(interview),
  })
}
