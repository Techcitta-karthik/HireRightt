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
  kicker: string
  title: ReactNode
  subtitle: string
  sections?: Section[]
  primaryCta?: { label: string; to: string }
  secondaryCta?: { label: string; to: string }
  children?: ReactNode
}

export function MarketingPage({
  kicker,
  title,
  subtitle,
  sections = [],
  primaryCta = { label: 'Take AI Interview', to: '/signup' },
  secondaryCta = { label: 'How It Works', to: '/how-it-works' },
  children,
}: MarketingPageProps) {
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
          <motion.section className={styles.hero} variants={fadeUp}>
            <span className={styles.kicker}>{kicker}</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
            <div className={styles.actions}>
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
            </div>
          </motion.section>

          {sections.length > 0 && (
            <motion.section className={styles.grid} variants={staggerContainer}>
              {sections.map((section) => (
                <motion.article
                  key={section.title}
                  className={styles.card}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                >
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                </motion.article>
              ))}
            </motion.section>
          )}

          {children}
        </motion.main>
      </div>

      <SiteFooter />
    </div>
  )
}
