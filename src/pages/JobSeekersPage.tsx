import { MarketingPage } from '../components/MarketingPage'

export function JobSeekersPage() {
  return (
    <MarketingPage
      kicker="FOR JOB SEEKERS"
      title={
        <>
          Your resume isn&apos;t enough. <em>Your interview score is.</em>
        </>
      }
      subtitle="Stand out with a live AI video interview. Ava scores how you communicate and think — then unlocks roles matched to that proof."
      primaryCta={{ label: 'Get Started', to: '/signup' }}
      secondaryCta={{ label: 'How it works', to: '/how-it-works' }}
      sections={[
        {
          title: 'Spoken video interview',
          body: 'Answer on camera like a real recruiter screen — not a multiple-choice quiz.',
        },
        {
          title: 'Shareable talent score',
          body: 'Show employers a scored breakdown: communication, depth, problem-solving, experience.',
        },
        {
          title: 'Matches unlock after you interview',
          body: 'Browse and apply to ranked roles once you have a score — interview-first hiring.',
        },
        {
          title: 'Practice and improve',
          body: 'Retake the AI interview anytime to raise your score and climb the match list.',
        },
      ]}
    />
  )
}
