import { MarketingPage } from '../components/MarketingPage'

export function WhyPage() {
  return (
    <MarketingPage
      kicker="WHY HIRERIGHT"
      title={
        <>
          Hiring should start with a <em>conversation</em> — not a PDF.
        </>
      }
      subtitle="We built an AI interview studio so candidates prove skill live, and opportunities open based on performance — fair, fast, and structured."
      primaryCta={{ label: 'Take AI Interview', to: '/signup' }}
      secondaryCta={{ label: 'For candidates', to: '/job-seekers' }}
      sections={[
        {
          title: 'Interview-first by design',
          body: 'The product loop is signup → live AI interview → score → matches. Everything else supports that.',
        },
        {
          title: 'Consistent & fair',
          body: 'Same structured questions and scoring dimensions for every candidate in a role track.',
        },
        {
          title: 'Privacy-first',
          body: 'Your session stays yours. Camera and mic are used only for the interview experience.',
        },
        {
          title: 'Built for modern hiring',
          body: 'Inspired by platforms like CloudHire and Micro1 — video AI screens that replace resume roulette.',
        },
      ]}
    />
  )
}
