'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { initTheme, toggleTheme } from '@/stores/theme-store'
import { useTheme } from '@/stores/use-theme'

export function LegalTopBar() {
  const isDark = useTheme()

  useEffect(() => {
    initTheme()
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-(--lp-border) bg-(--lp-header-bg) backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Back to AquaFlow home">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-linear-to-br from-[#38bdf8] to-[#0a6cc4]">
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" fill="#fff" />
            </svg>
          </span>
          <span className="text-lg font-bold text-(--lp-text)">AquaFlow</span>
        </Link>

        <button
          type="button"
          aria-label="Toggle dark mode"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-(--lp-border-strong) text-(--lp-brand-text)"
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
    </header>
  )
}
