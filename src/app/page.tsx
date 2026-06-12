import {
  LandingNavbar,
  LandingHero,
  ProblemSection,
  FeaturesSection,
  DashboardPreview,
  CtaBand,
  FaqAccordion,
  LandingFooter,
} from '@/features/landing'

export default function Home() {
  return (
    <div className="bg-cloud">
      <LandingNavbar />
      <LandingHero />
      <ProblemSection />
      <FeaturesSection />
      <DashboardPreview />
      <CtaBand />
      <FaqAccordion />
      <LandingFooter />
    </div>
  )
}
