import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { isLoggedIn } from '../lib/store'

type Props = {
  children: ReactNode
}

/** Redirects to /login when there is no active session. */
export function RequireAuth({ children }: Props) {
  const location = useLocation()
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}
