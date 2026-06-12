'use client'

import { UserButton } from '@clerk/nextjs'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-fog">
      <header className="flex items-center justify-between border-b border-hairline bg-cloud px-6 py-4">
        <span className="font-sora text-lg font-bold text-aqua-deep">
          AquaFlow
        </span>
        <UserButton />
      </header>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-sora text-3xl font-bold tracking-tight text-aqua-deep">
          Welcome.
        </h1>
        <p className="mt-2 text-slate">
          Your station dashboard is coming soon. Customers, deliveries, sales,
          expenses, and maintenance will live here.
        </p>
      </section>
    </main>
  )
}
