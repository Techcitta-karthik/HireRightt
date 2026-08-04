import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SiteNav } from '../components/SiteNav'
import { MotionButton } from '../motion/MotionButton'
import { easeOut, fadeUp } from '../motion/variants'
import styles from './AuthPages.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password to continue.')
      return
    }
    setError('')
    navigate('/dashboard')
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
            Login to <em>HRERIGHT</em>
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
            New here?{' '}
            <Link to="/onboarding">Create your profile — it&apos;s free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export function SettingsPage() {
  const navigate = useNavigate()

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
          <p>Manage your login, notifications, and privacy preferences.</p>
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
              onClick={() => navigate('/login')}
            >
              Sign out
            </MotionButton>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
