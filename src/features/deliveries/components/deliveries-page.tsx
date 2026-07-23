'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, History } from 'lucide-react'

import { AquaProgressBar, AquaSkeleton } from '@/components/app/loading'
import { cn } from '@/lib/utils'
import { useCustomerOptions } from '@/features/customers/hooks/use-customers'
import { useProductOptions } from '@/features/products/hooks/use-products'
import { useCurrentDeliveries } from '../hooks/use-current-deliveries'
import { useDeliveryCounts } from '../hooks/use-delivery-counts'
import { useOrgUsers } from '../hooks/use-org-users'
import { useScheduleTopUp } from '../hooks/use-schedule-top-up'
import { matchesTimingFilter } from '../deliveries.schedule-view'
import type { DeliveryTimingFilter } from '../deliveries.schedule-view'
import type { Delivery, DeliveryStatus } from '../deliveries.types'
import { CreateUnifiedDeliveryDialog } from './create-unified-delivery-dialog'
import { DeliveriesTable } from './deliveries-table'
import { DeliveryEditDialog } from './delivery-edit-dialog'
import { DeliveryHistoryDialog } from './delivery-history-dialog'
import { ScheduleListDialog } from './schedule-list-dialog'

const EMPTY_DELIVERIES: Delivery[] = []

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'for_delivery', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

const TIMING_FILTERS = [
  { value: 'all', label: 'All dates' },
  { value: 'today', label: 'Due today' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'upcoming', label: 'Upcoming' },
] as const

type DeliveryStatusFilter = DeliveryStatus | 'all'

// ponytail: native select — the browser draws the arrow and the mobile picker for free.
const FILTER_SELECT =
  'rounded-[11px] border border-[var(--app-border-strong)] bg-[var(--app-surface-2)] px-3 py-2.5 text-[13.5px] font-semibold text-[var(--app-text)] font-[inherit] outline-none cursor-pointer'

