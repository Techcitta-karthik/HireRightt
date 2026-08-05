import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SiteNav } from '../components/SiteNav'
import { SiteFooter } from '../components/SiteFooter'
import styles from './HomePage.module.css'
import { fadeIn, fadeUp, scaleIn, staggerContainer } from '../motion/variants'

const FEATURES = [
  {
    title: 'Live AI Video Interview',
    desc: 'Meet Ava on camera — she asks out loud, you answer spoken, like a real screen.',
    icon: 'bolt',
  },
  {
    title: 'Instant Talent Score',
    desc: 'Get scored on communication, depth, problem-solving, and experience in minutes.',
    icon: 'badge',
  },
  {
    title: 'Interview-First Matching',
    desc: 'Unlock ranked roles only after your AI interview — employers see proof, not just a resume.',
    icon: 'briefcase',
  },
  {
    title: 'Scored Profile Card',
    desc: 'Your scorecard travels with you — strengths, categories, and interview-ready status.',
    icon: 'user',
  },
  {
    title: 'Private & Fair',
    desc: 'Structured questions, consistent scoring, and your data stays under your control.',
    icon: 'lock',
  },
]

const STEPS = [
  {
    title: 'Sign Up Free',
    desc: 'Create your account in under a minute — no long forms to start.',
    icon: 'user',
  },
  {
    title: 'Take the AI Interview',
    desc: 'Join the video room with Ava. Speak your answers. Get a live transcript.',
    icon: 'bolt',
  },
  {
    title: 'Get Your Score',
    desc: 'Instant report across four dimensions — know exactly where you stand.',
    icon: 'badge',
  },
  {
    title: 'Unlock Matched Roles',
    desc: 'Browse jobs ranked by your interview score and apply with proof of skill.',
    icon: 'briefcase',
  },
]

const RATINGS = [
  { score: '4.8', label: 'Job Seeker Rating' },
  { score: '4.7', label: 'Employer Rating' },
]

const COMPANIES = [
  { name: 'TATA', src: '/logos/tata.png', tall: true },
  { name: 'WIPRO', src: '/logos/wipro.png', tall: true },
  { name: 'Infosys', src: '/logos/infosys.png' },
  { name: 'accenture', src: '/logos/accenture.svg' },
  { name: 'amazon', src: '/logos/amazon.svg' },
  { name: 'Deloitte', src: '/logos/deloitte.svg' },
]

function Icon({ name }: { name: string }) {
  const map: Record<string, ReactNode> = {
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
    lock: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M8 10V7.5A4 4 0 0 1 16 7.5V10"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="12" cy="15" r="1.6" fill="currentColor" />
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
    doc: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 3.5H14L18.5 8V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M14 3.5V8H18.5M8.8 12H15.2M8.8 15.5H13"
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
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M8.5 12.2L11 14.7L15.5 9.7"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
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
  }

  return <>{map[name]}</>
}

