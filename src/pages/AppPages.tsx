import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SiteNav } from '../components/SiteNav'
import { fadeUp, staggerContainer } from '../motion/variants'
import {
  mapExperienceToLevel,
  mapProfileRoleToInterviewRole,
} from '../lib/interviewEngine'
import {
  MIN_APPLY_SCORE,
  applicationStats,
  applyToJob,
  calcProfileStrength,
  canApplyToJobs,
  firstName,
  getApplications,
  getInterviewResult,
  getProfile,
  getRankedJobs,
  getUser,
  hasInterviewScore,
  markNotificationsRead,
  withdrawApplication,
} from '../lib/store'
import styles from './AppPages.module.css'

export function DashboardPage() {
  const user = getUser()
  if (user?.role === 'employer') {
    return <Navigate to="/employer/dashboard" replace />
  }
  const interview = getInterviewResult()
  const profile = getProfile()
  const name = firstName()
  const strength = calcProfileStrength(profile)
  const stats = applicationStats()
  const ranked = getRankedJobs().slice(0, 3)

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <SiteNav />
        <motion.main
          className={styles.main}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.header className={styles.head} variants={fadeUp}>
            <div>
              <h1>Welcome back, {name}</h1>
              <p>
                {interview
                  ? `Your AI interview score is ${interview.overall}. Matches are unlocked.`
                  : 'Take your AI video interview with Ava to unlock ranked job matches.'}
              </p>
            </div>
            <div className={styles.headActions}>
              <Link to="/jobs" className={styles.secondary}>
                View matches
              </Link>
              <Link to="/interview" className={styles.primary}>
                {interview ? 'Retake interview' : 'Enter interview studio'}
              </Link>
            </div>
          </motion.header>

          {!interview && (
            <motion.aside className={styles.unlockBanner} variants={fadeUp}>
              <div>
                <strong>Interview required</strong>
                <p>
                  Join the video room, answer Ava out loud, and unlock applications with your score.
                </p>
              </div>
              <Link to="/interview" className={styles.primary}>
                Start AI Interview →
              </Link>
            </motion.aside>
          )}

          <div className={styles.dashGrid}>
            <motion.article className={`${styles.card} ${styles.heroCard}`} variants={fadeUp}>
              <h2>AI Interview Score</h2>
              {interview ? (
                <>
                  <div
                    className={styles.progress}
                    style={{
                      background: `radial-gradient(circle at center, #fff 58%, transparent 59%), conic-gradient(#2563eb 0 ${interview.overall}%, #dbeafe ${interview.overall}% 100%)`,
                    }}
                  >
                    <strong>{interview.overall}</strong>
                  </div>
                  <p className={styles.strong}>
                    {interview.overall >= 75
                      ? 'Interview certified'
                      : interview.overall >= MIN_APPLY_SCORE
                        ? 'Eligible to apply'
                        : 'Retake to unlock applies'}
                  </p>
                  <p className={styles.muted}>
                    {interview.role} · {interview.level} ·{' '}
                    {new Date(interview.date).toLocaleDateString()}
                  </p>
                  <Link to="/profile" className={styles.link}>
                    Open talent scorecard →
                  </Link>
                </>
              ) : (
                <>
                  <p className={styles.muted} style={{ marginTop: 14, textAlign: 'left' }}>
                    Live video interview with Ava — spoken answers, instant scoring across
                    four dimensions. Required to unlock matches.
                  </p>
                  <Link to="/interview" className={styles.link}>
                    Enter interview studio →
                  </Link>
                </>
              )}
            </motion.article>

            <motion.article className={styles.card} variants={fadeUp}>
              <h2>Talent readiness</h2>
              <div
                className={styles.progress}
                style={{
                  background: `radial-gradient(circle at center, #fff 58%, transparent 59%), conic-gradient(#2563eb 0 ${strength}%, #dbeafe ${strength}% 100%)`,
                }}
              >
                <strong>{strength}%</strong>
              </div>
              <p className={styles.strong}>
                {interview ? 'Score-weighted profile' : 'Complete interview to climb'}
              </p>
              <p className={styles.muted}>
                Interview score is the biggest part of readiness — profile details help fine-tune matches.
              </p>
              <Link to={interview ? '/onboarding' : '/interview'} className={styles.link}>
                {interview ? 'Polish profile →' : 'Interview first →'}
              </Link>
            </motion.article>

            <motion.article className={styles.card} variants={fadeUp}>
              <h2>Top matches</h2>
              {!hasInterviewScore() ? (
                <p className={styles.muted} style={{ marginTop: 12, textAlign: 'left' }}>
                  Matches stay locked until you finish your AI interview.
                </p>
              ) : (
                <ul className={styles.matchList}>
                  {ranked.map((job) => (
                    <li key={job.title}>
                      <div>
                        <strong>{job.title}</strong>
                        <span>
                          {job.company} · {job.location}
                        </span>
                      </div>
                      <b>{job.match}%</b>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/jobs" className={styles.link}>
                {hasInterviewScore() ? 'Browse all matches →' : 'See locked roles →'}
              </Link>
            </motion.article>

            <motion.article className={styles.card} variants={fadeUp}>
              <h2>Applications</h2>
              <div className={styles.stats}>
                {[
                  [String(stats.applied), 'Applied'],
                  [String(stats.inReview), 'In Review'],
                  [String(stats.interviews), 'Interviews'],
                  [String(stats.offers), 'Offers'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </motion.article>

            {interview && (
              <motion.article className={styles.card} variants={fadeUp}>
                <h2>Score breakdown</h2>
                <ul className={styles.matchList}>
                  {interview.categories.map((cat) => (
                    <li key={cat.label}>
                      <div>
                        <strong>{cat.label}</strong>
                        <span>Ava analysis</span>
                      </div>
                      <b>{cat.score}/100</b>
                    </li>
                  ))}
                </ul>
              </motion.article>
            )}

            <motion.article className={styles.card} variants={fadeUp}>
              <h2>Quick actions</h2>
              <div className={styles.quick}>
                <Link to="/interview">AI interview studio</Link>
                <Link to="/jobs">Ranked job matches</Link>
                <Link to="/applications">My applications</Link>
                <Link to="/profile">Talent scorecard</Link>
                <Link to="/onboarding">Profile details</Link>
              </div>
            </motion.article>
          </div>
        </motion.main>
      </div>
    </div>
  )
}

export function JobsPage() {
  const navigate = useNavigate()
  const [toast, setToast] = useState('')
  const interview = getInterviewResult()
  const unlocked = hasInterviewScore()
  const canApply = canApplyToJobs()
  const ranked = getRankedJobs()

  function handleApply(job: (typeof ranked)[number]) {
    try {
      applyToJob(job)
      setToast(`Applied to ${job.title} at ${job.company}`)
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Could not apply.')
    }
    window.setTimeout(() => setToast(''), 2800)
  }

  function handleInterviewToApply(job: (typeof ranked)[number]) {
    const targetRole = mapProfileRoleToInterviewRole(job.title)
    const targetLevel = mapExperienceToLevel(job.title)
    sessionStorage.setItem(
      'hireright.targetJob',
      JSON.stringify({
        title: job.title,
        company: job.company,
        role: targetRole,
        level: targetLevel,
      }),
    )
    navigate('/interview')
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <SiteNav />
        <motion.main
          className={styles.main}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.header className={styles.head} variants={fadeUp}>
            <div>
              <h1>Interview-ranked matches</h1>
              <p>
                {unlocked
                  ? `Ranked using your ${interview!.overall} AI interview score.`
                  : 'Complete your AI interview to unlock applies and full ranking.'}
              </p>
            </div>
            <Link to="/interview" className={styles.primary}>
              {unlocked ? 'Improve score' : 'Unlock with interview'}
            </Link>
          </motion.header>

          {!unlocked && (
            <motion.aside className={styles.unlockBanner} variants={fadeUp}>
              <div>
                <strong>Matches locked</strong>
                <p>
                  Roles are visible, but applying requires an AI interview score of at least{' '}
                  {MIN_APPLY_SCORE}.
                </p>
              </div>
              <Link to="/interview" className={styles.primary}>
                Take AI Interview →
              </Link>
            </motion.aside>
          )}

          {toast && <p className={styles.toast}>{toast}</p>}

          <div className={styles.jobList}>
            {ranked.map((job) => (
              <motion.article
                key={`${job.company}-${job.title}`}
                className={`${styles.jobCard} ${job.locked ? styles.jobLocked : ''}`}
                variants={fadeUp}
                whileHover={{ y: -3 }}
              >
                <div>
                  <h2>{job.title}</h2>
                  <p>
                    {job.company} · {job.location}
                  </p>
                  {job.locked && (
                    <span className={styles.lockTag}>Unlock with AI interview</span>
                  )}
                </div>
                <div className={styles.jobRight}>
                  <b>{job.locked ? '—' : `${job.match}%`} Match</b>
                  {job.locked || !canApply ? (
                    <button
                      type="button"
                      className={styles.primary}
                      onClick={() => handleInterviewToApply(job)}
                    >
                      Interview to apply
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.primary}
                      onClick={() => handleApply(job)}
                    >
                      Apply now
                    </button>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </motion.main>
      </div>
    </div>
  )
}

export function ProfilePage() {
  const user = getUser()
  const profile = getProfile()
  const interview = getInterviewResult()
  const strength = calcProfileStrength(profile)

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <SiteNav />
        <motion.main
          className={styles.main}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.header className={styles.head} variants={fadeUp}>
            <div>
              <h1>Talent scorecard</h1>
              <p>
                {user?.name ?? 'Candidate'}
                {profile?.currentRole ? ` · ${profile.currentRole}` : ''}
                {interview ? ` · Score ${interview.overall}` : ' · Interview pending'}
              </p>
            </div>
            <div className={styles.headActions}>
              <Link to="/onboarding" className={styles.secondary}>
                Edit details
              </Link>
              <Link to="/interview" className={styles.primary}>
                {interview ? 'Retake interview' : 'Take AI interview'}
              </Link>
            </div>
          </motion.header>

          <motion.section className={styles.card} variants={fadeUp}>
            <h2>Interview certification</h2>
            {interview ? (
              <>
                <div className={styles.stats}>
                  {[
                    [String(interview.overall), 'Overall'],
                    ...(interview.categories ?? []).map(
                      (c) => [String(c.score), c.label] as [string, string],
                    ),
                  ].map(([value, label]) => (
                    <div key={label}>
                      <strong>{value}</strong>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.insightSplit}>
                  <div>
                    <h3>Strengths</h3>
                    <ul>
                      {(interview.strengths ?? []).map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Improve next</h3>
                    <ul>
                      {(interview.improvements ?? []).map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <p className={styles.muted} style={{ marginTop: 12, textAlign: 'left' }}>
                No score yet. Complete the AI video interview to generate your talent scorecard.
              </p>
            )}
          </motion.section>

          <motion.section className={styles.card} variants={fadeUp}>
            <h2>Profile snapshot</h2>
            <div className={styles.stats}>
              {[
                [`${strength}%`, 'Readiness'],
                [String(profile?.skills?.length ?? 0), 'Skills'],
                [
                  String(profile?.achievements?.filter(Boolean).length ?? 0),
                  'Achievements',
                ],
                [interview ? 'Certified' : 'Pending', 'Interview'],
              ].map(([value, label]) => (
                <div key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {profile?.whoAreYou && (
              <div className={styles.bio}>
                <h3>About</h3>
                <p>{profile.whoAreYou}</p>
              </div>
            )}

            {profile && profile.skills.length > 0 && (
              <div className={styles.skillWrap}>
                {profile.skills.map((skill) => (
                  <span key={skill} className={styles.skill}>
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.quick}>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/jobs">Matches</Link>
              <Link to="/applications">Applications</Link>
              <Link to="/interview">Interview studio</Link>
            </div>
          </motion.section>
        </motion.main>
      </div>
    </div>
  )
}

export function ApplicationsPage() {
  const [apps, setApps] = useState(() => getApplications())
  const interview = getInterviewResult()

  useEffect(() => {
    markNotificationsRead()
  }, [])

  function handleWithdraw(id: string) {
    withdrawApplication(id)
    setApps(getApplications())
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <SiteNav />
        <motion.main
          className={styles.main}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.header className={styles.head} variants={fadeUp}>
            <div>
              <h1>My applications</h1>
              <p>
                Track every role you applied to. Status updates from employers
                show up here automatically.
              </p>
            </div>
            <Link to="/jobs" className={styles.primary}>
              Find more roles
            </Link>
          </motion.header>

          {apps.length === 0 ? (
            <motion.aside className={styles.unlockBanner} variants={fadeUp}>
              <div>
                <strong>No applications yet</strong>
                <p>
                  {interview
                    ? 'Browse ranked matches and apply with your AI score.'
                    : 'Complete your AI interview first, then apply to unlocked roles.'}
                </p>
              </div>
              <Link to={interview ? '/jobs' : '/interview'} className={styles.primary}>
                {interview ? 'Browse jobs →' : 'Take interview →'}
              </Link>
            </motion.aside>
          ) : (
            <div className={styles.jobList}>
              {apps.map((app) => (
                <motion.article key={app.id} className={styles.jobCard} variants={fadeUp}>
                  <div>
                    <h2>{app.title}</h2>
                    <p>
                      {app.company} · {app.location}
                    </p>
                    <span className={styles.lockTag}>
                      {app.status} · {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.jobRight}>
                    <b>{app.match}% Match</b>
                    <button
                      type="button"
                      className={styles.secondary}
                      onClick={() => handleWithdraw(app.id)}
                    >
                      Withdraw
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </motion.main>
      </div>
    </div>
  )
}
