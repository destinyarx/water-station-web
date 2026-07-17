import { CalendarDays, CircleDollarSign } from 'lucide-react'

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
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-[0.1em] text-(--app-brand) uppercase">
          Station overview
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-(--app-text) sm:text-[28px]">
          {greeting}, {name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--app-text-soft)">
          <span>{stationName}</span>
          <span aria-hidden="true" className="text-(--app-text-faint)">
            •
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {rangeLabel}
          </span>
          {isRefreshing ? <RefreshIndicator /> : null}
        </div>
        <p className="mt-3 inline-flex max-w-2xl items-start gap-2 rounded-xl border border-(--app-border) bg-(--app-surface-2) px-3 py-2 text-[11px] leading-4.5 text-(--app-text-soft)">
          <CircleDollarSign
            className="mt-0.5 size-3.5 shrink-0 text-(--app-brand)"
            aria-hidden="true"
          />
          Delivery sales recognize completed delivery items only. Walk-in and
          POS sales are not included in Dashboard V1.
        </p>
      </div>

      <div className="shrink-0">
        <p className="mb-2 text-[10px] font-bold tracking-[0.08em] text-(--app-text-faint) uppercase lg:text-right">
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
