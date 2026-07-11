'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

import { toggleSidebar } from '@/stores/sidebar-store'
import { initTheme, toggleTheme } from '@/stores/theme-store'
import { useTheme } from '@/stores/use-theme'
import { NotificationBell } from '@/features/notifications'

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/products': 'Products',
  '/deliveries': 'Deliveries',
  '/maintenances': 'Maintenance',
  '/expenses': 'Expenses',
  '/sales': 'Sales',
}

function getRouteLabel(pathname: string): string {
  for (const [key, label] of Object.entries(ROUTE_LABELS)) {
    if (pathname === key || pathname.startsWith(`${key}/`)) return label
  }
  return 'AquaFlow'
}

export function AppHeader() {
  const isDark = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    initTheme()
  }, [])

  return (
    <header
      style={{
        flex: 'none',
        height: '62px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 22px',
        background: 'var(--app-surface)',
        borderBottom: '1px solid var(--app-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            border: '1px solid var(--app-border-strong)',
            background: 'var(--app-surface)',
            color: 'var(--app-brand)',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
            <rect x="3" y="4.5" width="18" height="15" rx="2.2" />
            <path d="M9 4.5v15" />
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '13.5px', color: 'var(--app-text-soft)' }}>
          <span style={{ fontWeight: 500 }}>AquaFlow</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ opacity: 0.5 }}>
            <path d="M9 6l6 6-6 6" />
          </svg>
          <span style={{ fontWeight: 600, color: 'var(--app-text)' }}>{getRouteLabel(pathname)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <NotificationBell />
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
            border: '1px solid var(--app-border-strong)',
            background: 'var(--app-surface)',
            color: 'var(--app-brand)',
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
        <div style={{ width: '1px', height: '24px', background: 'var(--app-border)' }} />
        <UserButton />
      </div>
    </header>
  )
}
