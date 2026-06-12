import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-fog px-6 py-16">
      <Link
        href="/"
        className="flex items-center gap-2 font-sora text-lg font-bold text-aqua-deep"
      >
        <span
          aria-hidden
          className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-aqua-mid to-aqua-bright text-cloud"
        >
          ◓
        </span>
        AquaFlow
      </Link>
      {children}
    </main>
  )
}
