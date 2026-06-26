'use client'

import { CompleteRegistrationForm } from '@/features/registration'
import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default function CompleteRegistrationPage() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-fog px-6 py-16">
        <div className="text-center text-slate font-medium">Loading session...</div>
      </main>
    );
  }

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-fog px-6 py-16">
      <div className="w-full max-w-md rounded-[20px] border border-hairline bg-cloud p-6 shadow-[0_8px_30px_rgba(8,131,149,0.10)] sm:p-8">
        <header className="mb-6 space-y-1.5">
          <h1 className="font-sora text-2xl font-bold tracking-tight text-aqua-deep">
            Complete your registration {userId}
          </h1>
          <p className="text-sm text-slate">
            Just one more step before you can manage your water refilling
            station.
          </p>
        </header>
        <CompleteRegistrationForm />
      </div>
    </main>
  )
}
