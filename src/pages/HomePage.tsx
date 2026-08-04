import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SiteNav } from '../components/SiteNav'
import styles from './HomePage.module.css'
import {
  easeOut,
  fadeIn,
  fadeUp,
  scaleIn,
  staggerContainer,
} from '../motion/variants'

const FEATURES = [
  {
    title: 'AI-Powered Matching',
    desc: 'Our AI finds the best jobs that match your skills, experience & goals.',
    icon: 'target',
  },
  {
    title: 'Secure & Private',
    desc: 'Your data is protected with enterprise-grade security.',
    icon: 'shield',
  },
  {
    title: 'Faster Opportunities',
    desc: 'Get discovered by top employers and hear back faster.',
    icon: 'bolt',
  },
  {
    title: 'Verified Employers',
    desc: 'Only trusted companies. Real jobs. Real opportunities.',
    icon: 'star',
  },
  {
    title: 'Track & Grow',
    desc: 'Monitor applications, interviews & offers in one place.',
    icon: 'chart',
  },
]

const COMPANIES = [
  { name: 'TATA', src: '/logos/tata.svg' },
  { name: 'WIPRO', src: '/logos/wipro.svg' },
  { name: 'Infosys', src: '/logos/infosys.svg' },
  { name: 'accenture', src: '/logos/accenture.svg' },
  { name: 'amazon', src: '/logos/amazon.svg' },
  { name: 'Deloitte', src: '/logos/deloitte.svg' },
]

const STATS = [
  { value: '10M+', label: 'Job Seekers', icon: 'people' },
  { value: '1000+', label: 'Top Employers', icon: 'briefcase' },
  { value: '95%', label: 'Success Rate', icon: 'badge' },
  { value: '150+', label: 'Countries', icon: 'globe' },
]

function Icon({ name }: { name: string }) {
  const map: Record<string, ReactNode> = {
    target: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="1.7" fill="currentColor" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3L5 6.5V11.5C5 16 8.2 19.8 12 21C15.8 19.8 19 16 19 11.5V6.5L12 3Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 12L11.2 13.7L14.8 10"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    bolt: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M13 2L5 13H11L10 22L19 10H13L13 2Z" fill="currentColor" />
      </svg>
    ),
    star: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3.5L14.6 9.1L20.8 9.8L16.2 13.9L17.5 20L12 16.8L6.5 20L7.8 13.9L3.2 9.8L9.4 9.1L12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 19V11M10 19V7M16 19V13M22 19H2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
    people: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M3.5 19C4.4 15.8 6.6 14 9 14C11.4 14 13.6 15.8 14.5 19M14.8 16.2C16 14.9 17.4 14.2 19 14.2C20.5 14.2 21.8 14.8 22.5 16.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
    briefcase: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12H21"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </svg>
    ),
    badge: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2L14.4 8.2L21 9L16.2 13.4L17.5 20L12 16.9L6.5 20L7.8 13.4L3 9L9.6 8.2L12 2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
    globe: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M3.5 12H20.5M12 3.5C14.5 6.2 15.8 9 15.8 12C15.8 15 14.5 17.8 12 20.5C9.5 17.8 8.2 15 8.2 12C8.2 9 9.5 6.2 12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </svg>
    ),
    play: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M7 5.5L14.5 10L7 14.5V5.5Z" fill="currentColor" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M4 16.5C5.1 13.9 7.2 12.5 10 12.5C12.8 12.5 14.9 13.9 16 16.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    arrow: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M4 10H16M16 10L11 5M16 10L11 15"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  }

  return <>{map[name]}</>
}

const viewOnce = {
  once: true,
  amount: 0.25,
} as const

export function HomePage() {
  return (
    <div className={styles.page}>
      <motion.div
        className={styles.dashBackdrop}
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, ease: easeOut, delay: 0.1 }}
      >
        <motion.img
          src="/dashboard-bg.png?v=4"
          alt=""
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      <div className={styles.shell}>
        <SiteNav />

        <main>
          <section className={styles.heroStage} aria-label="Hero">
            <div className={styles.heroHitArea}>
              <Link to="/onboarding" className={styles.srCta}>
                Create Your Profile
              </Link>
              <Link to="/how-it-works" className={styles.srCtaSecondary}>
                How It Works
              </Link>
            </div>
          </section>

          <div className={styles.contentPanel}>
            <motion.section
              className={styles.logos}
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={viewOnce}
            >
              <motion.p variants={fadeIn}>
                Powering hiring for leading companies worldwide
              </motion.p>
              <div className={styles.logoRow}>
                {COMPANIES.map((company) => (
                  <motion.div
                    key={company.name}
                    className={styles.logoItem}
                    variants={fadeUp}
                    whileHover={{ y: -3, opacity: 1 }}
                  >
                    <img src={company.src} alt={`${company.name} logo`} />
                  </motion.div>
                ))}
              </div>
            </motion.section>

            <motion.section
              id="why"
              className={styles.featuresSection}
              initial="hidden"
              whileInView="show"
              viewport={viewOnce}
              variants={staggerContainer}
            >
              <motion.span className={styles.kicker} variants={fadeUp}>
                WHY JOB SEEKERS CHOOSE HRERIGHT
              </motion.span>
              <motion.h3 variants={fadeUp}>
                Everything you need to get hired,
                <br />
                faster and <em>smarter.</em>
              </motion.h3>

              <div className={styles.featureGrid}>
                {FEATURES.map((feature) => (
                  <motion.article
                    key={feature.title}
                    className={styles.featureCard}
                    variants={fadeUp}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <div className={styles.featureIcon}>
                      <Icon name={feature.icon} />
                    </div>
                    <h4>{feature.title}</h4>
                    <p>{feature.desc}</p>
                  </motion.article>
                ))}
              </div>
            </motion.section>

            <motion.section
              className={styles.ctaStrip}
              variants={scaleIn}
              initial="hidden"
              whileInView="show"
              viewport={viewOnce}
            >
              <motion.div
                className={styles.rocket}
                aria-hidden="true"
                animate={{ y: [0, -8, 0], rotate: [0, -2, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className={styles.rocketBody} />
                <div className={styles.rocketNose} />
                <div className={styles.rocketWindow} />
                <div className={styles.rocketFinLeft} />
                <div className={styles.rocketFinRight} />
                <div className={styles.rocketFlame} />
                <div className={styles.cloudA} />
                <div className={styles.cloudB} />
              </motion.div>
              <div className={styles.ctaCopy}>
                <h3>
                  Take the <em>Right</em> Step Today
                </h3>
                <p>
                  Join thousands of job seekers who are building their future
                  with HRERIGHT.
                </p>
                <div className={styles.stripActions}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link to="/onboarding" className={styles.primaryHeroBtn}>
                      <Icon name="user" />
                      Create Your Profile — It&apos;s Free
                    </Link>
                  </motion.div>
                  <Link to="/login">
                    Already have an account? <strong>Login</strong>
                  </Link>
                </div>
              </div>
            </motion.section>

            <motion.section
              className={styles.stats}
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={viewOnce}
            >
              {STATS.map((stat) => (
                <motion.article
                  key={stat.label}
                  variants={fadeUp}
                  whileHover={{ y: -3 }}
                >
                  <div className={styles.statIcon}>
                    <Icon name={stat.icon} />
                  </div>
                  <div>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                </motion.article>
              ))}
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  )
}
