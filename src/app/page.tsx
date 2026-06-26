import {
  LandingNavbar,
  LandingHero,
  ProblemSection,
  FeaturesSection,
  DashboardPreview,
  CtaBand,
  LandingFooter,
} from '@/features/landing'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--lp-page-bg)', color: 'var(--lp-text)', fontFamily: 'inherit' }}>
      <LandingNavbar />
      <LandingHero />
      <ProblemSection />
      <FeaturesSection />
      <DashboardPreview />
      <CtaBand />
      <LandingFooter />
    </div>
  )
}
