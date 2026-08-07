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
          Build your profile. <em>Interview with Ava.</em> Get scored.
        </>
      }
      subtitle="Sign up, complete About You and Skills, then take a live AI video interview. Ava asks resume-accurate questions, verifies one person on camera, and unlocks ranked matches from your talent score."
      primaryCta={{ label: 'Get Started', to: '/signup' }}
      secondaryCta={{ label: 'See the studio', to: '/interview' }}
      sections={[
        {
          title: '1. Create your account & profile',
          body: 'Sign up, upload your resume, and fill About You, Skills, and Performance so Ava can interview you accurately.',
        },
        {
          title: '2. Meet Ava in the interview studio',
          body: 'Enable camera and mic. Face tracking checks that only you are in frame. Ava asks live, resume-aware questions out loud.',
        },
        {
          title: '3. Get your talent & resume-fit score',
          body: 'Instant breakdown across communication, technical depth, problem solving, experience, and how well answers match your resume.',
        },
        {
          title: '4. Unlock ranked matches',
          body: 'Browse roles ranked by your interview score and apply with proof of skill — not just a static CV.',
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
            Ready to <em>get started</em>?
          </h2>
          <p>
            Build your profile, interview with Ava, and unlock matched roles with a real score.
          </p>
          <Link to="/signup" className={styles.primary}>
            Get Started →
          </Link>
        </div>
      </motion.section>
    </MarketingPage>
  )
}
