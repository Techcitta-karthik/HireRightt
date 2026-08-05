import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SiteNav } from '../components/SiteNav'
import { MotionButton } from '../motion/MotionButton'
import { easeOut, fadeUp } from '../motion/variants'
import { getUser, login, logout, saveUser } from '../lib/store'
import { apiHealth, apiLogin, apiSignup } from '../lib/api'
import styles from './AuthPages.module.css'

export function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Fill in all the fields to create your account.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    try {
      if (await apiHealth()) {
        await apiSignup(name.trim(), email.trim().toLowerCase(), password)
      }
      saveUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      })
      navigate('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <SiteNav />
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOut }}
        >
          <span className={styles.kicker}>GET STARTED FREE</span>
          <h1>
            Create your <em>HIRERIGHT</em> account
          </h1>
          <p>
            One account for your profile, AI interviews, and job matches.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label>
              Full name
              <input
                type="text"
                value={name}
                placeholder="Arjun Sharma"
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                placeholder="you@example.com"
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <div className={styles.row2}>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  placeholder="6+ characters"
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  value={confirm}
                  placeholder="Repeat password"
                  onChange={(event) => setConfirm(event.target.value)}
                  autoComplete="new-password"
                />
              </label>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <MotionButton type="submit" className={styles.submit} lift>
              Create Account →
            </MotionButton>
          </form>

          <p className={styles.footer}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password to continue.')
      return
    }
    const user = login(email.trim().toLowerCase(), password)
    if (!user) {
      setError('Email or password is incorrect. Sign up if you are new.')
      return
    }
    try {
      if (await apiHealth()) {
        await apiLogin(email.trim().toLowerCase(), password)
      }
    } catch {
      // Local login succeeded; API sync is optional.
    }
    setError('')
    const from = (location.state as { from?: string } | null)?.from
    navigate(from || '/dashboard')
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <SiteNav />
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOut }}
        >
          <span className={styles.kicker}>WELCOME BACK</span>
          <h1>
            Login to <em>HIRERIGHT</em>
          </h1>
          <p>Access your dashboard, matches, and interview updates.</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                placeholder="you@example.com"
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                placeholder="Enter password"
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <MotionButton type="submit" className={styles.submit} lift>
              Login
            </MotionButton>
          </form>

          <p className={styles.footer}>
            New here? <Link to="/signup">Create your account — it&apos;s free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export function SettingsPage() {
  const navigate = useNavigate()
  const user = getUser()

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <SiteNav />
        <motion.div
          className={styles.card}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <span className={styles.kicker}>ACCOUNT</span>
          <h1>Account Settings</h1>
          <p>
            Signed in as <strong>{user?.email ?? 'guest'}</strong>
            {user?.name ? ` · ${user.name}` : ''}
          </p>
          <div className={styles.settingsList}>
            <button type="button">Email & password</button>
            <button type="button">Notification preferences</button>
            <button type="button">Privacy & visibility</button>
            <MotionButton
              type="button"
              className={styles.submit}
              onClick={() => navigate('/profile')}
              lift
            >
              View Profile
            </MotionButton>
            <MotionButton
              type="button"
              className={styles.ghost}
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              Sign out
            </MotionButton>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
