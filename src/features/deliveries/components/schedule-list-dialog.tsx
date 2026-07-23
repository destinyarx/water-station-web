'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  BriefcaseBusiness,
  CalendarClock,
  ChevronDown,
  CirclePause,
  CirclePlay,
  Clock3,
  House,
  PackageOpen,
  Search,
  UserRound,
} from 'lucide-react'

import { AppModal } from '@/components/app/app-modal'
import { cn } from '@/lib/utils'
import type {
  DeliveryScheduleCustomerTypeFilter,
  DeliveryScheduleStatusFilter,
} from '../deliveries.keys'
import {
  recurrenceSummary,
  scheduleRecipient,
  scheduleTiming,
} from '../deliveries.schedule-view'
import type {
  DeliveryScheduleListItem,
  DeliveryScheduleRow,
} from '../deliveries.types'
import { useScheduleStatus } from '../hooks/use-schedule-status'
import { useSchedules } from '../hooks/use-schedules'

interface ScheduleListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SCHEDULE_ICON = <CalendarClock className="size-5 text-white" />

export function ScheduleListDialog({
  open,
  onOpenChange,
}: ScheduleListDialogProps) {
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<DeliveryScheduleStatusFilter>('all')
  const [customerType, setCustomerType] =
    useState<DeliveryScheduleCustomerTypeFilter>('all')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(0)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  const filters = useMemo(
    () => ({ page, search, status, customerType }),
    [customerType, page, search, status],
  )
  const query = useSchedules(filters, open)
  const mutation = useScheduleStatus()
  const schedules = query.data?.schedules ?? []
  const hasNext = query.data?.hasNext ?? false
  const isFiltered = search !== '' || status !== 'all' || customerType !== 'all'

  function handleOpenChange(next: boolean): void {
    if (!next) {
      setPage(0)
      setSearchInput('')
      setSearch('')
      setStatus('all')
      setCustomerType('all')
      setMessage(null)
    }
    onOpenChange(next)
  }

  function selectStatus(next: DeliveryScheduleStatusFilter): void {
    setStatus(next)
    setPage(0)
  }

  function selectCustomerType(
    next: DeliveryScheduleCustomerTypeFilter,
  ): void {
    setCustomerType(next)
    setPage(0)
  }

  function toggle(schedule: DeliveryScheduleRow): void {
    const action = schedule.status === 'active' ? 'pause' : 'resume'
    mutation.mutate(
      { schedule, action },
      {
        onSuccess: () =>
          setMessage(
            action === 'pause'
              ? 'Schedule stopped. Future pending runs were removed.'
              : 'Schedule resumed. Upcoming runs will continue on its original cadence.',
          ),
        onError: (error) => setMessage(error.message),
      },
    )
  }

  return (
    <AppModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Recurring schedules"
      description="Review standing customer routes, their delivery items, and the next work due."
      icon={SCHEDULE_ICON}
      maxWidth="1120px"
      bodyPadding="0"
    >
      <div className="max-h-[72vh] overflow-y-auto px-5 py-5 pr-8 [scrollbar-gutter:stable] sm:px-6 sm:pr-9">
        <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_190px_210px]">
          <label className="relative block">
            <span className="sr-only">Search schedules by recipient name</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--app-text-faint)" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search recipient name..."
              className="h-11 w-full rounded-xl border border-(--app-border-strong) bg-(--app-surface) pr-4 pl-10 text-sm text-(--app-text) outline-none transition placeholder:text-(--app-text-faint) focus:border-(--app-brand) focus:shadow-[0_0_0_3px_var(--app-chip-bg)]"
            />
          </label>

          <FilterSelect
            label="Schedule status"
            value={status}
            onChange={(value) =>
              selectStatus(value as DeliveryScheduleStatusFilter)
            }
            options={[
              ['all', 'All statuses'],
              ['active', 'Active'],
              ['inactive', 'Inactive'],
            ]}
          />

          <FilterSelect
            label="Customer type"
            value={customerType}
            onChange={(value) =>
              selectCustomerType(value as DeliveryScheduleCustomerTypeFilter)
            }
            options={[
              ['all', 'All customer types'],
              ['business', 'Business'],
              ['household', 'Household'],
            ]}
          />
        </div>

        {message ? (
          <p
            role="status"
            className="mb-4 rounded-xl border border-(--app-border-strong) bg-(--app-chip-bg) px-3.5 py-2.5 text-sm font-semibold text-(--app-brand)"
          >
            {message}
          </p>
        ) : null}

        {query.isPending ? (
          <ScheduleSkeleton />
        ) : query.isError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/6 px-4 py-3 text-sm text-red-600"
          >
            {query.error.message}
          </p>
        ) : schedules.length === 0 ? (
          <EmptySchedules filtered={isFiltered} />
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {schedules.map((item) => (
              <ScheduleCard
                key={item.schedule.id}
                item={item}
                isPending={
                  mutation.isPending &&
                  mutation.variables?.schedule.id === item.schedule.id
                }
                onToggle={() => toggle(item.schedule)}
              />
            ))}
          </ul>
        )}

        <PaginationFooter
          page={page}
          hasNext={hasNext}
          isFetching={query.isFetching}
          onPrevious={() => setPage((current) => Math.max(0, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      </div>
    </AppModal>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<[string, string]>
  onChange: (value: string) => void
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-(--app-border-strong) bg-(--app-surface) px-3.5 pr-10 text-sm font-medium text-(--app-text) outline-none transition focus:border-(--app-brand) focus:shadow-[0_0_0_3px_var(--app-chip-bg)]"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-(--app-text-faint)" />
    </label>
  )
}

function ScheduleCard({
  item,
  isPending,
  onToggle,
}: {
  item: DeliveryScheduleListItem
  isPending: boolean
  onToggle: () => void
}) {
  const { schedule } = item
  const timing = scheduleTiming(item)
  const recipient = scheduleRecipient(schedule, item.customerName)
  const quantity = item.items.reduce((total, product) => total + product.quantity, 0)

  return (
    <li className="rounded-2xl border border-(--app-border) bg-(--app-surface) p-4 shadow-(--app-shadow-card) transition hover:border-(--app-border-strong) sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(210px,1.2fr)_minmax(180px,1fr)_minmax(210px,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <ScheduleStatusBadge status={schedule.status} />
            <CustomerTypeBadge isBusiness={item.customerIsBusiness} />
          </div>
          <p className="truncate text-base font-bold text-(--app-text)">
            {recipient}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-(--app-text-soft)">
            <UserRound className="size-3.5" />
            {schedule.customer_id == null ? 'Guest delivery plan' : 'Customer record'}
          </p>
        </div>

        <div className="rounded-xl bg-(--app-surface-2) px-3.5 py-3">
          <p className="text-[10px] font-bold tracking-[0.08em] text-(--app-text-faint) uppercase">
            Recurrence
          </p>
          <p className="mt-1.5 text-sm font-semibold text-(--app-text)">
            {recurrenceSummary(schedule)}
          </p>
        </div>

        <div
          className={cn(
            'rounded-xl border px-3.5 py-3',
            timing.kind === 'current'
              ? 'border-amber-500/25 bg-(--app-chip-amber-bg)'
              : timing.kind === 'next'
                ? 'border-sky-500/20 bg-(--app-chip-bg)'
                : 'border-(--app-border) bg-(--app-surface-2)',
          )}
        >
          <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.08em] text-(--app-text-faint) uppercase">
            <Clock3 className="size-3.5" />
            {timing.kind === 'current'
              ? 'Current delivery'
              : timing.kind === 'next'
                ? 'Next delivery'
                : 'Delivery timing'}
          </p>
          <p className="mt-1.5 text-sm font-semibold text-(--app-text)">
            {timing.date == null ? 'No pending delivery' : formatDate(timing.date)}
          </p>
          {timing.kind === 'current' ? (
            <p className="mt-1 text-xs text-(--app-chip-amber-text)">
              Due today or overdue
            </p>
          ) : null}
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={onToggle}
          className={cn(
            'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
            schedule.status === 'active'
              ? 'border-amber-500/25 bg-(--app-chip-amber-bg) text-(--app-chip-amber-text) hover:border-amber-500/40'
              : 'border-emerald-500/25 bg-(--app-chip-green-bg) text-(--app-chip-green-text) hover:border-emerald-500/40',
          )}
        >
          {schedule.status === 'active' ? (
            <CirclePause className="size-4" />
          ) : (
            <CirclePlay className="size-4" />
          )}
          {isPending
            ? 'Updating...'
            : schedule.status === 'active'
              ? 'Stop'
              : 'Resume'}
        </button>
      </div>

      <details className="group mt-4 border-t border-(--app-border) pt-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-1 text-sm font-semibold text-(--app-text-soft) outline-none focus-visible:ring-2 focus-visible:ring-(--app-brand)">
          <span className="flex items-center gap-2">
            <PackageOpen className="size-4 text-(--app-brand)" />
            {item.items.length === 0
              ? 'No delivery items'
              : `${item.items.length} ${item.items.length === 1 ? 'item' : 'items'} · ${formatQuantity(quantity)}`}
          </span>
          <ChevronDown className="size-4 transition group-open:rotate-180" />
        </summary>
        {item.items.length > 0 ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {item.items.map((product) => (
              <li
                key={product.productId}
                className="flex items-center gap-3 rounded-xl bg-(--app-surface-2) px-3 py-2.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-(--app-chip-bg) text-(--app-brand)">
                  {product.isStockTracked ? (
                    <Box className="size-4" />
                  ) : (
                    <PackageOpen className="size-4" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-(--app-text)">
                    {product.productName}
                  </span>
                  <span className="block text-xs text-(--app-text-soft)">
                    {formatQuantity(product.quantity)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </details>
    </li>
  )
}

function CustomerTypeBadge({ isBusiness }: { isBusiness: boolean | null }) {
  if (isBusiness == null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-(--app-chip-violet-bg) px-2.5 py-1 text-[11px] font-bold text-(--app-chip-violet-text)">
        <UserRound className="size-3" /> Guest
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-(--app-chip-bg) px-2.5 py-1 text-[11px] font-bold text-(--app-brand)">
      {isBusiness ? (
        <BriefcaseBusiness className="size-3" />
      ) : (
        <House className="size-3" />
      )}
      {isBusiness ? 'Business' : 'Household'}
    </span>
  )
}

function ScheduleStatusBadge({
  status,
}: {
  status: DeliveryScheduleRow['status']
}) {
  const isActive = status === 'active'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold',
        isActive
          ? 'bg-(--app-chip-green-bg) text-(--app-chip-green-text)'
          : 'bg-(--app-chip-gray-bg) text-(--app-chip-gray-text)',
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

function EmptySchedules({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-(--app-border-strong) bg-(--app-surface-2) px-6 py-12 text-center">
      <CalendarClock className="mb-3 size-8 text-(--app-text-faint)" />
      <p className="font-semibold text-(--app-text)">
        {filtered ? 'No matching schedules' : 'No recurring schedules yet'}
      </p>
      <p className="mt-1 max-w-md text-sm text-(--app-text-soft)">
        {filtered
          ? 'Try a different recipient name or clear one of the filters.'
          : 'Recurring and custom-date delivery plans appear here. Plans leave this list once every one of their deliveries is finished.'}
      </p>
    </div>
  )
}

function ScheduleSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-42 animate-pulse rounded-2xl bg-(--app-surface-2)"
        />
      ))}
    </div>
  )
}

function PaginationFooter({
  page,
  hasNext,
  isFetching,
  onPrevious,
  onNext,
}: {
  page: number
  hasNext: boolean
  isFetching: boolean
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-(--app-border) pt-4">
      <span className="text-sm text-(--app-text-soft)" aria-live="polite">
        Page {page + 1}
        {isFetching ? ' · Updating...' : ''}
      </span>
      <div className="flex gap-2">
        <PaginationButton
          onClick={onPrevious}
          disabled={page === 0 || isFetching}
        >
          Previous
        </PaginationButton>
        <PaginationButton onClick={onNext} disabled={!hasNext || isFetching}>
          Next
        </PaginationButton>
      </div>
    </div>
  )
}

function PaginationButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border border-(--app-border-strong) bg-(--app-surface) px-4 py-2 text-sm font-semibold text-(--app-text-soft) transition hover:bg-(--app-surface-2) disabled:cursor-not-allowed disabled:bg-(--app-surface-2) disabled:text-(--app-text-faint)"
    >
      {children}
    </button>
  )
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatQuantity(quantity: number): string {
  return `${quantity} ${quantity === 1 ? 'unit' : 'units'}`
}
