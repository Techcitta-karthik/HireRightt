import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MarketingPage } from '../components/MarketingPage'
import styles from '../components/MarketingPage.module.css'

export function HowItWorksPage() {
  return (
    <MarketingPage
      kicker="HOW IT WORKS"
      title={
        <>
          Four steps to the <em>Right</em> start.
        </>
      }
      subtitle="Create your profile, add skills and proof of impact, complete a short AI interview, then explore matched roles."
      primaryCta={{ label: 'Create Your Profile', to: '/onboarding' }}
      secondaryCta={{ label: 'Take AI Interview', to: '/interview' }}
      sections={[
        {
          title: '1. Build Your Profile',
          body: 'Upload your resume and share who you are, what drives you, and your strengths.',
        },
        {
          title: '2. Add Skills & Experience',
          body: 'Highlight skills and work history so AI can understand your expertise.',
        },
        {
          title: '3. Showcase Performance',
          body: 'Add achievements, metrics, awards, and certifications that prove your impact.',
        },
        {
          title: '4. AI Interview & Match',
          body: 'Complete a short AI interview, then get matched with verified opportunities.',
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
            Ready to <em>launch</em> your next move?
          </h2>
          <p>
            Sign up free, build your profile, and take the AI interview in
            minutes.
          </p>
          <Link to="/signup" className={styles.primary}>
            Get Started Now →
          </Link>
        </div>
      </motion.section>
    </MarketingPage>
  )
}
