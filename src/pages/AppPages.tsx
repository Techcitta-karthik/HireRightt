import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SiteNav } from '../components/SiteNav'
import { fadeUp, staggerContainer } from '../motion/variants'
import {
  JOB_MATCHES,
  applicationStats,
  applyToJob,
  calcProfileStrength,
  firstName,
  getInterviewResult,
  getProfile,
  getUser,
} from '../lib/store'
import styles from './AppPages.module.css'

export function DashboardPage() {
  const interview = getInterviewResult()
  const profile = getProfile()
  const name = firstName()
  const strength = calcProfileStrength(profile)
  const stats = applicationStats()

  const strengthLabel =
    strength >= 80 ? 'Very Strong' : strength >= 55 ? 'Good Progress' : 'Just Getting Started'

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
              <h1>Welcome back, {name}!</h1>
              <p>Let&apos;s find the right opportunities for you.</p>
            </div>
            <div className={styles.headActions}>
              <Link to="/jobs" className={styles.secondary}>
                Explore Jobs
              </Link>
              <Link to="/interview" className={styles.primary}>
                {interview ? 'Retake AI Interview' : 'Take AI Interview'}
              </Link>
            </div>
          </motion.header>

          <div className={styles.dashGrid}>
            <motion.article className={styles.card} variants={fadeUp}>
              <h2>AI Interview Score</h2>
              {interview ? (
                <>
                  <div
                    className={styles.progress}
                    style={{
                      background: `radial-gradient(circle at center, #fff 58%, transparent 59%), conic-gradient(#f0510e 0 ${interview.overall}%, #ffe0c7 ${interview.overall}% 100%)`,
                    }}
                  >
                    <strong>{interview.overall}</strong>
                  </div>
                  <p className={styles.strong}>
                    {interview.overall >= 75
                      ? 'Interview Ready'
                      : interview.overall >= 55
                        ? 'Getting There'
                        : 'Needs Practice'}
                  </p>
                  <p className={styles.muted}>
                    {interview.role} · {new Date(interview.date).toLocaleDateString()}
                  </p>
                  <Link to="/interview" className={styles.link}>
                    View Full Report →
                  </Link>
                </>
              ) : (
                <>
                  <p className={styles.muted} style={{ marginTop: 14, textAlign: 'left' }}>
                    Take a 5-question AI interview and get scored on
                    communication, technical depth, problem solving, and
                    experience — instantly.
                  </p>
                  <Link to="/interview" className={styles.link}>
                    Start AI Interview →
                  </Link>
                </>
              )}
            </motion.article>

            <motion.article className={styles.card} variants={fadeUp}>
              <h2>Profile Strength</h2>
              <div
                className={styles.progress}
                style={{
                  background: `radial-gradient(circle at center, #fff 58%, transparent 59%), conic-gradient(#f0510e 0 ${strength}%, #ffe0c7 ${strength}% 100%)`,
                }}
              >
                <strong>{strength}%</strong>
              </div>
              <p className={styles.strong}>{strengthLabel}</p>
              <p className={styles.muted}>
                {profile
                  ? `${profile.skills.length} skills · ${profile.workExperiences.filter((w) => w.jobTitle).length} experiences`
                  : 'Complete your profile to increase match accuracy.'}
              </p>
              <Link to="/onboarding" className={styles.link}>
                Improve Profile →
              </Link>
            </motion.article>

            <motion.article className={styles.card} variants={fadeUp}>
              <h2>Top Job Matches</h2>
              <ul className={styles.matchList}>
                {JOB_MATCHES.slice(0, 3).map((job) => (
                  <li key={job.title}>
                    <div>
                      <strong>{job.title}</strong>
                      <span>
                        {job.company} · {job.location}
                      </span>
                    </div>
                    <b>{job.match}% Match</b>
                  </li>
                ))}
              </ul>
              <Link to="/jobs" className={styles.link}>
                View All Matches →
              </Link>
            </motion.article>

            <motion.article className={styles.card} variants={fadeUp}>
              <h2>Applications Overview</h2>
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

            <motion.article className={styles.card} variants={fadeUp}>
              <h2>Quick Actions</h2>
              <div className={styles.quick}>
                <Link to="/interview">Take / retake AI interview</Link>
                <Link to="/jobs">Browse opportunities</Link>
                <Link to="/onboarding">Edit profile wizard</Link>
                <Link to="/settings">Account settings</Link>
              </div>
            </motion.article>

            {interview && (
              <motion.article className={styles.card} variants={fadeUp}>
                <h2>Latest Score Breakdown</h2>
                <ul className={styles.matchList}>
                  {interview.categories.map((cat) => (
                    <li key={cat.label}>
                      <div>
                        <strong>{cat.label}</strong>
                        <span>AI analysis</span>
                      </div>
                      <b>{cat.score}/100</b>
                    </li>
                  ))}
                </ul>
              </motion.article>
            )}
          </div>
        </motion.main>
      </div>
    </div>
  )
}

