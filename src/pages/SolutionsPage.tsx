import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MarketingPage } from '../components/MarketingPage'
import styles from '../components/MarketingPage.module.css'

export function SolutionsPage() {
  return (
    <MarketingPage
      kicker="SOLUTIONS"
      title={
        <>
          Solutions for seekers and <em>hiring teams</em>.
        </>
      }
      subtitle="From profile building to AI interviews and employer matching — everything in one hiring platform."
      primaryCta={{ label: 'Start Free', to: '/signup' }}
      secondaryCta={{ label: 'Talk to Us', to: '/about' }}
      sections={[
        {
          title: 'For Candidates',
          body: 'Profile wizard, skills tracking, AI interview, and personalized job matches.',
        },
        {
          title: 'For Employers',
          body: 'Discover verified talent faster with AI ranking and secure candidate profiles.',
        },
        {
          title: 'For Teams',
          body: 'Track applications, interviews, and offers with one shared hiring workspace.',
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
            Launch with the <em>Right</em> platform
          </h2>
          <p>One place for profiles, AI interviews, scoring, and job matches.</p>
          <Link to="/signup" className={styles.primary}>
            Start Free →
          </Link>
        </div>
      </motion.section>
    </MarketingPage>
  )
}
