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
          Interview first. <em>Get scored.</em> Unlock roles.
        </>
      }
      subtitle="HIRERIGHT works like CloudHire and Micro1 — prove yourself in a live AI video interview, then match to opportunities with a real score."
      primaryCta={{ label: 'Take AI Interview', to: '/signup' }}
      secondaryCta={{ label: 'See the studio', to: '/interview' }}
      sections={[
        {
          title: '1. Create your account',
          body: 'Sign up free. Optional short profile helps Ava tailor questions to your role.',
        },
        {
          title: '2. Enter the interview studio',
          body: 'Enable camera and mic. Meet Ava — she asks out loud; you answer by speaking.',
        },
        {
          title: '3. Get your talent score',
          body: 'Instant breakdown across communication, technical depth, problem solving, and experience.',
        },
        {
          title: '4. Unlock ranked matches',
          body: 'Browse roles ranked by your interview score and apply with proof of skill — not just a resume.',
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
            Ready to <em>interview</em> with Ava?
          </h2>
          <p>
            Join the video room in minutes. Your score unlocks matched roles on the dashboard.
          </p>
          <Link to="/signup" className={styles.primary}>
            Start AI Interview →
          </Link>
        </div>
      </motion.section>
    </MarketingPage>
  )
}
