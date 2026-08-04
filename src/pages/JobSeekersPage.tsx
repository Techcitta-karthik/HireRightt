import { MarketingPage } from '../components/MarketingPage'

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
    />
  )
}
