import type { ReactNode } from 'react'

import { AppSidebar } from '@/components/layout/app-sidebar'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#001d34]">
      <div className="md:flex">
        <AppSidebar />
        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
