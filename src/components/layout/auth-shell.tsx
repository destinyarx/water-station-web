'use client'

import { useEffect, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { initTheme, toggleTheme } from '@/stores/theme-store'
import { useTheme } from '@/stores/use-theme'
import { OceanBackdrop } from './ocean-backdrop'

/** Full-screen ocean-themed shell for the public auth surfaces (sign-in, sign-up,
 * complete-registration): gradient background, decorative backdrop, a home logo,
 * and the dark-mode toggle. Owns the single `initTheme()` call for these routes. */
export function AuthShell({ children }: { children: ReactNode }) {
  const isDark = useTheme()

  useEffect(() => {
    initTheme()
  }, [])

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[image:var(--lp-hero-grad)] px-5 pt-24 pb-28">
      <OceanBackdrop />

      {/* Top bar: logo + theme toggle */}
      <div className="absolute inset-x-0 top-0 z-[3] flex items-center justify-between px-[clamp(20px,5vw,48px)] py-5">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <span className="flex h-8.5 w-8.5 items-center justify-center rounded-[11px] bg-linear-to-br from-[#38bdf8] to-[#0a6cc4] shadow-[0_6px_16px_rgba(14,108,196,0.32)]">
            <Image src="/icon.png" alt="AquaFlow logo" width={30} height={30} className="object-contain" />
          </span>
          <span className="text-[18px] font-bold tracking-[-0.01em] text-(--lp-text)">AquaFlow</span>
        </Link>
        <button
          type="button"
          aria-label="Toggle dark mode"
          onClick={toggleTheme}
          className="flex h-9.5 w-9.5 items-center justify-center rounded-xl border border-(--lp-border-strong) bg-(--lp-header-bg) text-(--lp-brand-text) backdrop-blur-md"
        >
          {isDark ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.6 1.6M17.4 17.4L19 19M19 5l-1.6 1.6M6.6 17.4L5 19" />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>

      <div className="relative z-[2] flex w-full items-center justify-center">{children}</div>
    </main>
  )
}
