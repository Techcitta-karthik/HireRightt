import { MarketingPage } from '../components/MarketingPage'

export function AboutPage() {
  return (
    <MarketingPage
      kicker="ABOUT US"
      title={
        <>
          Talent to talent — that&apos;s the <em>Right</em> way.
        </>
      }
      subtitle="HIRERIGHT is building a privacy-first hiring platform where AI helps people find opportunities that truly fit."
      primaryCta={{ label: 'Join HIRERIGHT', to: '/onboarding' }}
      secondaryCta={{ label: 'Contact Support', to: 'mailto:care@HIRERIGHT.com' }}
      sections={[
        {
          title: 'Our Mission',
          body: 'Make hiring fairer, faster, and more human — powered by intelligent matching.',
        },
        {
          title: 'Our Promise',
          body: 'Your data is encrypted and never shared without consent. You stay in control.',
        },
        {
          title: 'Get Help',
          body: 'Need support? Reach us anytime at care@HIRERIGHT.com.',
        },
      ]}
    />
  )
}
