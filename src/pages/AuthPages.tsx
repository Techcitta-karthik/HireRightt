import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SiteNav } from '../components/SiteNav'
import { MotionButton } from '../motion/MotionButton'
import { easeOut, fadeUp } from '../motion/variants'
import {
  getAccountPrefs,
  getInterviewResult,
  getProfile,
  getUser,
  isLoggedIn,
  logout,
  saveAccountPrefs,
  saveUser,
} from '../lib/store'
import { apiHealth, apiLogin, apiLogout, apiSignup, apiUpdateAccount } from '../lib/api'
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
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Password must be 8+ characters and include a letter and number.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    try {
      if (!(await apiHealth())) throw new Error('The HireRight service is unavailable. Try again shortly.')
      const user = await apiSignup(name.trim(), email.trim().toLowerCase(), password)
      saveUser(user)
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
          <span className={styles.kicker}>BUILD PROFILE → AI INTERVIEW</span>
          <h1>
            Create your <em>HIRERIGHT</em> account
          </h1>
          <p>
            Sign up, fill About You & Skills, take Ava&apos;s AI interview, then get scored and unlock matches.
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
                  placeholder="8+ characters"
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
    try {
      if (!(await apiHealth())) throw new Error('The HireRight service is unavailable. Try again shortly.')
      const user = await apiLogin(email.trim().toLowerCase(), password)
      saveUser(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.')
      return
    }
    setError('')
    const from = (location.state as { from?: string } | null)?.from
    if (from) {
      navigate(from)
      return
    }
    // Resume profile wizard if About You / Skills aren't finished yet.
    const profile = getProfile()
    if (!profile || (profile.completedSteps ?? 0) < 3) {
      navigate('/onboarding')
      return
    }
    if (!getInterviewResult()) {
      navigate('/interview')
      return
    }
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
          <span className={styles.kicker}>WELCOME BACK · AI INTERVIEW</span>
          <h1>
            Login to <em>HIRERIGHT</em>
          </h1>
          <p>Sign in to your interview studio, talent score, and unlocked matches.</p>

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
  const [user, setUser] = useState(() => getUser())
  const [panel, setPanel] = useState<
    'menu' | 'security' | 'notifications' | 'privacy'
  >('menu')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Email & password
  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Prefs
  const [prefs, setPrefs] = useState(() => getAccountPrefs())

  useEffect(() => {
    setUser(getUser())
    setPrefs(getAccountPrefs())
  }, [])

  function flash(ok: string) {
    setError('')
    setMessage(ok)
    window.setTimeout(() => setMessage(''), 2800)
  }

  async function saveSecurity(event: FormEvent) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!currentPassword) {
      setError('Enter your current password to make changes.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    try {
      const updated = await apiUpdateAccount({
        currentPassword,
        email: email.trim().toLowerCase(),
        ...(newPassword ? { newPassword } : {}),
      })
      saveUser(updated)
      setUser(getUser())
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update account security.')
      return
    }

    setCurrentPassword('')
    flash('Account security updated.')
  }

  function saveNotifications(event: FormEvent) {
    event.preventDefault()
    const next = saveAccountPrefs(prefs)
    setPrefs(next)
    flash('Notification preferences saved.')
  }

  function savePrivacy(event: FormEvent) {
    event.preventDefault()
    const next = saveAccountPrefs(prefs)
    setPrefs(next)
    flash('Privacy settings saved.')
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <SiteNav />
        <motion.div
          className={`${styles.card} ${styles.settingsCard}`}
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

          {message && <p className={styles.success}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}

          {panel === 'menu' && (
            <div className={styles.settingsList}>
              <button type="button" onClick={() => setPanel('security')}>
                Email & password
              </button>
              <button type="button" onClick={() => setPanel('notifications')}>
                Notification preferences
              </button>
              <button type="button" onClick={() => setPanel('privacy')}>
                Privacy & visibility
              </button>
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
                onClick={() => navigate('/logout')}
              >
                Sign out
              </MotionButton>
            </div>
          )}

          {panel === 'security' && (
            <form className={styles.form} onSubmit={saveSecurity}>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
              <label>
                Current password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
              <label>
                New password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Leave blank to keep current"
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </label>
              <MotionButton type="submit" className={styles.submit} lift>
                Save changes
              </MotionButton>
              <MotionButton
                type="button"
                className={styles.ghost}
                onClick={() => {
                  setPanel('menu')
                  setError('')
                }}
              >
                Back
              </MotionButton>
            </form>
          )}

          {panel === 'notifications' && (
            <form className={styles.form} onSubmit={saveNotifications}>
              {(
                [
                  ['emailMatchAlerts', 'Email me about new role matches'],
                  ['interviewReminders', 'Remind me to retake / finish interviews'],
                  ['productTips', 'Send product tips and updates'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={(e) =>
                      setPrefs((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
              <MotionButton type="submit" className={styles.submit} lift>
                Save preferences
              </MotionButton>
              <MotionButton
                type="button"
                className={styles.ghost}
                onClick={() => setPanel('menu')}
              >
                Back
              </MotionButton>
            </form>
          )}

          {panel === 'privacy' && (
            <form className={styles.form} onSubmit={savePrivacy}>
              {(
                [
                  ['profileVisibleToEmployers', 'Make my profile visible to employers'],
                  ['shareScoreOnApplications', 'Share AI interview score on applications'],
                  ['showOnlineStatus', 'Show online status to recruiters'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={(e) =>
                      setPrefs((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
              <MotionButton type="submit" className={styles.submit} lift>
                Save privacy settings
              </MotionButton>
              <MotionButton
                type="button"
                className={styles.ghost}
                onClick={() => setPanel('menu')}
              >
                Back
              </MotionButton>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export function LogoutPage() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [signedOut, setSignedOut] = useState(() => !isLoggedIn())

  useEffect(() => {
    const user = getUser()
    if (user) {
      setUserName(user.name)
      setUserEmail(user.email)
    } else {
      setSignedOut(true)
    }
  }, [])

  async function confirmSignOut() {
    await apiLogout()
    logout()
    setSignedOut(true)
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
          {signedOut ? (
            <>
              <span className={styles.kicker}>SIGNED OUT</span>
              <h1>
                You&apos;re signed out of <em>HIRERIGHT</em>
              </h1>
              <p>
                Your session is closed on this device. Profile data stays saved for when you
                sign back in.
              </p>
              <div className={styles.settingsList}>
                <MotionButton
                  type="button"
                  className={styles.submit}
                  onClick={() => navigate('/login')}
                  lift
                >
                  Sign back in
                </MotionButton>
                <MotionButton
                  type="button"
                  className={styles.ghost}
                  onClick={() => navigate('/')}
                >
                  Back to home
                </MotionButton>
              </div>
              <p className={styles.footer}>
                New here? <Link to="/signup">Create an account</Link>
              </p>
            </>
          ) : (
            <>
              <span className={styles.kicker}>SIGN OUT</span>
              <h1>
                Leave <em>HIRERIGHT</em>?
              </h1>
              <p>
                You&apos;re signed in as{' '}
                <strong>{userName || userEmail || 'your account'}</strong>
                {userEmail && userName ? ` (${userEmail})` : ''}. Confirm to end this session.
              </p>
              <div className={styles.settingsList}>
                <MotionButton
                  type="button"
                  className={styles.submit}
                  onClick={confirmSignOut}
                  lift
                >
                  Yes, sign me out
                </MotionButton>
                <MotionButton
                  type="button"
                  className={styles.ghost}
                  onClick={() => navigate(-1)}
                >
                  Stay signed in
                </MotionButton>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
