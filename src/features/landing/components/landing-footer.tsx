import Link from 'next/link'
import { Droplet } from 'lucide-react'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '#features', label: 'Features' },
      { href: '#preview', label: 'Preview' },
      { href: '#pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '#faq', label: 'FAQ' },
      { href: '#', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '#', label: 'Privacy' },
      { href: '#', label: 'Terms' },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="relative bg-[var(--navy-dark)]">
      {/* Decorative wave top edge */}
      <div aria-hidden className="absolute inset-x-0 -top-px overflow-hidden leading-none">
        <svg
          viewBox="0 0 1200 40"
          preserveAspectRatio="none"
          className="h-8 w-full"
        >
          <path
            d="M0 20 C 200 40 400 0 600 20 C 800 40 1000 0 1200 20 L1200 40 L0 40 Z"
            fill="var(--navy-dark)"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-outfit text-lg font-extrabold text-cloud"
            >
              <span className="grid size-9 place-items-center rounded-full bg-aqua-bright text-cloud shadow-[0_0_24px_rgba(79,181,232,0.35)]">
                <Droplet className="size-5" fill="currentColor" />
              </span>
              AquaFlow
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-[1.65] text-aqua-mist">
              Simple management for water refilling stations.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="font-outfit text-sm font-bold text-cloud">
                {column.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-aqua-mist transition-colors hover:text-aqua-light"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-[rgba(255,255,255,0.12)] pt-6 text-sm text-aqua-mist">
          Copyright {new Date().getFullYear()} AquaFlow. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
