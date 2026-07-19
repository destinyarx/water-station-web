'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  CalendarDays,
  ChevronDown,
  CircleX,
  Clock3,
  History,
  PackageOpen,
  Search,
  UserRound,
} from 'lucide-react'

import { AppModal } from '@/components/app/app-modal'
import { cn } from '@/lib/utils'
import { pesoFormatter } from '../deliveries.constants'
import type { DeliveryHistoryStatusFilter } from '../deliveries.keys'
import { deliveryTerminalTimestamp } from '../deliveries.schedule-view'
import type { Delivery, DeliveryStatus } from '../deliveries.types'
import { useDeliveryHistory } from '../hooks/use-delivery-history'
import { DeliveryStatusMenu } from './delivery-status-menu'

interface DeliveryHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const HISTORY_ICON = <History className="size-5 text-white" />

const statusFilters: Array<{
  value: DeliveryHistoryStatusFilter
  label: string
}> = [
  { value: 'all', label: 'All outcomes' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function DeliveryHistoryDialog({
  open,
  onOpenChange,
}: DeliveryHistoryDialogProps) {
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<DeliveryHistoryStatusFilter>('all')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(0)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  const filters = useMemo(
    () => ({ page, search, status }),
    [page, search, status],
  )
  const query = useDeliveryHistory(filters, open)

  const deliveries = query.data?.deliveries ?? []
  const hasNext = query.data?.hasNext ?? false
  const isFiltered = search !== '' || status !== 'all'

  function handleOpenChange(next: boolean): void {
    if (!next) {
      setPage(0)
      setSearchInput('')
      setSearch('')
      setStatus('all')
      setMessage(null)
    }
    onOpenChange(next)
  }

  function selectStatus(next: DeliveryHistoryStatusFilter): void {
    setStatus(next)
    setPage(0)
  }

  return (
    <AppModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Delivery history"
      description="Completed, failed, and cancelled delivery runs in chronological order."
      icon={HISTORY_ICON}
      maxWidth="1080px"
      bodyPadding="0"
    >
      <div className="max-h-[72vh] overflow-y-auto px-5 py-5 pr-8 [scrollbar-gutter:stable] sm:px-6 sm:pr-9">
        <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-center">
          <label className="relative block">
            <span className="sr-only">Search delivery history by customer name</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--app-text-faint)" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search customer name..."
              className="h-11 w-full rounded-xl border border-(--app-border-strong) bg-(--app-surface) pr-4 pl-10 text-sm text-(--app-text) outline-none transition placeholder:text-(--app-text-faint) focus:border-(--app-brand) focus:shadow-[0_0_0_3px_var(--app-chip-bg)]"
            />
          </label>

          <div
            className="flex flex-wrap gap-2 lg:justify-end"
            aria-label="Filter delivery history by status"
          >
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={status === filter.value}
                onClick={() => selectStatus(filter.value)}
                className={cn(
                  'h-11 rounded-xl border px-3.5 text-sm font-semibold transition',
                  status === filter.value
                    ? 'border-(--app-brand) bg-(--app-brand) text-white shadow-sm'
                    : 'border-(--app-border-strong) bg-(--app-surface) text-(--app-text-soft) hover:bg-(--app-surface-2)',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
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
          <HistorySkeleton />
        ) : query.isError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/6 px-4 py-3 text-sm text-red-600"
          >
            {query.error.message}
          </p>
        ) : deliveries.length === 0 ? (
          <EmptyHistory filtered={isFiltered} />
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {deliveries.map((delivery) => (
              <HistoryRow
                key={delivery.id}
                delivery={delivery}
                onReverted={setMessage}
                onError={setMessage}
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

function HistoryRow({
  delivery,
  onReverted,
  onError,
}: {
  delivery: Delivery
  onReverted: (message: string) => void
  onError: (message: string) => void
}) {
  const reason =
    delivery.status === 'failed'
      ? delivery.failureRemarks
      : delivery.status === 'cancelled'
        ? delivery.cancellationRemarks
        : null
  const recipient =
    delivery.scheduleInfo?.customerName ??
    delivery.scheduleInfo?.guestName ??
    'Unknown recipient'
  const customerType = delivery.scheduleInfo?.customerIsBusiness
  const quantity = delivery.items.reduce((total, item) => total + item.quantity, 0)

  return (
    <li className="rounded-2xl border border-(--app-border) bg-(--app-surface) p-4 shadow-(--app-shadow-card) sm:p-5">
      <div className="grid gap-4 md:grid-cols-[minmax(190px,1.2fr)_minmax(190px,1fr)_minmax(130px,auto)_auto] md:items-start">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <HistoryStatusBadge status={delivery.status} />
            <RecipientTypeBadge
              isBusiness={customerType ?? null}
              isGuest={delivery.scheduleInfo?.customerId == null}
            />
          </div>
          <p className="truncate text-base font-bold text-(--app-text)">
            {recipient}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-(--app-text-soft)">
            <UserRound className="size-3.5" />
            Delivery #{delivery.id}
          </p>
        </div>

        <div className="rounded-xl bg-(--app-surface-2) px-3.5 py-3">
          <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.08em] text-(--app-text-faint) uppercase">
            <Clock3 className="size-3.5" /> Outcome recorded
          </p>
          <p className="mt-1.5 text-sm font-semibold text-(--app-text)">
            {formatDateTime(deliveryTerminalTimestamp(delivery))}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-(--app-text-soft)">
            <CalendarDays className="size-3.5" /> Scheduled{' '}
            {formatDate(delivery.deliveryDate)}
          </p>
        </div>

        <div className="rounded-xl border border-(--app-border) px-3.5 py-3">
          <p className="text-[10px] font-bold tracking-[0.08em] text-(--app-text-faint) uppercase">
            Delivery total
          </p>
          <p className="mt-1.5 text-base font-extrabold text-(--app-text)">
            {pesoFormatter.format(delivery.total)}
          </p>
          <p className="mt-1 text-xs text-(--app-text-soft)">
            {formatQuantity(quantity)}
          </p>
        </div>

        <div className="justify-self-start md:justify-self-end">
          <DeliveryStatusMenu
            delivery={delivery}
            onChanged={onReverted}
            onError={onError}
          />
        </div>
      </div>

      {reason ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-(--app-chip-red-bg) px-3.5 py-3 text-sm text-(--app-chip-red-text)">
          <CircleX className="mt-0.5 size-4 shrink-0" />
          <p>
            <span className="font-bold">Reason:</span> {reason}
          </p>
        </div>
      ) : null}

      <details className="group mt-4 border-t border-(--app-border) pt-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-1 text-sm font-semibold text-(--app-text-soft) outline-none focus-visible:ring-2 focus-visible:ring-(--app-brand)">
          <span className="flex items-center gap-2">
            <PackageOpen className="size-4 text-(--app-brand)" />
            {delivery.items.length === 0
              ? 'No recorded items'
              : `${delivery.items.length} ${delivery.items.length === 1 ? 'item' : 'items'} · ${formatQuantity(quantity)}`}
          </span>
          <ChevronDown className="size-4 transition group-open:rotate-180" />
        </summary>

        {delivery.items.length > 0 ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {delivery.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-(--app-surface-2) px-3 py-2.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-(--app-chip-bg) text-(--app-brand)">
                  {item.isStockTracked ? (
                    <Box className="size-4" />
                  ) : (
                    <PackageOpen className="size-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-(--app-text)">
                    {item.productName}
                  </span>
                  <span className="block text-xs text-(--app-text-soft)">
                    {formatQuantity(item.quantity)}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold text-(--app-text)">
                  {pesoFormatter.format(item.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </details>
    </li>
  )
}

function RecipientTypeBadge({
  isBusiness,
  isGuest,
}: {
  isBusiness: boolean | null
  isGuest: boolean
}) {
  const label = isGuest ? 'Guest' : isBusiness ? 'Business' : 'Household'
  return (
    <span className="rounded-lg bg-(--app-chip-bg) px-2.5 py-1 text-[11px] font-bold text-(--app-brand)">
      {label}
    </span>
  )
}

function HistoryStatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize',
        status === 'completed'
          ? 'bg-(--app-chip-green-bg) text-(--app-chip-green-text)'
          : status === 'failed'
            ? 'bg-(--app-chip-red-bg) text-(--app-chip-red-text)'
            : 'bg-(--app-chip-gray-bg) text-(--app-chip-gray-text)',
      )}
    >
      {status.replace('_', ' ')}
    </span>
  )
}

function EmptyHistory({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-(--app-border-strong) bg-(--app-surface-2) px-6 py-12 text-center">
      <History className="mb-3 size-8 text-(--app-text-faint)" />
      <p className="font-semibold text-(--app-text)">
        {filtered ? 'No deliveries match these filters' : 'No delivery history yet'}
      </p>
      <p className="mt-1 max-w-md text-sm text-(--app-text-soft)">
        {filtered
          ? 'Try another customer name or outcome to review a different part of the history.'
          : 'Completed, failed, and cancelled delivery runs will appear here.'}
      </p>
    </div>
  )
}

function HistorySkeleton() {
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

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  }).format(new Date(value))
}

function formatQuantity(quantity: number): string {
  return `${quantity} ${quantity === 1 ? 'unit' : 'units'}`
}
