import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../lib/api'
import styles from './AuthPage.module.css'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register'
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (user) return <Navigate to="/onboarding" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (isRegister) await register(fullName, email, password)
      else await login(email, password)
      navigate('/onboarding', { replace: true })
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <Link to="/" className={styles.brand}>
          <strong>
            HRERIGHT<sup>TTT</sup>
          </strong>
          <span>
            TALENT <em>TO</em> TALENT
          </span>
        </Link>
        <div className={styles.brandCopy}>
          <p className={styles.eyebrow}>YOUR NEXT MOVE STARTS HERE</p>
          <h1>
            Build a profile that puts your <em>best work</em> forward.
          </h1>
          <p>
            Save your progress, upload your résumé, and schedule an interview
            from one secure workspace.
          </p>
        </div>
        <div className={styles.trustRow}>
          <span>✓ Secure profile</span>
          <span>✓ 5-minute setup</span>
          <span>✓ Real-time saving</span>
        </div>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.formCard}>
          <Link to="/" className={styles.backLink}>
            ← Back to home
          </Link>
          <div className={styles.formHeading}>
            <span className={styles.icon} aria-hidden="true">
              {isRegister ? '✦' : '→'}
            </span>
            <h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2>
            <p>
              {isRegister
                ? 'Start building your candidate profile today.'
                : 'Sign in to continue your candidate journey.'}
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {isRegister && (
              <label>
                Full name
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                  minLength={2}
                  maxLength={120}
                  placeholder="Arjun Kumar"
                  required
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                minLength={8}
                maxLength={128}
                placeholder="At least 8 characters"
                required
              />
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submit} disabled={submitting}>
              {submitting
                ? 'Please wait…'
                : isRegister
                  ? 'Create account →'
                  : 'Sign in →'}
            </button>
          </form>

          <p className={styles.switchMode}>
            {isRegister ? 'Already have an account?' : 'New to HRERIGHT?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