export function DeliveriesPage() {
  const [page, setPage] = useState(0)
  const deliveriesQuery = useCurrentDeliveries(page)
  const countsQuery = useDeliveryCounts()
  const customersQuery = useCustomerOptions()
  const productsQuery = useProductOptions()
  const usersQuery = useOrgUsers()
  // Rolling materialization (ADR 0002): keeps recurring routes generating work.
  useScheduleTopUp()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<DeliveryStatusFilter>('all')
  // Opens on today's runs; purely client-side over the already-fetched page, so no extra request.
  const [timingFilter, setTimingFilter] = useState<DeliveryTimingFilter>('today')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [editing, setEditing] = useState<Delivery | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [schedulesOpen, setSchedulesOpen] = useState(false)

  const deliveries = deliveriesQuery.data?.deliveries ?? EMPTY_DELIVERIES
  const hasNext = deliveriesQuery.data?.hasNext ?? false

  const filteredDeliveries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const today = new Date().toLocaleDateString('en-CA')
    return deliveries
      .filter((d) => (statusFilter === 'all' ? true : d.status === statusFilter))
      .filter((d) => matchesTimingFilter(d, timingFilter, today))
      .filter((d) => {
        if (!q) return true
        const info = d.scheduleInfo
        return (
          d.deliveryDate.includes(q) ||
          d.status.replace('_', ' ').includes(q) ||
          (d.notes?.toLowerCase().includes(q) ?? false) ||
          (info?.guestName?.toLowerCase().includes(q) ?? false) ||
          d.items.some((item) => item.productName.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate))
  }, [deliveries, searchQuery, statusFilter, timingFilter])

  const isReferenceLoading =
    customersQuery.isPending || productsQuery.isPending || usersQuery.isPending
  const referenceError = customersQuery.error ?? productsQuery.error ?? usersQuery.error

  useEffect(() => {
    if (!toastMessage) return
    const id = window.setTimeout(() => setToastMessage(null), 3000)
    return () => window.clearTimeout(id)
  }, [toastMessage])

  const counts = countsQuery.data

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-[26px] pb-14 sm:px-7">

      {/* ─── header ─── */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="mb-[9px] text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--app-brand)]">
            Routes &amp; scheduling
          </div>
          <h1 className="mb-[7px] text-[29px] font-extrabold tracking-[-0.025em] text-[var(--app-text)]">
            Deliveries
          </h1>
          <p className="max-w-[560px] text-[14.5px] leading-[1.55] text-[var(--app-text-muted)]">
            Plan refill drop-offs and bulk orders — set a weekly route or pick exact dates, attach the jugs, and track every delivery from pending to done.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="inline-flex cursor-pointer items-center gap-[7px] rounded-[11px] border border-[var(--app-border-strong)] bg-[var(--app-chip-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--app-brand)]"
          >
            <History className="h-4 w-4" />
            History
          </button>
          <button
            type="button"
            onClick={() => setSchedulesOpen(true)}
            className="inline-flex cursor-pointer items-center gap-[7px] rounded-[11px] border border-[var(--app-border-strong)] bg-[var(--app-chip-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--app-brand)]"
          >
            <CalendarClock className="h-4 w-4" />
            Schedules
          </button>
          <CreateUnifiedDeliveryDialog
            customers={customersQuery.data ?? []}
            products={productsQuery.data ?? []}
            users={usersQuery.data ?? []}
            usersLoading={usersQuery.isPending}
            disabled={isReferenceLoading || Boolean(referenceError)}
            onCreated={() => setToastMessage('Delivery scheduled successfully.')}
          />
        </div>
      </div>

      {/* ─── stat cards ─── */}
      <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3.5">
        {/* featured gradient card */}
        <article className="relative overflow-hidden rounded-[16px] bg-[linear-gradient(150deg,#0b73c8,#075098)] px-4 py-[15px] shadow-[0_14px_30px_rgba(14,108,196,0.26)]">
          <div className="absolute -right-4 -bottom-[22px] leading-none opacity-[0.22]">
            <svg width="150" height="80" viewBox="0 0 150 80" preserveAspectRatio="none">
              <path d="M0 44 C30 26 55 56 85 42 C115 28 135 50 150 40 L150 80 L0 80 Z" fill="#fff" />
            </svg>
          </div>
          <div className="relative">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#bfe2ff]">Scheduled today</div>
              <div className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-white/[0.18] text-white">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 6.5h10v9H3z" /><path d="M13 9.5h3.6l3.4 3.3v2.7H13z" /><circle cx="7" cy="17.5" r="1.7" /><circle cx="17" cy="17.5" r="1.7" /></svg>
              </div>
            </div>
            <div className="text-[25px] font-extrabold leading-none tracking-[-0.03em] text-white">
              {countsQuery.isPending ? '—' : (counts?.activeToday ?? 0)}
            </div>
            <div className="mt-[7px] text-[12px] text-[#bfe2ff]">Pending runs for today</div>
          </div>
        </article>

        {/* in progress */}
        <StatCard
          label="In progress"
          value={counts?.forDelivery ?? 0}
          description="On the road right now"
          accentClass="border-l-[#38bdf8]"
          chipClass="bg-[var(--app-chip-bg)] text-[var(--app-brand)]"
          isLoading={countsQuery.isPending}
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 2" /><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v3h3" /></svg>
          }
        />

        {/* this week */}
        <StatCard
          label="This week"
          value={counts?.thisWeek ?? 0}
          description="Drop-offs in the next 7 days"
          accentClass="border-l-[#f59e0b]"
          chipClass="bg-[var(--app-chip-amber-bg)] text-[var(--app-chip-amber-text)]"
          isLoading={countsQuery.isPending}
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>
          }
        />

        {/* recurring routes */}
        <StatCard
          label="Recurring"
          value={counts?.activeWeeklySchedules ?? 0}
          description="From weekly route plans"
          accentClass="border-l-[#8b5cf6]"
          chipClass="bg-[rgba(139,92,246,0.14)] text-[#8b5cf6]"
          isLoading={countsQuery.isPending}
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
          }
        />
      </div>

      {/* ─── table card ─── */}
      <div className="overflow-hidden rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">

        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-[var(--app-border)] p-4 sm:px-[18px]">
          <div className="relative min-w-[210px] max-w-[340px] flex-1">
            <span className="pointer-events-none absolute left-[13px] top-1/2 -translate-y-1/2 text-[var(--app-text-faint)]">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer or address…"
              className="w-full rounded-[11px] border border-[var(--app-border-strong)] bg-[var(--app-surface-2)] py-2.5 pl-[39px] pr-3.5 text-sm font-[inherit] text-[var(--app-text)] outline-none"
            />
          </div>

          {/* Dropdowns keep the toolbar to one line on a phone. */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="delivery-timing-filter">Schedule date</label>
            <select
              id="delivery-timing-filter"
              value={timingFilter}
              onChange={(e) => setTimingFilter(e.target.value as DeliveryTimingFilter)}
              className={FILTER_SELECT}
            >
              {TIMING_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>

            <label className="sr-only" htmlFor="delivery-status-filter">Status</label>
            <select
              id="delivery-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DeliveryStatusFilter)}
              className={FILTER_SELECT}
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        {deliveriesQuery.isFetching && !deliveriesQuery.isPending ? <AquaProgressBar /> : null}

        {referenceError ? (
          <ErrorState message={referenceError.message} />
        ) : deliveriesQuery.isPending || isReferenceLoading ? (
          <LoadingState />
        ) : deliveriesQuery.isError ? (
          <ErrorState message={deliveriesQuery.error.message} />
        ) : deliveries.length === 0 ? (
          <EmptyState onSchedule={() => document.querySelector<HTMLButtonElement>('[data-create-delivery]')?.click()} />
        ) : filteredDeliveries.length === 0 ? (
          <NoResultsState onClear={() => { setSearchQuery(''); setStatusFilter('all'); setTimingFilter('all') }} />
        ) : (
          <DeliveriesTable
            deliveries={filteredDeliveries}
            customers={customersQuery.data ?? []}
            products={productsQuery.data ?? []}
            users={usersQuery.data ?? []}
            onStatusChanged={(msg) => setToastMessage(msg)}
            onStatusError={(msg) => setToastMessage(msg)}
            onEdit={(delivery) => setEditing(delivery)}
          />
        )}

        {/* pagination footer */}
        {!deliveriesQuery.isError && (deliveries.length > 0 || page > 0) ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-border)] px-[22px] py-3.5 text-[13px] text-[var(--app-text-soft)]">
            <span>Page <strong className="font-semibold text-[var(--app-text)]">{page + 1}</strong>{deliveriesQuery.isFetching ? ' · updating…' : ''}</span>
            <div className="flex gap-2">
              <PagBtn onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || deliveriesQuery.isFetching}>← Prev</PagBtn>
              <PagBtn onClick={() => setPage((p) => p + 1)} disabled={!hasNext || deliveriesQuery.isFetching}>Next →</PagBtn>
            </div>
          </div>
        ) : null}
      </div>

      {/* ─── dialogs ─── */}
      {toastMessage ? <DeliveryToast message={toastMessage} /> : null}

      <DeliveryEditDialog
        delivery={editing}
        products={productsQuery.data ?? []}
        onOpenChange={(open) => { if (!open) setEditing(null) }}
        onSaved={() => setToastMessage('Delivery updated successfully.')}
      />
      <DeliveryHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
      <ScheduleListDialog open={schedulesOpen} onOpenChange={setSchedulesOpen} />
    </div>
  )
}

