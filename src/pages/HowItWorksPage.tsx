import { MarketingPage } from '../components/MarketingPage'

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
      secondaryCta={{ label: 'See Opportunities', to: '/jobs' }}
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
    />
  )
}
