import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SiteNav } from './SiteNav'
import { SiteFooter } from './SiteFooter'
import { fadeUp, staggerContainer } from '../motion/variants'
import styles from './MarketingPage.module.css'

type Section = {
  title: string
  body: string
}

type MarketingPageProps = {
  kicker: ReactNode
  title: ReactNode
  subtitle: ReactNode
  sections?: Section[]
  primaryCta?: { label: ReactNode; to: string }
  secondaryCta?: { label: ReactNode; to: string }
  children?: ReactNode
}

export function MarketingPage({
  kicker,
  title,
  subtitle,
  sections = [],
  primaryCta = { label: 'Get Started', to: '/signup' },
  secondaryCta = { label: 'How It Works', to: '/how-it-works' },
  children,
}: MarketingPageProps) {
  return (
    <div className={styles.page}>
      <div className={styles.topHeroBlock}>
        <div className={styles.shell}>
          <SiteNav variant="dark" />
          <motion.section
            className={styles.hero}
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.span className={styles.kicker} variants={fadeUp}>
              {kicker}
            </motion.span>
            <motion.h1 variants={fadeUp}>{title}</motion.h1>
            <motion.p variants={fadeUp}>{subtitle}</motion.p>
            <motion.div className={styles.actions} variants={fadeUp}>
              <Link to={primaryCta.to} className={styles.primary}>
                {primaryCta.label}
              </Link>
              {secondaryCta.to.startsWith('mailto:') ||
              secondaryCta.to.startsWith('http') ? (
                <a href={secondaryCta.to} className={styles.secondary}>
                  {secondaryCta.label}
                </a>
              ) : (
                <Link to={secondaryCta.to} className={styles.secondary}>
                  {secondaryCta.label}
                </Link>
              )}
            </motion.div>
          </motion.section>
        </div>
      </div>

      <div className={styles.shell}>
        <main className={styles.main}>
          {sections.length > 0 && (
            <motion.section
              className={styles.grid}
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
            >
              {sections.map((section, index) => (
                <motion.article
                  key={section.title}
                  className={styles.card}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                >
                  <span className={styles.stepNum}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                </motion.article>
              ))}
            </motion.section>
          )}

          {children}

          <motion.section
            className={styles.ctaBanner}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2>Ready to hire — or get hired — the right way?</h2>
              <p>Create a free account and run the full loop: profile, AI interview, matches, ATS.</p>
            </div>
            <div className={styles.ctaActions}>
              <Link to="/signup" className={styles.primary}>
                Get Started Free
              </Link>
              <Link to="/how-it-works" className={styles.secondary}>
                How It Works
              </Link>
            </div>
          </motion.section>
        </main>
      </div>

      <SiteFooter />
    </div>
  )
}
