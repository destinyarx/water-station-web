'use client'

import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

import { CompleteRegistrationForm } from '@/features/registration'
import { AuthShell } from '@/components/layout/auth-shell'

export default function CompleteRegistrationPage() {
  const { isLoaded, userId, sessionClaims } = useAuth()

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--lp-page-bg) font-medium text-(--lp-text-soft)">
        Loading session…
      </main>
    )
  }

  if (!userId) {
    redirect('/sign-in')
  }

  const name = typeof sessionClaims?.name === 'string' ? sessionClaims.name.trim() : ''

  return (
    <AuthShell>
      <div className="w-full max-w-115 rounded-[22px] border border-(--lp-border) bg-(--lp-surface) p-[clamp(24px,5vw,36px)] shadow-[0_30px_70px_rgba(14,108,196,0.18)]">
        <div className="mb-4.5 inline-flex items-center gap-2 rounded-full bg-(--lp-chip-bg) px-3.25 py-1.5 text-[12.5px] font-semibold text-(--lp-brand-text)">
          <span className="inline-block h-1.75 w-1.75 rounded-full bg-[#22c55e]" />
          Almost there
        </div>
        <h1 className="mb-2 text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-(--lp-text)">
          {name ? `Welcome, ${name} 👋` : 'Complete your registration'}
        </h1>
        <p className="mb-6.5 text-[15px] leading-relaxed text-(--lp-text-muted)">
          Just one more step before you can manage your water refilling station.
        </p>
        <CompleteRegistrationForm />
      </div>
    </AuthShell>
  )
}
