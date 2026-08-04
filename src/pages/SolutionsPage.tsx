import { MarketingPage } from '../components/MarketingPage'

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
      primaryCta={{ label: 'Start Free', to: '/onboarding' }}
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
    />
  )
}
