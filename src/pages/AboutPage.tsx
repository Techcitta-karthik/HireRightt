import { MarketingPage } from '../components/MarketingPage'

export function AboutPage() {
  return (
    <MarketingPage
      kicker="ABOUT"
      title={
        <>
          Talent to talent — through a <em>real AI interview.</em>
        </>
      }
      subtitle="HIRERIGHT exists so job seekers can prove ability on camera and move forward with a score employers can trust."
      primaryCta={{ label: 'Get Started', to: '/signup' }}
      secondaryCta={{ label: 'Why HIRERIGHT', to: '/why' }}
      sections={[
        {
          title: 'Our mission',
          body: 'Replace resume black holes with structured AI video interviews that showcase how people actually communicate and think.',
        },
        {
          title: 'What we built',
          body: 'An interview studio, scoring engine, and match experience — not another generic job board.',
        },
        {
          title: 'For candidates first',
          body: 'You own your score. Retake, improve, and unlock better-ranked opportunities over time.',
        },
        {
          title: 'Privacy & fairness',
          body: 'Same interview format for everyone. Your data stays private and under your control.',
        },
      ]}
    />
  )
}
