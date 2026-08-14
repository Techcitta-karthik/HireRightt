import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SiteNav } from '../components/SiteNav'
import { SiteFooter } from '../components/SiteFooter'
import styles from './HomePage.module.css'
import { fadeUp, scaleIn, staggerContainer } from '../motion/variants'

const TRUSTED_COMPANIES = [
  { name: 'TATA', logo: '/logos/tata.png' },
  { name: 'Wipro', logo: '/logos/wipro.png' },
  { name: 'Infosys', logo: '/logos/infosys.png' },
  { name: 'Accenture', logo: '/logos/accenture.svg' },
  { name: 'Amazon', logo: '/logos/amazon.svg' },
  { name: 'Deloitte', logo: '/logos/deloitte.svg' },
]

const FEATURES_GRID = [
  {
    title: 'AI-Powered Matching',
    desc: 'Match candidates to jobs with intelligent AI scoring.',
    icon: 'wand',
    link: '/solutions',
  },
  {
    title: 'Smart Automation',
    desc: 'Automate screening, follow-ups, and interview scheduling.',
    icon: 'zap',
    link: '/solutions',
  },
  {
    title: 'Collaborative Hiring',
    desc: 'Work seamlessly with your team in real-time.',
    icon: 'users',
    link: '/solutions',
  },
  {
    title: 'Analytics & Insights',
    desc: 'Make data-driven hiring decisions with ease.',
    icon: 'chart',
    link: '/solutions',
  },
]

const METRICS_STATS = [
  { number: '2,000+', label: 'Active Companies', icon: 'building' },
  { number: '150K+', label: 'Candidates Hired', icon: 'user-check' },
  { number: '98%', label: 'Client Satisfaction', icon: 'star' },
  { number: '60%', label: 'Faster Time to Hire', icon: 'clock' },
]

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Create a Job',
    desc: 'Post your job in minutes and attract the right candidates.',
    icon: 'file-plus',
  },
  {
    step: '02',
    title: 'AI Matching',
    desc: 'Our AI finds and ranks the best candidates for your role.',
    icon: 'brain',
  },
  {
    step: '03',
    title: 'Screen & Shortlist',
    desc: 'Review AI insights and shortlist the best matches.',
    icon: 'check-list',
  },
  {
    step: '04',
    title: 'Interview',
    desc: 'Schedule and conduct interviews seamlessly with your team.',
    icon: 'calendar-video',
  },
  {
    step: '05',
    title: 'Hire',
    desc: 'Make the offer and onboard top talent faster.',
    icon: 'badge-check',
  },
]

const TESTIMONIALS = [
  {
    quote:
      'HIRERIGHTTT has transformed our hiring process. The AI matching is incredibly accurate and saves us hours of manual screening.',
    name: 'Sneha Iyer',
    role: 'Head of Talent Acquisition',
    company: 'Cognizant',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=faces',
  },
  {
    quote:
      'The pipeline visibility and analytics help us make better decisions. Our time-to-hire has reduced by 40%.',
    name: 'Rahul Kapoor',
    role: 'Talent Manager',
    company: 'Deloitte',
    avatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&crop=faces',
  },
  {
    quote:
      'A must-have platform for modern recruitment teams. Intuitive, powerful, and easy to use.',
    name: 'Ananya Rao',
    role: 'HR Business Partner',
    company: 'Infosys',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces',
  },
]



const RESOURCES_ARTICLES = [
  {
    tag: 'Best Practices',
    title: '10 AI Recruiting Best Practices for 2024',
    date: 'May 10, 2024',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=260&fit=crop',
  },
  {
    tag: 'Hiring Guide',
    title: 'How to Reduce Time to Hire by 60%',
    date: 'May 8, 2024',
    readTime: '8 min read',
    image:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=260&fit=crop',
  },
  {
    tag: 'Case Study',
    title: 'How TechCita Built a Winning Engineering Team',
    date: 'May 5, 2024',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=260&fit=crop',
  },
  {
    tag: 'Recruitment Tips',
    title: 'Smart Screening: The Future of Candidate Evaluation',
    date: 'May 2, 2024',
    readTime: '7 min read',
    image:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=260&fit=crop',
  },
]

const viewOnce = { once: true, amount: 0.2 } as const

