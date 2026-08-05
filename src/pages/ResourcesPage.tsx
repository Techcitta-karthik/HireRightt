import { MarketingPage } from '../components/MarketingPage'

export function ResourcesPage() {
  return (
    <MarketingPage
      kicker="RESOURCES"
      title={
        <>
          Prep for your <em>AI video interview.</em>
        </>
      }
      subtitle="Quick guidance so you walk into Ava’s studio ready — camera, mic, and clear spoken answers."
      primaryCta={{ label: 'Enter interview studio', to: '/signup' }}
      secondaryCta={{ label: 'How it works', to: '/how-it-works' }}
      sections={[
        {
          title: 'Setup checklist',
          body: 'Quiet room, good lighting, stable internet, Chrome or Edge, camera and mic allowed.',
        },
        {
          title: 'How to answer',
          body: 'Speak in 60–150 words. Structure: situation → action → result. Look at the camera.',
        },
        {
          title: 'What Ava scores',
          body: 'Communication clarity, technical depth, problem solving, and relevant experience.',
        },
        {
          title: 'After your score',
          body: 'Open Matches to apply. Retake the interview anytime to improve your ranking.',
        },
      ]}
    />
  )
}
