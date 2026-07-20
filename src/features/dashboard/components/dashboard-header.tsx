import { CalendarDays, CircleDollarSign, Droplet } from 'lucide-react'

import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'

import { dashboardPeriodSchema } from '../dashboard.schema'
import type { DashboardPeriod } from '../dashboard.types'
import { dashboardPeriodOptions } from '../dashboard.view'
import { RefreshIndicator } from './dashboard-ui'

type DashboardHeaderProps = {
  greeting: string
  name: string
  stationName: string
  rangeLabel: string
  period: DashboardPeriod
  isRefreshing: boolean
  onPeriodChange: (period: DashboardPeriod) => void
}

export function DashboardHeader({
  greeting,
  name,
  stationName,
  rangeLabel,
  period,
  isRefreshing,
  onPeriodChange,
}: DashboardHeaderProps) {
  function handlePeriodChange(value: string): void {
    const parsed = dashboardPeriodSchema.safeParse(value)
    if (parsed.success) onPeriodChange(parsed.data)
  }

  return (
    <header className="relative flex flex-col gap-5 overflow-hidden rounded-[20px] border border-[#0b6ab8] bg-linear-to-br from-[#0d78c9] via-[#0a67b8] to-[#064f8f] px-5 py-5 shadow-[0_12px_30px_rgba(9,68,110,0.28)] sm:px-6 lg:flex-row lg:items-end lg:justify-between">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -left-8 size-40 rounded-full bg-white/10 blur-3xl"
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full text-white/10"
        viewBox="0 0 500 60"
        preserveAspectRatio="none"
        fill="none"
      >
        <path d="M0 34C70 8 140 52 250 32 355 13 430 40 500 22v40H0Z" fill="currentColor" />
        <path d="M0 46C80 24 150 58 250 44 360 29 430 50 500 38v24H0Z" fill="white" fillOpacity="0.06" />
      </svg>

      <div className="relative min-w-0">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.1em] text-sky-100 uppercase">
          <Droplet className="size-3.5 fill-current" aria-hidden="true" />
          Station overview
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-[28px]">
          {greeting}, {name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sky-100/90">
          <span>{stationName}</span>
          <span aria-hidden="true" className="text-white/40">
            •
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {rangeLabel}
          </span>
          {isRefreshing ? <RefreshIndicator /> : null}
        </div>
        {/* <p className="mt-3 inline-flex max-w-2xl items-start gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[11px] leading-4.5 text-sky-50 backdrop-blur-sm">
          <CircleDollarSign
            className="mt-0.5 size-3.5 shrink-0 text-sky-200"
            aria-hidden="true"
          />
          Delivery sales recognize completed delivery items only. Walk-in and
          POS sales are not included in Dashboard V1.
        </p> */}
      </div>

      <div className="relative shrink-0">
        <p className="mb-2 text-[10px] font-bold tracking-[0.08em] text-sky-100/80 uppercase lg:text-right">
          Coverage
        </p>
        <ToggleGroup
          type="single"
          value={period}
          onValueChange={handlePeriodChange}
          variant="outline"
          size="sm"
          spacing={1}
          aria-label="Dashboard coverage period"
          className="w-full flex-wrap rounded-xl border border-(--app-border) bg-(--app-surface) p-1 shadow-[var(--app-shadow-card)] sm:w-fit"
        >
          {dashboardPeriodOptions.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              aria-label={`Show ${option.label.toLowerCase()} dashboard data`}
              className="h-8 rounded-lg border-0 px-3 text-xs text-(--app-text-soft) shadow-none hover:bg-(--app-surface-2) hover:text-(--app-text) data-[state=on]:bg-(--app-brand) data-[state=on]:text-white"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </header>
  )
}
