import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

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

export function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.navbar}>
          <div className={styles.brand}>
            <h1>
              HRERIGHT<sup>TTT</sup>
            </h1>
            <p>
              TALENT <span>TO</span> TALENT
            </p>
          </div>

          <nav className={styles.navLinks}>
            <a href="#jobs">
              For Job Seekers <span className={styles.chevron} />
            </a>
            <a href="#why">
              Why HRERIGHT <span className={styles.chevron} />
            </a>
            <a href="#solutions">
              Solutions <span className={styles.chevron} />
            </a>
            <a href="#resources">
              Resources <span className={styles.chevron} />
            </a>
            <a href="#about">About Us</a>
          </nav>

          <div className={styles.navActions}>
            <Link to="/login" className={styles.loginBtn}>
              Login
            </Link>
            <Link to="/register" className={styles.ctaBtn}>
              Get Started Free <Icon name="arrow" />
            </Link>
          </div>
        </header>

        <main>
          <section className={styles.hero}>
            <div className={styles.heroLeft}>
              <span className={styles.kicker}>AI-POWERED HIRING PLATFORM</span>
              <h2>
                Your Dream Job
                <br />
                Deserves the
                <br />
                <em>Right</em> Start.
              </h2>
              <p>
                AI-powered matching, secure profiles, and faster opportunities
                — all in one place.
              </p>

              <div className={styles.heroActions}>
                <Link to="/register" className={styles.primaryHeroBtn}>
                  <Icon name="user" />
                  Create Your Profile
                </Link>
                <button type="button" className={styles.secondaryHeroBtn}>
                  <Icon name="play" />
                  How It Works
                </button>
              </div>

              <div className={styles.quickPoints}>
                <span>
                  <i className={styles.qIcon}>
                    <Icon name="bolt" />
                  </i>
                  AI Matching
                </span>
                <span>
                  <i className={styles.qIcon}>
                    <Icon name="shield" />
                  </i>
                  Secure & Private
                </span>
                <span>
                  <i className={styles.qIcon}>
                    <Icon name="star" />
                  </i>
                  Trusted by Top Employers
                </span>
              </div>

              <div className={styles.trustRow}>
                <p>
                  Trusted by 1000+ employers and millions of job seekers
                  worldwide.
                </p>
              </div>
            </div>

            <div className={styles.heroRight}>
              <div className={styles.dashboardCard}>
                <div className={styles.dashSidebar} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className={styles.dashMain}>
                  <div className={styles.dashTop}>
                    <strong>HRERIGHT</strong>
                    <span>Welcome back, Arjun!</span>
                  </div>
                  <div className={styles.dashGrid}>
                    <article>
                      <p>Profile Strength</p>
                      <div className={styles.progress}>
                        <strong>85%</strong>
                      </div>
                      <small>Very Strong</small>
                    </article>
                    <article>
                      <p>Top Job Matches</p>
                      <ul>
                        <li>
                          <span>Senior Frontend Developer</span>
                          <b>98%</b>
                        </li>
                        <li>
                          <span>Full Stack Engineer</span>
                          <b>95%</b>
                        </li>
                        <li>
                          <span>Software Engineer (AI/ML)</span>
                          <b>92%</b>
                        </li>
                      </ul>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.logos}>
            <p>Powering hiring for leading companies worldwide</p>
            <div className={styles.logoRow}>
              {COMPANIES.map((company) => (
                <div key={company.name} className={styles.logoItem}>
                  <img src={company.src} alt={`${company.name} logo`} />
                </div>
              ))}
            </div>
          </section>

          <section id="why" className={styles.featuresSection}>
            <span className={styles.kicker}>WHY JOB SEEKERS CHOOSE HRERIGHT</span>
            <h3>
              Everything you need to get hired,
              <br />
              faster and <em>smarter.</em>
            </h3>

            <div className={styles.featureGrid}>
              {FEATURES.map((feature) => (
                <article key={feature.title} className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <Icon name={feature.icon} />
                  </div>
                  <h4>{feature.title}</h4>
                  <p>{feature.desc}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.ctaStrip}>
            <div className={styles.rocket} aria-hidden="true">
              <div className={styles.rocketBody} />
              <div className={styles.rocketNose} />
              <div className={styles.rocketWindow} />
              <div className={styles.rocketFinLeft} />
              <div className={styles.rocketFinRight} />
              <div className={styles.rocketFlame} />
              <div className={styles.cloudA} />
              <div className={styles.cloudB} />
            </div>
            <div className={styles.ctaCopy}>
              <h3>
                Take the <em>Right</em> Step Today
              </h3>
              <p>
                Join thousands of job seekers who are building their future with
                HRERIGHT.
              </p>
              <div className={styles.stripActions}>
                <Link to="/register" className={styles.primaryHeroBtn}>
                  <Icon name="user" />
                  Create Your Profile — It&apos;s Free
                </Link>
                <Link to="/login">
                  Already have an account? <strong>Login</strong>
                </Link>
              </div>
            </div>
          </section>

          <section className={styles.stats}>
            {STATS.map((stat) => (
              <article key={stat.label}>
                <div className={styles.statIcon}>
                  <Icon name={stat.icon} />
                </div>
                <div>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}
