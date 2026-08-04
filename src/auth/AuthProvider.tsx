import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  clearAccessToken,
  getAccessToken,
  getCurrentUser,
  loginCandidate,
  registerCandidate,
  setAccessToken,
  type User,
} from '../lib/api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getAccessToken()) {
      setLoading(false)
      return
    }

    getCurrentUser()
      .then(setUser)
      .catch(() => clearAccessToken())
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(email: string, password: string) {
        const response = await loginCandidate({ email, password })
        setAccessToken(response.access_token)
        setUser(response.user)
      },
      async register(fullName: string, email: string, password: string) {
        const response = await registerCandidate({
          full_name: fullName,
          email,
          password,
        })
        setAccessToken(response.access_token)
        setUser(response.user)
      },
      logout() {
        clearAccessToken()
        setUser(null)
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

