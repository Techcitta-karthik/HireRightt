import { MarketingPage } from '../components/MarketingPage'

export function ResourcesPage() {
  return (
    <MarketingPage
      kicker="RESOURCES"
      title={
        <>
          Guides to help you get hired <em>smarter</em>.
        </>
      }
      subtitle="Interview tips, profile best practices, and product updates — practical resources for your next move."
      primaryCta={{ label: 'Build Profile', to: '/onboarding' }}
      secondaryCta={{ label: 'How It Works', to: '/how-it-works' }}
      sections={[
        {
          title: 'Profile Playbook',
          body: 'How to write strengths, achievements, and skills that improve match accuracy.',
        },
        {
          title: 'AI Interview Prep',
          body: 'What to expect in a 15-minute AI interview and how to showcase impact.',
        },
        {
          title: 'Career Updates',
          body: 'Product news, hiring trends, and tips from the HIRERIGHT team.',
        },
      ]}
    />
  )
}
