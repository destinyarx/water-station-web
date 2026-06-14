'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  BadgeDollarSign,
  ChevronLeft,
  Droplets,
  LayoutDashboard,
  Menu,
  Package,
  ReceiptText,
  Sparkles,
  Truck,
  UsersRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Deliveries',
    href: '/deliveries',
    icon: Truck,
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: UsersRound,
  },
  {
    title: 'Sales',
    href: '/sales',
    icon: BadgeDollarSign,
  },
  {
    title: 'Products',
    href: '/products',
    icon: Package,
  },
  {
    title: 'Maintenances',
    href: '/maintenances',
    icon: Wrench,
  },
  {
    title: 'Expenses',
    href: '/expenses',
    icon: ReceiptText,
  },
]

function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  function toggleSidebar(): void {
    setIsCollapsed((current) => !current)
  }

  function toggleMobileSidebar(): void {
    setIsMobileOpen((current) => !current)
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-hairline/60 bg-cloud/90 px-4 py-3 backdrop-blur-xl md:hidden">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/icon.png"
            alt="AquaFlow logo"
            width={36}
            height={36}
            className="rounded-full"
            priority
          />
          <span className="font-heading text-base font-bold text-aqua-deep">
            AquaFlow
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <UserButton />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isMobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={isMobileOpen}
            onClick={toggleMobileSidebar}
            className="rounded-full text-aqua-deep hover:bg-aqua-mist/50"
          >
            <Menu className="size-4" />
          </Button>
        </div>
      </header>

      {isMobileOpen ? (
        <div className="border-b border-hairline/60 bg-cloud/95 p-3 shadow-[0_16px_40px_rgba(79,181,232,0.12)] backdrop-blur-xl md:hidden">
          <nav aria-label="Primary mobile navigation" className="space-y-1">
            {navItems.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                isActive={isActiveRoute(pathname, item.href)}
                isCollapsed={false}
                onNavigate={() => setIsMobileOpen(false)}
              />
            ))}
          </nav>
        </div>
      ) : null}

      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-[#dcecff] bg-white/75 p-3 shadow-[18px_0_55px_rgba(0,48,73,0.08)] backdrop-blur-xl transition-[width] duration-300 md:block',
          isCollapsed ? 'w-[88px]' : 'w-72'
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_30%_20%,rgba(0,180,216,0.18),transparent_38%),radial-gradient(circle_at_85%_8%,rgba(0,245,212,0.16),transparent_34%)]" />
        <div className="pointer-events-none absolute -bottom-16 -left-20 h-48 w-48 rounded-full bg-[#00b4d8]/10 blur-3xl" />
        <div className="flex h-full flex-col">
          <div
            className={cn(
              'relative flex items-center gap-3 px-2 py-2',
              isCollapsed && 'justify-center'
            )}
          >
            <Link
              href="/dashboard"
              className="flex min-w-0 items-center gap-3"
              aria-label="AquaFlow dashboard"
            >
              <Image
                src="/icon.png"
                alt="AquaFlow logo"
                width={44}
                height={44}
                className="rounded-2xl shadow-[0_10px_28px_rgba(0,180,216,0.18)]"
                priority
              />
              <span
                className={cn(
                  'truncate font-heading text-lg font-bold text-aqua-deep transition-opacity',
                  isCollapsed && 'sr-only'
                )}
              >
                AquaFlow
                <span className="block font-sans text-xs font-medium text-[#2a4b6a]">
                  refill operations
                </span>
              </span>
            </Link>
          </div>

          <div className="relative mt-3 px-1">
            <Button
              type="button"
              variant="ghost"
              size={isCollapsed ? 'icon' : 'sm'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!isCollapsed}
              onClick={toggleSidebar}
              className={cn(
                'rounded-lg border border-[#dcecff] bg-[#eef7ff]/80 text-[#00414f] shadow-[0_8px_24px_rgba(0,48,73,0.06)] hover:bg-[#dff3ff]',
                !isCollapsed && 'w-full justify-start gap-2'
              )}
            >
              <ChevronLeft
                className={cn(
                  'size-4 transition-transform',
                  isCollapsed && 'rotate-180'
                )}
              />
              <span className={cn(isCollapsed && 'sr-only')}>
                Collapse sidebar
              </span>
            </Button>
          </div>

          <div
            className={cn(
              'relative mt-5 overflow-hidden rounded-2xl border border-white/80 bg-[#eef7ff]/80 p-3 shadow-[0_8px_24px_rgba(0,48,73,0.06)]',
              isCollapsed && 'hidden'
            )}
          >
            <div className="flex items-center gap-2 text-[#00414f]">
              <span className="flex size-8 items-center justify-center rounded-xl bg-white text-[#00b4d8] shadow-sm">
                <Droplets className="size-4" />
              </span>
              <div>
                <p className="font-heading text-sm font-semibold">
                  Spring-ready
                </p>
                <p className="text-xs text-[#2a4b6a]">
                  Customers, refills, and delivery routes.
                </p>
              </div>
            </div>
          </div>

          <nav aria-label="Primary navigation" className="relative mt-6 space-y-1">
            {navItems.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                isActive={isActiveRoute(pathname, item.href)}
                isCollapsed={isCollapsed}
              />
            ))}
          </nav>

          <div
            className={cn(
              'relative mt-auto flex items-center gap-3 rounded-2xl border border-[#dcecff] bg-white/80 px-3 py-3 shadow-[0_8px_24px_rgba(0,48,73,0.06)]',
              isCollapsed && 'justify-center rounded-full bg-transparent px-0'
            )}
          >
            <UserButton />
            <div
              className={cn(
                'min-w-0 transition-opacity',
                isCollapsed && 'sr-only'
              )}
            >
              <p className="truncate text-sm font-semibold text-aqua-deep">
                Station account
              </p>
              <p className="truncate text-xs text-[#2a4b6a]">Signed in</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

type SidebarLinkProps = {
  item: NavItem
  isActive: boolean
  isCollapsed: boolean
  onNavigate?: () => void
}

function SidebarLink({
  item,
  isActive,
  isCollapsed,
  onNavigate,
}: SidebarLinkProps) {
  const Icon = item.icon

  return (
    <Button
      asChild
      variant="ghost"
      size="lg"
      className={cn(
        'h-11 w-full rounded-full px-3 text-slate transition-all hover:bg-aqua-mist/55 hover:text-aqua-deep',
        'focus-visible:ring-[#00b4d8]/30',
        isCollapsed ? 'justify-center' : 'justify-start gap-3',
        isActive &&
          'bg-[#00b4d8] text-white shadow-[0_12px_30px_rgba(0,180,216,0.28)] hover:bg-[#009ec2] hover:text-white'
      )}
    >
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={isActive ? 'page' : undefined}
        title={isCollapsed ? item.title : undefined}
      >
        <Icon className="size-5" aria-hidden="true" />
        <span className={cn('font-medium', isCollapsed && 'sr-only')}>
          {item.title}
        </span>
        {isActive && !isCollapsed ? (
          <Sparkles className="ml-auto size-3.5 text-white/80" aria-hidden="true" />
        ) : null}
      </Link>
    </Button>
  )
}
