import { MarketingPage } from '../components/MarketingPage'

export function SolutionsPage() {
  return (
    <MarketingPage
      kicker="SOLUTIONS"
      title={
        <>
          One studio for <em>interview-ready</em> talent.
        </>
      }
      subtitle="HIRERIGHT helps candidates become interview-certified and discover roles ranked by real AI interview performance."
      primaryCta={{ label: 'Get Started', to: '/signup' }}
      secondaryCta={{ label: 'How it works', to: '/how-it-works' }}
      sections={[
        {
          title: 'Candidate interview studio',
          body: 'Live video room with Ava — device check, spoken Q&A, captions, and instant scoring.',
        },
        {
          title: 'Talent scorecards',
          body: 'Dashboard and profile surface overall score, category breakdown, strengths, and next steps.',
        },
        {
          title: 'Score-gated opportunities',
          body: 'Job matches unlock after your AI interview so applications carry proof of skill.',
        },
        {
          title: 'Role-tailored questions',
          body: 'Pick your track and level — Ava asks questions relevant to how you want to get hired.',
        },
      ]}
    />
  )
}
