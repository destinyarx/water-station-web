import { LandingFooter } from '@/features/landing'

import { LegalMarkdown } from './legal-markdown'
import { LegalTopBar } from './legal-top-bar'

export function LegalPageShell({ source }: { source: string }) {
  return (
    <div className="min-h-screen bg-(--lp-page-bg) text-(--lp-text)">
      <LegalTopBar />
      <main className="mx-auto max-w-[860px] px-5 py-12 sm:px-8 sm:py-16">
        <article>
          <LegalMarkdown source={source} />
        </article>
      </main>
      <LandingFooter />
    </div>
  )
}
