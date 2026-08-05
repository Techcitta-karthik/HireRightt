import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MarketingPage } from '../components/MarketingPage'
import styles from '../components/MarketingPage.module.css'

export function JobSeekersPage() {
  return (
    <MarketingPage
      kicker="FOR JOB SEEKERS"
      title={
        <>
          Find roles that fit you — not the other way <em>around</em>.
        </>
      }
      subtitle="Build one strong profile, get AI-matched to verified employers, and move faster from apply to offer."
      primaryCta={{ label: 'Create Your Profile', to: '/onboarding' }}
      secondaryCta={{ label: 'Browse Jobs', to: '/jobs' }}
      sections={[
        {
          title: 'AI Job Matching',
          body: 'We match your skills, experience, and goals to roles with high fit scores.',
        },
        {
          title: 'Secure Profile',
          body: 'Control visibility. Your data stays encrypted and private until you choose otherwise.',
        },
        {
          title: 'Faster Responses',
          body: 'Get discovered by verified employers and track applications in one dashboard.',
        },
      ]}
    >
      <motion.section
        className={styles.launchCta}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <motion.img
          src="/rocket.png"
          alt=""
          className={styles.launchRocket}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className={styles.launchCopy}>
          <h2>
            Take the <em>Right</em> step today
          </h2>
          <p>Create your free profile and let AI match you with better opportunities.</p>
          <Link to="/signup" className={styles.primary}>
            Get Started Free →
          </Link>
        </div>
      </motion.section>
    </MarketingPage>
  )
}
