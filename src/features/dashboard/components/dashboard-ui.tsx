import type { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type PanelShellProps = {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function PanelShell({
  title,
  description,
  action,
  children,
  className,
}: PanelShellProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-[18px] border border-(--app-border) bg-(--app-surface) shadow-[var(--app-shadow-card)]',
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-(--app-border) px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold tracking-[-0.01em] text-(--app-text)">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-(--app-text-soft)">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

type StatCardTone = 'brand' | 'green' | 'amber' | 'violet'

const statToneClasses: Record<
  StatCardTone,
  { border: string; glow: string; icon: string; wave: string }
> = {
  brand: {
    border: 'border-l-[#38bdf8]',
    glow: 'bg-sky-400/15',
    icon: 'bg-(--app-chip-bg) text-(--app-brand)',
    wave: 'fill-sky-400/15',
  },
  green: {
    border: 'border-l-[#22c55e]',
    glow: 'bg-green-500/15',
    icon: 'bg-(--app-chip-green-bg) text-(--app-chip-green-text)',
    wave: 'fill-green-500/15',
  },
  amber: {
    border: 'border-l-[#f59e0b]',
    glow: 'bg-amber-400/15',
    icon: 'bg-(--app-chip-amber-bg) text-(--app-chip-amber-text)',
    wave: 'fill-amber-400/15',
  },
  violet: {
    border: 'border-l-[#8b5cf6]',
    glow: 'bg-violet-500/15',
    icon: 'bg-(--app-chip-violet-bg) text-(--app-chip-violet-text)',
    wave: 'fill-violet-500/15',
  },
}

type StatCardProps = {
  label: string
  value: string
  helper: string
  icon: ReactNode
  comparison?: string | null
  tone?: StatCardTone
  featured?: boolean
}

export function StatCard({
  label,
  value,
  helper,
  icon,
  comparison,
  tone = 'brand',
  featured = false,
}: StatCardProps) {
  const toneClasses = statToneClasses[tone]

  return (
    <article
      className={cn(
        'relative min-w-0 overflow-hidden rounded-2xl border border-(--app-border) border-l-[3px] p-4 shadow-[var(--app-shadow-card)]',
        featured
          ? 'border-l-[#7dd3fc] bg-linear-to-br from-[#0b73c8] to-[#075098] text-white'
          : cn('bg-(--app-surface)', toneClasses.border),
      )}
    >
      {featured ? (
        <svg
          aria-hidden="true"
          className="absolute -right-7 -bottom-8 h-24 w-36 text-white/10"
          viewBox="0 0 160 100"
          fill="none"
        >
          <path
            d="M0 56C31 25 54 82 89 49c27-25 45-19 71-9v60H0Z"
            fill="currentColor"
          />
          <path
            d="M0 72c32-21 55 26 89-2 27-22 46-14 71-2v32H0Z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <>
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute -top-5 -right-5 size-21.5 rounded-full blur-xl',
              toneClasses.glow,
            )}
          />
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-5 w-full opacity-60"
            viewBox="0 0 320 36"
            preserveAspectRatio="none"
          >
            <path
              d="M0 20C50 6 92 30 160 20c64-9 112 8 160-4v20H0Z"
              className={toneClasses.wave}
            />
          </svg>
        </>
      )}

      <div className="relative flex items-start justify-between gap-3">
        <p
          className={cn(
            'text-[10.5px] font-bold tracking-[0.08em] uppercase',
            featured ? 'text-sky-100' : 'text-(--app-text-faint)',
          )}
        >
          {label}
        </p>
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-[9px] [&_svg]:size-[15px]',
            featured ? 'bg-white/15 text-white' : toneClasses.icon,
          )}
        >
          {icon}
        </span>
      </div>

      <p
        className={cn(
          'relative mt-2.5 text-[25px] leading-none font-extrabold tracking-[-0.03em]',
          featured ? 'text-white' : 'text-(--app-text)',
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          'relative mt-2 truncate text-xs',
          featured ? 'text-sky-100' : 'text-(--app-text-soft)',
        )}
      >
        {helper}
      </p>

      {comparison ? (
        <p
          className={cn(
            'relative mt-2 text-[10.5px] leading-4 font-semibold',
            featured ? 'text-sky-50' : 'text-(--app-brand)',
          )}
        >
          {comparison}
        </p>
      ) : null}
    </article>
  )
}

export function DashboardKpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3.5">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-(--app-border) bg-(--app-surface) p-4"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-3 w-24 bg-(--app-border-strong)" />
            <Skeleton className="size-7 rounded-[9px] bg-(--app-border-strong)" />
          </div>
          <Skeleton className="mt-3 h-7 w-28 bg-(--app-border-strong)" />
          <Skeleton className="mt-2 h-3 w-36 bg-(--app-border)" />
        </div>
      ))}
    </div>
  )
}

export function DashboardPanelSkeleton({
  compact = false,
}: {
  compact?: boolean
}) {
  return (
    <div className="rounded-[18px] border border-(--app-border) bg-(--app-surface) p-5">
      <Skeleton className="h-4 w-40 bg-(--app-border-strong)" />
      <Skeleton className="mt-2 h-3 w-56 max-w-full bg-(--app-border)" />
      <Skeleton
        className={cn(
          'mt-5 w-full bg-(--app-border)',
          compact ? 'h-32' : 'h-56',
        )}
      />
    </div>
  )
}

export function ErrorPanel({
  title,
  message,
  onRetry,
}: {
  title: string
  message: string
  onRetry: () => void
}) {
  return (
    <section
      role="alert"
      className="rounded-[18px] border border-(--app-border-strong) bg-(--app-surface) p-5 shadow-[var(--app-shadow-card)]"
    >
      <p className="text-sm font-bold text-(--app-text)">{title}</p>
      <p className="mt-1 text-xs leading-5 text-(--app-text-soft)">
        {message}
      </p>
      <Button className="mt-4" variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw data-icon="inline-start" aria-hidden="true" />
        Retry this section
      </Button>
    </section>
  )
}

export function SectionNotice({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) px-4 py-3">
      <p className="text-xs font-bold text-(--app-text)">{title}</p>
      <p className="mt-1 text-xs leading-5 text-(--app-text-soft)">
        {description}
      </p>
    </div>
  )
}

export function PanelEmpty({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: ReactNode
}) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center px-5 py-8 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl bg-(--app-chip-bg) text-(--app-brand) [&_svg]:size-5">
        {icon}
      </span>
      <p className="mt-3 text-sm font-bold text-(--app-text)">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-(--app-text-soft)">
        {description}
      </p>
    </div>
  )
}

export function RefreshIndicator() {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-100"
      role="status"
    >
      <RefreshCw className="size-3 animate-spin motion-reduce:animate-none" />
      Refreshing
    </span>
  )
}