function StatCard({ label, value, description, accentClass, chipClass, isLoading, icon }: {
  label: string
  value: number
  description: string
  accentClass: string
  chipClass: string
  isLoading: boolean
  icon: React.ReactNode
}) {
  return (
    <article className={cn('rounded-[16px] border border-l-[3px] border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-[15px] shadow-[var(--app-shadow-card)]', accentClass)}>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--app-text-faint)]">{label}</div>
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-[9px]', chipClass)}>{icon}</div>
      </div>
      <div className="text-[25px] font-extrabold leading-none tracking-[-0.03em] text-[var(--app-text)]">
        {isLoading ? <span className="text-[var(--app-text-faint)]">—</span> : value}
      </div>
      <div className="mt-[7px] text-[12px] text-[var(--app-text-soft)]">{description}</div>
    </article>
  )
}

function PagBtn({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-[10px] border border-[var(--app-border-strong)] px-3.5 py-2 text-[13px] font-semibold',
        disabled
          ? 'cursor-default bg-[var(--app-surface-2)] text-[var(--app-text-faint)]'
          : 'cursor-pointer bg-[var(--app-surface)] text-[var(--app-text-muted)]',
      )}
    >
      {children}
    </button>
  )
}

function DeliveryToast({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-[90] flex max-w-[360px] items-center gap-3 rounded-[16px] border border-[rgba(0,245,212,0.3)] bg-[var(--app-surface)] px-4 py-3 text-sm font-semibold text-[var(--app-chip-green-text)] shadow-[0_18px_44px_rgba(0,48,73,0.16)]"
    >
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-[rgba(0,245,212,0.15)] text-[var(--app-chip-green-text)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.2 4.2L19 7" /></svg>
      </span>
      {message}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="p-3">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className={cn(
            'grid grid-cols-[2fr_1.5fr_1fr_1fr_1.2fr_52px] gap-3 px-[22px] py-3.5',
            i > 0 && 'border-t border-[var(--app-border)]',
          )}
        >
          {Array.from({ length: 6 }, (__, j) => (
            <AquaSkeleton key={j} className="h-[18px]" />
          ))}
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onSchedule }: { onSchedule: () => void }) {
  return (
    <div className="px-6 py-[62px] text-center">
      <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-[var(--app-chip-bg)] text-[var(--app-brand)]">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M3 6.5h10v9H3z" /><path d="M13 9.5h3.6l3.4 3.3v2.7H13z" /><circle cx="7" cy="17.5" r="1.7" /><circle cx="17" cy="17.5" r="1.7" /></svg>
      </div>
      <div className="mb-2 text-[19px] font-bold text-[var(--app-text)]">No deliveries scheduled</div>
      <p className="mx-auto mb-5 max-w-[380px] text-sm leading-[1.6] text-[var(--app-text-muted)]">Schedule your first drop-off — set a recurring weekly route or pick exact dates on the calendar.</p>
      <button
        type="button"
        onClick={onSchedule}
        className="inline-flex cursor-pointer items-center gap-2 rounded-[12px] bg-[linear-gradient(150deg,#3fb0f0,#0a6cc4)] px-[22px] py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(14,108,196,0.3)]"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Schedule delivery
      </button>
    </div>
  )
}

function NoResultsState({ onClear }: { onClear: () => void }) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto mb-[18px] flex h-16 w-16 items-center justify-center rounded-[18px] bg-[var(--app-surface-2)] text-[var(--app-text-faint)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
      </div>
      <div className="mb-1.5 text-[17px] font-bold text-[var(--app-text)]">No matching deliveries</div>
      <p className="mb-[18px] text-sm text-[var(--app-text-muted)]">Try a different search, date, or status filter.</p>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex cursor-pointer items-center gap-2 rounded-[11px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-[18px] py-2.5 text-[13.5px] font-semibold text-[var(--app-brand)]"
      >
        Clear filters
      </button>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="m-4 rounded-[12px] border border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.05)] px-4 py-3 text-sm text-[#b91c1c]">
      {message}
    </div>
  )
}