export function JobsPage() {
  const [toast, setToast] = useState('')
  const interview = getInterviewResult()

  const ranked = useMemo(() => {
    const boost = interview ? Math.round(interview.overall / 25) : 0
    return JOB_MATCHES.map((job) => ({
      ...job,
      match: Math.min(99, job.match + boost - 2),
    })).sort((a, b) => b.match - a.match)
  }, [interview])

  function handleApply(job: (typeof JOB_MATCHES)[number]) {
    applyToJob(job)
    setToast(`Applied to ${job.title} at ${job.company}`)
    window.setTimeout(() => setToast(''), 2400)
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
              <h1>Explore Opportunities</h1>
              <p>
                AI-ranked roles
                {interview
                  ? ` boosted by your ${interview.overall} interview score.`
                  : ' — take an AI interview to boost your match rank.'}
              </p>
            </div>
            <Link to="/interview" className={styles.primary}>
              {interview ? 'Improve Score' : 'Take AI Interview'}
            </Link>
          </motion.header>

          {toast && <p className={styles.toast}>{toast}</p>}

          <div className={styles.jobList}>
            {ranked.map((job) => (
              <motion.article
                key={job.title}
                className={styles.jobCard}
                variants={fadeUp}
                whileHover={{ y: -3 }}
              >
                <div>
                  <h2>{job.title}</h2>
                  <p>
                    {job.company} · {job.location}
                  </p>
                </div>
                <div className={styles.jobRight}>
                  <b>{job.match}% Match</b>
                  <Link to="/dashboard" className={styles.secondary}>
                    Save
                  </Link>
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={() => handleApply(job)}
                  >
                    Apply Now
                  </button>
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
              <h1>Your Profile</h1>
              <p>
                {user?.name ?? 'Candidate'}
                {profile?.currentRole ? ` · ${profile.currentRole}` : ''}
                {profile?.currentLocation ? ` · ${profile.currentLocation}` : ''}
              </p>
            </div>
            <div className={styles.headActions}>
              <Link to="/settings" className={styles.secondary}>
                Settings
              </Link>
              <Link to="/onboarding" className={styles.primary}>
                Edit Profile
              </Link>
            </div>
          </motion.header>

          <motion.section className={styles.card} variants={fadeUp}>
            <h2>Profile Snapshot</h2>
            <div className={styles.stats}>
              {[
                [`${strength}%`, 'Strength'],
                [String(profile?.skills.length ?? 0), 'Skills'],
                [
                  String(profile?.achievements.filter(Boolean).length ?? 0),
                  'Achievements',
                ],
                [interview ? `${interview.overall}` : '—', 'Interview'],
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
              <Link to="/dashboard">Go to Dashboard</Link>
              <Link to="/interview">AI Interview</Link>
              <Link to="/jobs">View Matches</Link>
            </div>
          </motion.section>
        </motion.main>
      </div>
    </div>
  )
}