export function HomePage() {
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0)

  return (
    <div className={styles.page}>
      {/* TOP HERO HEADER BLOCK with home back.png background */}
      <div className={styles.topHeroBlock}>
        <div className={styles.shell}>
          <SiteNav />

          {/* HERO SECTION */}
          <section className={styles.heroSection}>
            <div className={styles.heroGrid}>
              <motion.div
                className={styles.heroCopy}
                initial="hidden"
                animate="show"
                variants={staggerContainer}
              >
                <motion.h1 className={styles.heroTitle} variants={fadeUp}>
                  Your Dream Job
                  <br />
                  Deserves the
                  <br />
                  <span className={styles.heroTitleRed}>Right</span> Start.
                </motion.h1>

                <motion.p className={styles.heroDesc} variants={fadeUp}>
                  Background screening you can trust.
                  <br />
                  Confidence you can carry into your future.
                </motion.p>

                <motion.div className={styles.heroActions} variants={fadeUp}>
                  <Link to="/signup" className={styles.getStartedRedBtn}>
                    Get Started
                    <span className={styles.btnCircleIcon}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </Link>
                  <Link to="/how-it-works" className={styles.howItWorksOutlineBtn}>
                    How It Works
                    <span className={styles.btnCircleIcon}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </span>
                  </Link>
                </motion.div>

                <motion.div className={styles.socialProofRow} variants={fadeUp}>
                  <div className={styles.avatarGroup}>
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop"
                      alt=""
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop"
                      alt=""
                    />
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop"
                      alt=""
                    />
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop"
                      alt=""
                    />
                  </div>
                  <p className={styles.proofText}>
                    <strong>Trusted by 1000+ employers</strong>
                    <br />
                    and millions of job seekers worldwide.
                  </p>
                </motion.div>
              </motion.div>

              {/* HERO RIGHT SIDE IMAGE + FTY FLOATING MESSAGES IMAGE */}
              <motion.div
                className={styles.heroRightVisual}
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.heroTechRing} />
                <div className={styles.heroTTechRing} />
                <img
                  src="/bg.png"
                  alt="Your Dream Job Deserves The Right Start"
                  className={styles.heroPersonImg}
                />

                {/* Floating Badges: Fast.png, Trusted.png, privacy.png */}
                <motion.img
                  src="/Fast.png"
                  alt="Fast & Secure"
                  className={styles.floatingBadgeFast}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.img
                  src="/Trusted.png"
                  alt="Trusted by Employers"
                  className={styles.floatingBadgeTrusted}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                />
                <motion.img
                  src="/privacy.png"
                  alt="Your Privacy Protected"
                  className={styles.floatingBadgePrivacy}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                />
              </motion.div>
            </div>
          </section>

          {/* TRUSTED LOGOS STRIP (INSIDE TOP HERO BLOCK) */}
          <section className={styles.logosStrip}>
            <div className={styles.logosCardBox}>
              <p className={styles.logosTitle}>
                Powering Confident Hiring Decisions for Top Companies
              </p>
              <div className={styles.logosRow}>
                {TRUSTED_COMPANIES.map((company, index) => (
                  <div key={company.name} className={styles.logoItemWrapper}>
                    <div className={styles.logoItem}>
                      <img
                        src={company.logo}
                        alt={company.name}
                        className={`${styles.companyLogoImg} ${styles['logo_' + company.name.toLowerCase()] || ''}`}
                      />
                    </div>
                    {index < TRUSTED_COMPANIES.length - 1 && (
                      <div className={styles.logoDivider} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className={styles.shell}>
        <main>

          {/* FEATURES GRID SECTION */}
          <motion.section
            className={styles.featuresSection}
            initial="hidden"
            whileInView="show"
            viewport={viewOnce}
            variants={staggerContainer}
          >
            <div className={styles.sectionHeader}>
              <motion.h2 variants={fadeUp}>
                Everything you need to hire smarter
              </motion.h2>
              <motion.p variants={fadeUp}>
                A complete recruitment platform built for modern teams.
              </motion.p>
            </div>

            <div className={styles.featuresLayout}>
              {/* Left 4 Cards */}
              <div className={styles.grid4Cards}>
                {FEATURES_GRID.map((feat) => (
                  <motion.div
                    key={feat.title}
                    className={styles.featureCard}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                  >
                    <div className={styles.featIconBox}>
                      {feat.icon === 'wand' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 4l5 5L7 21l-5-5z" />
                          <path d="M18 7l-2-2" />
                        </svg>
                      )}
                      {feat.icon === 'zap' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                      )}
                      {feat.icon === 'users' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      )}
                      {feat.icon === 'chart' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="20" x2="18" y2="10" />
                          <line x1="12" y1="20" x2="12" y2="4" />
                          <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                      )}
                    </div>
                    <h3>{feat.title}</h3>
                    <p>{feat.desc}</p>
                    <Link to={feat.link} className={styles.learnMore}>
                      Learn more →
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Right Hero Feature Banner */}
              <motion.div className={styles.heroFeatureBanner} variants={scaleIn}>
                <div className={styles.bannerBadge}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
                  </svg>
                  Top 1% Candidates
                </div>
                <h2>
                  Hire faster.
                  <br />
                  Build stronger teams.
                </h2>
                <p>
                  Join thousands of recruiters who save hours every week with{' '}
                  HIRERIGHT<sup>TT</sup>.
                </p>
                <Link to="/signup" className={styles.bannerBtn}>
                  Explore Platform →
                </Link>

                <div className={styles.bannerImageWrapper}>
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=350&fit=crop"
                    alt="Team collaboration"
                  />
                  <div className={styles.floatingSavingsBadge}>
                    <span>Time Saved</span>
                    <strong>+62%</strong>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Metrics Row */}
            <div className={styles.metricsStrip}>
              <div className={styles.metricsGrid}>
                {METRICS_STATS.map((metric) => (
                  <div key={metric.label} className={styles.metricCard}>
                    <div className={styles.mIcon}>
                      {metric.icon === 'building' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                          <line x1="9" y1="6" x2="9" y2="6.01" />
                          <line x1="15" y1="6" x2="15" y2="6.01" />
                          <line x1="9" y1="10" x2="9" y2="10.01" />
                          <line x1="15" y1="10" x2="15" y2="10.01" />
                          <line x1="9" y1="14" x2="9" y2="14.01" />
                          <line x1="15" y1="14" x2="15" y2="14.01" />
                          <line x1="9" y1="18" x2="15" y2="18" />
                        </svg>
                      )}
                      {metric.icon === 'user-check' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <polyline points="17 11 19 13 23 9" />
                        </svg>
                      )}
                      {metric.icon === 'star' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#38bdf8" stroke="#38bdf8" strokeWidth="1">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      )}
                      {metric.icon === 'clock' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3>{metric.number}</h3>
                      <p>{metric.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.metricsCtaBox}>
                <div>
                  <h4>Ready to transform your hiring process?</h4>
                  <p>Start your free trial. No credit card required.</p>
                </div>
                <Link to="/signup" className={styles.ctaBoxBtn}>
                  Get Started Free →
                </Link>
              </div>
            </div>
          </motion.section>

          {/* PROCESS SECTION */}
          <motion.section
            className={styles.processSection}
            initial="hidden"
            whileInView="show"
            viewport={viewOnce}
            variants={staggerContainer}
          >
            <div className={styles.sectionHeader}>
              <motion.h2 variants={fadeUp}>A smarter way to hire</motion.h2>
              <motion.p variants={fadeUp}>
                From job posting to offer, HIRERIGHT<sup>TT</sup> simplifies every step.
              </motion.p>
            </div>

            <div className={styles.processFlow}>
              {PROCESS_STEPS.map((step, idx) => (
                <motion.div key={step.title} className={styles.stepItem} variants={fadeUp}>
                  <div className={styles.stepCircleWrapper}>
                    <div className={styles.stepIconCircle}>
                      {step.icon === 'file-plus' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="12" y1="18" x2="12" y2="12" />
                          <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                      )}
                      {step.icon === 'brain' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a5 5 0 0 0-4.9 6 4 4 0 0 0-3.1 4 4 4 0 0 0 2 3.5 4 4 0 0 0 4 3.5 5 5 0 0 0 4-2 5 5 0 0 0 4 2 4 4 0 0 0 4-3.5 4 4 0 0 0 2-3.5 4 4 0 0 0-3.1-4A5 5 0 0 0 12 2z" />
                        </svg>
                      )}
                      {step.icon === 'check-list' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                          <path d="M9 12l2 2 4-4" />
                        </svg>
                      )}
                      {step.icon === 'calendar-video' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      )}
                      {step.icon === 'badge-check' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      )}
                    </div>
                    {idx < PROCESS_STEPS.length - 1 && (
                      <div className={styles.arrowConnector}>→</div>
                    )}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* TESTIMONIALS SECTION */}
          <motion.section
            className={styles.testimonialsSection}
            initial="hidden"
            whileInView="show"
            viewport={viewOnce}
            variants={staggerContainer}
          >
            <div className={styles.sectionHeader}>
              <motion.h2 variants={fadeUp}>Loved by recruiters worldwide</motion.h2>
              <motion.p variants={fadeUp}>
                Here's what our customers say about HIRERIGHT<sup>TT</sup>
              </motion.p>
            </div>

            <div className={styles.testimonialsGrid}>
              {TESTIMONIALS.map((t) => (
                <motion.div key={t.name} className={styles.testimonialCard} variants={fadeUp}>
                  <div className={styles.cardStars}>
                    <div style={{ display: 'flex', gap: 2, color: '#f59e0b' }}>
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className={styles.cardQuote}>"{t.quote}"</p>
                  <div className={styles.cardAuthor}>
                    <img src={t.avatar} alt={t.name} />
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                      <small>{t.company}</small>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className={styles.dotsRow}>
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.dot} ${activeTestimonialIndex === idx ? styles.dotActive : ''
                    }`}
                  onClick={() => setActiveTestimonialIndex(idx)}
                  aria-label={`Go to testimonial slide ${idx + 1}`}
                />
              ))}
            </div>
          </motion.section>



          {/* RESOURCES SECTION */}
          <motion.section
            className={styles.resourcesSection}
            initial="hidden"
            whileInView="show"
            viewport={viewOnce}
            variants={staggerContainer}
          >
            <div className={styles.resourcesHeader}>
              <div>
                <h2>Resources to help you hire better</h2>
              </div>
              <Link to="/resources" className={styles.viewAllLink}>
                View all resources →
              </Link>
            </div>

            <div className={styles.resourcesGrid}>
              {RESOURCES_ARTICLES.map((article) => (
                <motion.div
                  key={article.title}
                  className={styles.articleCard}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                >
                  <div className={styles.articleImgWrapper}>
                    <img src={article.image} alt={article.title} />
                    <span className={styles.articleTag}>{article.tag}</span>
                  </div>
                  <div className={styles.articleBody}>
                    <h3>{article.title}</h3>
                    <div className={styles.articleMeta}>
                      <span>{article.date}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Newsletter subscription card */}
              <motion.div className={styles.newsletterCard} variants={fadeUp}>
                <div className={styles.newsletterIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h3>Stay updated</h3>
                <p>with the latest hiring insights and product updates.</p>
                <form
                  className={styles.newsletterForm}
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    className={styles.newsInput}
                  />
                  <button type="submit" className={styles.newsBtn}>
                    Subscribe
                  </button>
                </form>
                <span className={styles.newsNote}>
                  No spam, unsubscribe anytime.
                </span>
              </motion.div>
            </div>
          </motion.section>

          {/* BOTTOM CTA BANNER */}
          <motion.section
            className={styles.ctaBannerSection}
            initial="hidden"
            whileInView="show"
            viewport={viewOnce}
            variants={scaleIn}
          >
            <div className={styles.ctaBannerContent}>
              <div className={styles.ctaBannerText}>
                <h2>Ready to hire the right talent?</h2>
                <p>
                  Join thousands of recruitment teams using HIRERIGHT<sup>TT</sup> to build
                  high-performing teams.
                </p>
              </div>

              <div className={styles.ctaBannerBtns}>
                <Link to="/signup" className={styles.ctaWhiteBtn}>
                  Get Started Free →
                </Link>
                <Link to="/how-it-works" className={styles.ctaOutlineBtn}>
                  Book a Demo
                </Link>
              </div>
            </div>
          </motion.section>
        </main>
      </div>

      <SiteFooter />
    </div>
  )
}
