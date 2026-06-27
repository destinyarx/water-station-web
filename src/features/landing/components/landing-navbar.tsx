'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'

import { initTheme, toggleTheme } from '@/stores/theme-store'
import { useTheme } from '@/stores/use-theme'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#workflow', label: 'How it works' },
  { href: '#dashboard', label: 'Dashboard' },
  { href: '#pricing', label: 'Pricing' },
]

const DashboardButton = () => (
  <Link href="/dashboard">
    <button
      type="button"
      style={{
        background: 'linear-gradient(150deg,#38bdf8,#0a6cc4)',
        color: '#fff',
        fontSize: '15px',
        fontWeight: 600,
        padding: '11px 22px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(14,108,196,0.28)',
        fontFamily: 'inherit',
      }}
    >
      Dashboard
    </button>
  </Link>
)

const AuthButtons = () => (
  <div className="flex flex-row gap-4">
    <SignInButton mode="redirect">
      <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lp-brand-text)', fontSize: '15px', fontWeight: 600, fontFamily: 'inherit' }}>
        Sign in
      </button>
    </SignInButton>

    <SignUpButton mode="redirect">
      <button type="button" style={{ background: 'linear-gradient(150deg,#38bdf8,#0a6cc4)', color: '#fff', fontSize: '15px', fontWeight: 600, padding: '11px 22px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(14,108,196,0.28)', fontFamily: 'inherit' }}>
        Register Now
      </button>
    </SignUpButton>
  </div>
)

export function LandingNavbar() {
  const isDark = useTheme()
  const { userId, isLoaded } = useAuth()

  useEffect(() => {
    initTheme()
  }, [])

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'var(--lp-header-bg)',
        borderBottom: '1px solid var(--lp-border)',
      }}
    >
      <div style={{  maxWidth: '1600px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(150deg,#38bdf8,#0a6cc4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(14,108,196,0.32)' }}>
            <Image
              src="/icon.png"
              alt="Aquaflow Logo"
              width={35}
              height={35}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <span style={{ fontWeight: 700, fontSize: '20px', letterSpacing: '-0.01em', color: 'var(--lp-text)' }}>AquaFlow</span>
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '34px' }}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} style={{ textDecoration: 'none', color: 'var(--lp-nav-link)', fontSize: '15px', fontWeight: 500 }}>
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              border: '1px solid var(--lp-border-strong)',
              background: 'transparent',
              color: 'var(--lp-brand-text)',
              cursor: 'pointer',
            }}
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

          {(isLoaded && userId) ? <DashboardButton /> : <AuthButtons />}
        </div>
      </div>
    </header>
  )
}
