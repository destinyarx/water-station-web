'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Droplet, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#preview', label: 'Preview' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 border-b backdrop-blur-[16px] transition-all',
        'bg-white/80',
        scrolled
          ? 'border-[var(--glass-border)] shadow-[0_8px_30px_rgba(79,181,232,0.08)]'
          : 'border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-outfit text-lg font-extrabold tracking-tight text-aqua-deep"
        >
          <span className="grid size-9 place-items-center rounded-full bg-aqua-bright text-cloud shadow-[0_0_24px_rgba(79,181,232,0.35)]">
            <Droplet className="size-5" fill="currentColor" />
          </span>
          AquaFlow
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-outfit text-sm font-semibold text-slate transition-colors hover:text-aqua-mid"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="hidden rounded-full px-4 py-2 font-outfit text-sm font-bold text-aqua-deep transition-colors hover:bg-aqua-mist/45 sm:inline-flex"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-aqua-bright px-5 py-2 font-outfit text-sm font-bold text-cloud shadow-[0_0_24px_rgba(79,181,232,0.35)] transition-all hover:-translate-y-0.5 hover:bg-aqua-mid"
          >
            Sign Up
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-full text-aqua-deep transition-colors hover:bg-aqua-mist/45 md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-[var(--glass-border)] bg-cloud/95 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2 font-outfit text-sm font-semibold text-slate transition-colors hover:bg-aqua-mist/45 hover:text-aqua-mid"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/sign-in"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-2 font-outfit text-sm font-bold text-aqua-deep transition-colors hover:bg-aqua-mist/45"
            >
              Sign In
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  )
}
