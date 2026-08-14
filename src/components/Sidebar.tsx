import type { WizardStep } from '../data/wizard'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { easeOut, fadeLeft, fadeUp, staggerContainer } from '../motion/variants'
import styles from './Sidebar.module.css'

const WHY_ITEMS = [
  'AI-Powered Matching',
  'Verified by Top Employers Globally',
  '100% Secure & Privacy-First',
  'Helping talent grow, one connection at a time',
]

interface SidebarProps {
  step?: WizardStep
}

export function Sidebar({ step = 1 }: SidebarProps) {
  const showImpactSidebar = step === 2 || step === 3 || step === 4 || step === 5
  const isPerformance = step === 3
  const isAiOrDone = step === 4 || step === 5
  const isDone = step === 5

  return (
    <motion.aside
      className={styles.sidebar}
      aria-label="HIRERIGHT introduction"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <motion.div
        className={styles.glowA}
        aria-hidden="true"
        animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={styles.glowB}
        aria-hidden="true"
        animate={{ opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <div className={styles.glowC} aria-hidden="true" />
      <div className={styles.wave} aria-hidden="true" />

      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <h1 className={styles.logo}>
            HIRERIGHT
            <sup className={styles.ttt}>TT</sup>
          </h1>
          <p className={styles.tagline}>
            TALENT <span>TO</span> TALENT
          </p>
        </Link>

        <AnimatePresence mode="wait">
          <motion.div
            key={showImpactSidebar ? `impact-${step}` : 'intro'}
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            {showImpactSidebar ? (
              <>
                <motion.div
                  className={styles.illusCard}
                  aria-hidden="true"
                  variants={fadeUp}
                  whileHover={{ y: -4, scale: 1.01 }}
                >
                  <div
                    className={
                      isDone
                        ? styles.checkBadge
                        : isPerformance
                          ? styles.chartBadge
                          : styles.codeBadge
                    }
                  >
                    {isDone ? (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 13L9.5 17.5L19 7"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : isPerformance ? (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 19V11M10 19V7M15 19V13M20 19H4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      '</>'
                    )}
                  </div>
                  <div className={styles.armchairScene}>
                    <div className={styles.plant}>
                      <span className={styles.leaf} />
                      <span className={styles.pot} />
                    </div>
                    <div className={styles.chair}>
                      <div className={styles.person}>
                        <span className={styles.head} />
                        <span className={styles.body} />
                      </div>
                      <div className={styles.laptop}>
                        <span className={styles.screen} />
                        <span className={styles.base} />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div className={styles.hero} variants={fadeUp}>
                  <h2>
                    {isDone ? (
                      <>
                        You&apos;re All Set! Let&apos;s Find You the{' '}
                        <em className={styles.accent}>Right</em> Opportunities.
                      </>
                    ) : isPerformance ? (
                      <>
                        Showcase Your Impact, Unlock More{' '}
                        <em className={styles.accent}>Opportunities</em>
                      </>
                    ) : isAiOrDone ? (
                      <>
                        You&apos;re on the <em className={styles.accent}>Right</em>{' '}
                        Path!
                      </>
                    ) : (
                      <>
                        Build Your Profile, Unlock{' '}
                        <em className={styles.accent}>Opportunities</em>
                      </>
                    )}
                  </h2>
                  <p>
                    {isDone
                      ? 'Your profile is complete and you are ready to explore opportunities that match your skills and goals.'
                      : isPerformance
                        ? 'Your achievements and performance highlight your value and help us match you with the right opportunities.'
                        : isAiOrDone
                          ? 'We’re excited to have you with us. Our AI interview will help you showcase your skills and connect you with the best opportunities.'
                          : 'Your skills and experience help us match you with the right opportunities.'}
                  </p>
                </motion.div>

                <motion.div
                  className={styles.safeCard}
                  variants={fadeUp}
                  whileHover={{ y: -3 }}
                >
                  <div className={styles.safeIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
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
                  </div>
                  <div>
                    <p className={styles.safeTitle}>Your journey is in safe hands.</p>
                    <ul className={styles.safeList}>
                      {WHY_ITEMS.map((item) => (
                        <motion.li
                          key={item}
                          variants={fadeLeft}
                          whileHover={{ x: 4 }}
                        >
                          <span className={styles.check} aria-hidden="true">
                            <svg viewBox="0 0 16 16" fill="none">
                              <path
                                d="M3.5 8.5L6.5 11.5L12.5 4.5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div className={styles.hero} variants={fadeUp}>
                  <h2>
                    Your Journey to the <em>Right</em> Opportunity Starts Here.
                  </h2>
                  <p>
                    Build a powerful profile that showcases who you are — and let
                    AI connect you with opportunities that truly fit.
                  </p>
                </motion.div>

                <motion.div
                  className={styles.featureCard}
                  variants={fadeUp}
                  whileHover={{ y: -4, scale: 1.01 }}
                >
                  <div className={styles.featureImage}>
                    <img
                      src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=640&q=80"
                      alt="Person celebrating at a mountain summit"
                    />
                    <div className={styles.featureOverlay} />
                  </div>
                  <p className={styles.featureCopy}>
                    One profile. Unlimited possibilities.
                    <br />
                    Built on trust. Powered by AI.
                  </p>
                </motion.div>

                <motion.div className={styles.why} variants={fadeUp}>
                  <h3>Why HIRERIGHT<sup>TT</sup></h3>
                  <ul>
                    {WHY_ITEMS.map((item) => (
                      <motion.li key={item} whileHover={{ x: 4 }}>
                        <span className={styles.check} aria-hidden="true">
                          <svg viewBox="0 0 16 16" fill="none">
                            <path
                              d="M3.5 8.5L6.5 11.5L12.5 4.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div
          className={styles.help}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: easeOut }}
          whileHover={{ y: -2 }}
        >
          <div className={styles.helpIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 14v-2a8 8 0 1 1 16 0v2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M4 14v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2Zm16 0v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M12 19v1a2.5 2.5 0 0 0 2.5 2.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className={styles.helpTitle}>Need help?</p>
            <a href="mailto:care@hirerighttt.com" className={styles.helpLink}>
              care@hirerighttt.com
            </a>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  )
}
