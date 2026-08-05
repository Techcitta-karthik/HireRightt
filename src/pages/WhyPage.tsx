import { MarketingPage } from '../components/MarketingPage'

export function WhyPage() {
  return (
    <MarketingPage
      kicker="WHY HIRERIGHT"
      title={
        <>
          Hiring that puts <em>talent</em> first.
        </>
      }
      subtitle="HIRERIGHT connects job seekers and employers with AI matching, verified opportunities, and privacy-first profiles."
      sections={[
        {
          title: 'Talent to Talent',
          body: 'Built for people who want meaningful matches — not endless noise.',
        },
        {
          title: 'Enterprise Security',
          body: 'Your profile is protected with encryption and clear consent controls.',
        },
        {
          title: 'Trusted Employers',
          body: 'Only verified companies. Real jobs. Real opportunities worldwide.',
        },
      ]}
    />
  )
}
