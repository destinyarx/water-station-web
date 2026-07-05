'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useAuth } from '@clerk/nextjs'

import { useIsCollapsed } from '@/stores/use-sidebar'
import { canAccessAquaflowAi } from '@/features/aquaflow-ai/aquaflow-ai.guards'

type NavItem = {
  key: string
  label: string
  href: string
  icon: React.ReactNode
  ownerOnly?: boolean
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
      </svg>
    ),
  },
  {
    key: 'customers',
    label: 'Customers',
    href: '/customers',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 19c0-3.1 2.5-5 5.5-5s5.5 1.9 5.5 5" />
        <path d="M16.2 5.3a3 3 0 0 1 0 5.6M17.8 19c0-2.2-.7-3.7-1.9-4.7" />
      </svg>
    ),
  },
  {
    key: 'products',
    label: 'Products',
    href: '/products',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
        <path d="M12 3 3.5 7.3v9.4L12 21l8.5-4.3V7.3L12 3Z" />
        <path d="M3.6 7.4 12 11.7l8.4-4.3M12 11.7V21" />
      </svg>
    ),
  },
  {
    key: 'deliveries',
    label: 'Deliveries',
    href: '/deliveries',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
        <path d="M3 6.5h10v9H3z" />
        <path d="M13 9.5h3.6l3.4 3.3v2.7H13z" />
        <circle cx="7" cy="17.5" r="1.7" />
        <circle cx="17" cy="17.5" r="1.7" />
      </svg>
    ),
  },
  {
    key: 'maintenances',
    label: 'Maintenance',
    href: '/maintenances',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
        <path d="M14.7 6.3a3.7 3.7 0 0 0-4.9 4.6L4 16.7 7.3 20l5.8-5.8a3.7 3.7 0 0 0 4.6-4.9l-2.4 2.4-2-2 2.4-2.4Z" />
      </svg>
    ),
  },
  {
    key: 'documents',
    label: 'Documents',
    href: '/documents',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  },
  {
    key: 'expenses',
    label: 'Expenses',
    href: '/expenses',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10h18" />
        <circle cx="16.5" cy="14" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'ai',
    label: 'AI Assistant',
    href: '/ai-assistant',
    ownerOnly: true,
    badge: 'New',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v3M12 18v3M4.2 7.2l2.1 2.1M17.7 14.7l2.1 2.1M3 12h3M18 12h3M4.2 16.8l2.1-2.1M17.7 9.3l2.1-2.1" />
        <circle cx="12" cy="12" r="3.4" />
      </svg>
    ),
  },
]

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const isCollapsed = useIsCollapsed()
  const pathname = usePathname()
  const { sessionClaims } = useAuth()
  const isOwner = canAccessAquaflowAi(sessionClaims)
  const navItems = NAV_ITEMS.filter((item) => !item.ownerOnly || isOwner)

  return (
    <aside
      style={{
        flex: 'none',
        width: isCollapsed ? '78px' : '252px',
        background: 'var(--app-sidebar-bg)',
        borderRight: '1px solid var(--app-sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.2s ease',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          padding: '20px 18px 16px',
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(150deg,#5cc6f7,#0a6cc4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 14px rgba(14,108,196,0.28)',
          }}
        >
          <svg width="21" height="21" viewBox="0 0 24 24">
            <path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" fill="#fff" />
          </svg>
        </div>
        {!isCollapsed && (
          <span style={{ fontWeight: 700, fontSize: '19px', color: 'var(--app-text)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            AquaFlow
          </span>
        )}
      </div>

      {/* Workspace label */}
      {!isCollapsed && (
        <div style={{ padding: '8px 20px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--app-text-faint)', whiteSpace: 'nowrap' }}>
          Workspace
        </div>
      )}

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '4px 12px', flex: 1 }}>
        {navItems.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.key}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: '11px 13px',
                borderRadius: '11px',
                textDecoration: 'none',
                background: active ? 'var(--app-sidebar-active-bg)' : 'transparent',
                color: active ? 'var(--app-sidebar-active-text)' : 'var(--app-sidebar-text)',
                fontSize: '15px',
                fontWeight: active ? 600 : 500,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <span style={{ flexShrink: 0, width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </span>
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    background: 'var(--app-chip-bg)',
                    color: 'var(--app-brand)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User card */}
      <div style={{ padding: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: '9px 10px',
            borderRadius: '12px',
            background: 'var(--app-surface-2)',
            border: '1px solid var(--app-sidebar-border)',
          }}
        >
          <UserButton />
          {!isCollapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', whiteSpace: 'nowrap' }}>Station account</div>
              <div style={{ fontSize: '11px', color: 'var(--app-text-soft)', whiteSpace: 'nowrap' }}>Signed in</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