function Stars({ score }: { score: string }) {
  const value = parseFloat(score)
  return (
    <span className={styles.stars} aria-label={`${score} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          aria-hidden="true"
          style={{ opacity: i <= Math.round(value) ? 1 : 0.3 }}
        >
          <path
            d="M10 2.5L12.2 7.2L17.3 7.8L13.5 11.2L14.5 16.3L10 13.7L5.5 16.3L6.5 11.2L2.7 7.8L7.8 7.2L10 2.5Z"
            fill="currentColor"
          />
        </svg>
      ))}
    </span>
  )
}

const viewOnce = { once: true, amount: 0.25 } as const

export function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <SiteNav />

        <main>
          <section className={styles.hero}>
            <motion.div
              className={styles.heroCopy}
              initial="hidden"
              animate="show"
              variants={staggerContainer}
            >
              <motion.span className={styles.kicker} variants={fadeUp}>
                <i className={styles.kickerIcon}>
                  <Icon name="bolt" />
                </i>
                AI VIDEO INTERVIEW PLATFORM
              </motion.span>

              <motion.h1 variants={fadeUp}>
                Prove your skills
                <br />
                in a live
                <br />
                <em>AI interview.</em>
              </motion.h1>

              <motion.p className={styles.heroSub} variants={fadeUp}>
                Camera on. Speak with Ava. Get scored instantly —
                <br />
                then unlock roles matched to your interview.
              </motion.p>

              <motion.div className={styles.heroActions} variants={fadeUp}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/signup" className={styles.primaryBtn}>
                    <Icon name="bolt" />
                    Take AI Interview
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/how-it-works" className={styles.secondaryBtn}>
                    <span className={styles.playBox} aria-hidden="true">
                      <Icon name="play" />
                    </span>
                    See how it works
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div className={styles.quickPoints} variants={fadeUp}>
                <div className={styles.quickItem}>
                  <i className={styles.qIcon}>
                    <Icon name="bolt" />
                  </i>
                  <div>
                    <strong>Live video AI</strong>
                    <span>Spoken answers</span>
                  </div>
                </div>
                <div className={styles.quickItem}>
                  <i className={styles.qIcon}>
                    <Icon name="badge" />
                  </i>
                  <div>
                    <strong>Instant score</strong>
                    <span>4 skill dimensions</span>
                  </div>
                </div>
                <div className={styles.quickItem}>
                  <i className={styles.qIcon}>
                    <Icon name="briefcase" />
                  </i>
                  <div>
                    <strong>Unlock matches</strong>
                    <span>Apply with proof</span>
                  </div>
                </div>
              </motion.div>

              <motion.div className={styles.trustRow} variants={fadeUp}>
                <div className={styles.avatars} aria-hidden="true">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces"
                    alt=""
                  />
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=faces"
                    alt=""
                  />
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces"
                    alt=""
                  />
                  <img
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=64&h=64&fit=crop&crop=faces"
                    alt=""
                  />
                </div>
                <p>
                  <strong>Trusted by 1000+ employers</strong>
                  <span>and millions of job seekers worldwide.</span>
                </p>
              </motion.div>
            </motion.div>

          </section>

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
                  className={
                    company.tall
                      ? `${styles.logoItem} ${styles.logoTall}`
                      : styles.logoItem
                  }
                  variants={fadeUp}
                  whileHover={{ y: -3 }}
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
            <motion.span className={styles.kickerPill} variants={fadeUp}>
              WHY CANDIDATES CHOOSE HIRERIGHT
            </motion.span>
            <motion.h2 className={styles.featuresTitle} variants={fadeUp}>
              An AI interview platform —
              <br />
              not just another <em>job board.</em>
            </motion.h2>

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
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </motion.article>
              ))}
            </div>
          </motion.section>

          <motion.section
            className={styles.howSection}
            initial="hidden"
            whileInView="show"
            viewport={viewOnce}
            variants={staggerContainer}
          >
            <motion.h2 className={styles.sectionTitle} variants={fadeUp}>
              How It Works
            </motion.h2>

            <div className={styles.stepsRow}>
              {STEPS.map((step, index) => (
                <motion.div key={step.title} className={styles.step} variants={fadeUp}>
                  <motion.div
                    className={styles.stepCircle}
                    whileHover={{ scale: 1.06 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  >
                    <Icon name={step.icon} />
                  </motion.div>
                  <h3>
                    <em>{index + 1}</em> {step.title}
                  </h3>
                  <p>{step.desc}</p>
                </motion.div>
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
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src="/rocket.png" alt="" className={styles.rocketImg} />
            </motion.div>

            <div className={styles.ctaCopy}>
              <h2>
                Ready for your <em>AI interview?</em>
              </h2>
              <p>
                Sign up, join Ava in the video room, and unlock matched roles with your score.
              </p>
              <motion.div
                className={styles.stripActions}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/signup" className={styles.primaryBtn}>
                  Start AI Interview
                  <span aria-hidden="true">→</span>
                </Link>
              </motion.div>
            </div>

            <div className={styles.ratings}>
              {RATINGS.map((rating) => (
                <div key={rating.label} className={styles.rating}>
                  <strong>
                    {rating.score}
                    <span>/5</span>
                  </strong>
                  <Stars score={rating.score} />
                  <p>{rating.label}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </main>
      </div>

      <SiteFooter />
    </div>
  )
}
