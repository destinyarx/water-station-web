import type { ReactNode } from 'react'

import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--app-page-bg)', color: 'var(--app-text)' }}>
      <AppSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppHeader />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
