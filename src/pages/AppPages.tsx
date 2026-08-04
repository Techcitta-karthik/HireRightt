import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SiteNav } from '../components/SiteNav'
import { fadeUp, staggerContainer } from '../motion/variants'
import styles from './AppPages.module.css'

const MATCHES = [
  {
    title: 'Senior Frontend Developer',
    company: 'TechCitta Solutions',
    location: 'Hyderabad, India',
    match: '98%',
  },
  {
    title: 'Full Stack Engineer',
    company: 'InnovatTech',
    location: 'Bengaluru, India',
    match: '95%',
  },
  {
    title: 'Software Engineer (AI/ML)',
    company: 'MindCraft AI',
    location: 'Hyderabad, India',
    match: '92%',
  },
]

export function DashboardPage() {
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
              <h1>Welcome back, Arjun!</h1>
              <p>Let&apos;s find the right opportunities for you.</p>
            </div>
            <div className={styles.headActions}>
              <Link to="/jobs" className={styles.secondary}>
                Explore Jobs
              </Link>
              <Link to="/profile" className={styles.primary}>
                View Profile
              </Link>
            </div>
          </motion.header>

          <div className={styles.dashGrid}>
            <motion.article className={styles.card} variants={fadeUp}>
              <h2>Profile Strength</h2>
              <div className={styles.progress}>
                <strong>85%</strong>
              </div>
              <p className={styles.strong}>Very Strong</p>
              <p className={styles.muted}>
                Complete your profile to increase match accuracy.
              </p>
              <Link to="/onboarding" className={styles.link}>
                Improve Profile →
              </Link>
            </motion.article>

            <motion.article className={styles.card} variants={fadeUp}>
              <h2>Top Job Matches</h2>
              <ul className={styles.matchList}>
                {MATCHES.map((job) => (
                  <li key={job.title}>
                    <div>
                      <strong>{job.title}</strong>
                      <span>
                        {job.company} · {job.location}
                      </span>
                    </div>
                    <b>{job.match} Match</b>
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
                  ['12', 'Applied'],
                  ['5', 'In Review'],
                  ['3', 'Interviews'],
                  ['1', 'Offers'],
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
                <Link to="/jobs">Browse opportunities</Link>
                <Link to="/settings">Account settings</Link>
                <Link to="/onboarding">Edit profile wizard</Link>
                <Link to="/how-it-works">How HRERIGHT works</Link>
              </div>
            </motion.article>
          </div>
        </motion.main>
      </div>
    </div>
  )
}

export function JobsPage() {
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
              <p>AI-ranked roles matched to your profile and goals.</p>
            </div>
            <Link to="/onboarding" className={styles.primary}>
              Improve Matches
            </Link>
          </motion.header>

          <div className={styles.jobList}>
            {MATCHES.map((job) => (
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
                  <b>{job.match} Match</b>
                  <Link to="/dashboard" className={styles.secondary}>
                    Save Job
                  </Link>
                  <Link to="/dashboard" className={styles.primary}>
                    Apply Now
                  </Link>
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
              <p>Arjun Kumar · Software Engineer · Hyderabad, India</p>
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
                ['85%', 'Strength'],
                ['12', 'Skills'],
                ['3', 'Achievements'],
                ['Ready', 'Interview'],
              ].map(([value, label]) => (
                <div key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className={styles.quick}>
              <Link to="/dashboard">Go to Dashboard</Link>
              <Link to="/jobs">View Matches</Link>
              <Link to="/onboarding">Continue Onboarding</Link>
            </div>
          </motion.section>
        </motion.main>
      </div>
    </div>
  )
}
