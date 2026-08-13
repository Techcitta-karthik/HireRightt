/** Authenticated client for the HireRight Python API. */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787'

const TOKEN_KEY = 'hireright.apiToken'
const REFRESH_TOKEN_KEY = 'hireright.refreshToken'

export function getApiToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setApiToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function setAuthTokens(token: string | null, refreshToken: string | null = null) {
  setApiToken(token)
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  else localStorage.removeItem(REFRESH_TOKEN_KEY)
}

async function request(path: string, options: RequestInit = {}, mayRefresh = true) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  const token = getApiToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (res.status === 401 && mayRefresh && path !== '/api/auth/refresh') {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (refreshToken) {
      const refreshed = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      const refreshData = await refreshed.json().catch(() => ({}))
      if (refreshed.ok) {
        setAuthTokens(refreshData.token, refreshData.refreshToken)
        return request(path, options, false)
      }
      setAuthTokens(null)
    }
  }
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
  setAuthTokens(data.token, data.refreshToken)
  return data.user
}

export async function apiLogin(email: string, password: string) {
  const data = await request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setAuthTokens(data.token, data.refreshToken)
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

export async function apiLogout() {
  try {
    await request('/api/logout', { method: 'POST' })
  } catch {
    // ignore
  }
  setAuthTokens(null)
}

export async function apiUpdateAccount(input: {
  currentPassword: string
  name?: string
  email?: string
  newPassword?: string
}) {
  return request('/api/account', {
    method: 'PATCH',
    body: JSON.stringify(input),
  }) as Promise<{ id: string; name: string; email: string }>
}

export type ApiHealthInfo = {
  ok: boolean
  llm?: boolean
  version?: string
  features?: Record<string, boolean>
}

export async function apiHealthInfo(): Promise<ApiHealthInfo | null> {
  try {
    return (await request('/api/health')) as ApiHealthInfo
  } catch {
    return null
  }
}
