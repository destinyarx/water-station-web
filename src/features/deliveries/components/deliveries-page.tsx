'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, History } from 'lucide-react'

import { useCustomerOptions } from '@/features/customers/hooks/use-customers'
import { useProductOptions } from '@/features/products/hooks/use-products'
import { useCurrentDeliveries } from '../hooks/use-current-deliveries'
import { useDeliveryCounts } from '../hooks/use-delivery-counts'
import { useOrgUsers } from '../hooks/use-org-users'
import type { Delivery, DeliveryStatus } from '../deliveries.types'
import { CreateUnifiedDeliveryDialog } from './create-unified-delivery-dialog'
import { DeliveriesTable } from './deliveries-table'
import { DeliveryEditDialog } from './delivery-edit-dialog'
import { DeliveryHistoryDialog } from './delivery-history-dialog'
import { ScheduleListDialog } from './schedule-list-dialog'

const EMPTY_DELIVERIES: Delivery[] = []

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'for_delivery', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

type DeliveryStatusFilter = DeliveryStatus | 'all'

export function DeliveriesPage() {
  const [page, setPage] = useState(0)
  const deliveriesQuery = useCurrentDeliveries(page)
  const countsQuery = useDeliveryCounts()
  const customersQuery = useCustomerOptions()
  const productsQuery = useProductOptions()
  const usersQuery = useOrgUsers()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<DeliveryStatusFilter>('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [editing, setEditing] = useState<Delivery | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [schedulesOpen, setSchedulesOpen] = useState(false)

  const deliveries = deliveriesQuery.data?.deliveries ?? EMPTY_DELIVERIES
  const hasNext = deliveriesQuery.data?.hasNext ?? false

  const filteredDeliveries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return deliveries
      .filter((d) => (statusFilter === 'all' ? true : d.status === statusFilter))
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
  }, [deliveries, searchQuery, statusFilter])

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '26px 28px 56px' }}>

      {/* ─── header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--app-brand)', marginBottom: '9px' }}>
            Routes &amp; scheduling
          </div>
          <h1 style={{ fontSize: '29px', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 7px', color: 'var(--app-text)' }}>
            Deliveries
          </h1>
          <p style={{ fontSize: '14.5px', lineHeight: 1.55, color: 'var(--app-text-muted)', margin: 0, maxWidth: '560px' }}>
            Plan refill drop-offs and bulk orders — set a weekly route or pick exact dates, attach the jugs, and track every delivery from pending to done.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 16px', borderRadius: '11px', border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)', color: 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            <History style={{ width: 16, height: 16 }} />
            History
          </button>
          <button
            type="button"
            onClick={() => setSchedulesOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 16px', borderRadius: '11px', border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)', color: 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            <CalendarClock style={{ width: 16, height: 16 }} />
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '14px', marginBottom: '18px' }}>
        {/* featured gradient card */}
        <article style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg,#0b73c8,#075098)', borderRadius: '16px', padding: '15px 16px', boxShadow: '0 14px 30px rgba(14,108,196,0.26)' }}>
          <div style={{ position: 'absolute', right: -16, bottom: -22, lineHeight: 0, opacity: 0.22 }}>
            <svg width="150" height="80" viewBox="0 0 150 80" preserveAspectRatio="none">
              <path d="M0 44 C30 26 55 56 85 42 C115 28 135 50 150 40 L150 80 L0 80 Z" fill="#fff" />
            </svg>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#bfe2ff' }}>Scheduled today</div>
              <div style={{ width: '28px', height: '28px', borderRadius: '9px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 6.5h10v9H3z" /><path d="M13 9.5h3.6l3.4 3.3v2.7H13z" /><circle cx="7" cy="17.5" r="1.7" /><circle cx="17" cy="17.5" r="1.7" /></svg>
              </div>
            </div>
            <div style={{ fontSize: '25px', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1 }}>
              {countsQuery.isPending ? '—' : (counts?.activeToday ?? 0)}
            </div>
            <div style={{ fontSize: '12px', color: '#bfe2ff', marginTop: '7px' }}>Pending runs for today</div>
          </div>
        </article>

        {/* in progress */}
        <StatCard
          label="In progress"
          value={counts?.forDelivery ?? 0}
          description="On the road right now"
          accentColor="#38bdf8"
          chipBg="var(--app-chip-bg)"
          chipColor="var(--app-brand)"
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
          accentColor="#f59e0b"
          chipBg="var(--app-chip-amber-bg)"
          chipColor="var(--app-chip-amber-text)"
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
          accentColor="#8b5cf6"
          chipBg="rgba(139,92,246,0.14)"
          chipColor="#8b5cf6"
          isLoading={countsQuery.isPending}
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
          }
        />
      </div>

      {/* ─── table card ─── */}
      <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--app-shadow-card)' }}>

        {/* toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '16px 18px', borderBottom: '1px solid var(--app-border)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '210px', maxWidth: '340px' }}>
            <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--app-text-faint)', pointerEvents: 'none' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer or address…"
              style={{ width: '100%', padding: '10px 14px 10px 39px', border: '1px solid var(--app-border-strong)', borderRadius: '11px', background: 'var(--app-surface-2)', color: 'var(--app-text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'inline-flex', padding: '4px', gap: '3px', background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: '12px', flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((f) => {
              const active = statusFilter === f.value
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setStatusFilter(f.value as DeliveryStatusFilter)}
                  style={{ padding: '8px 13px', border: 'none', borderRadius: '9px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: active ? 700 : 400, background: active ? 'var(--app-surface)' : 'transparent', color: active ? 'var(--app-text)' : 'var(--app-text-soft)', boxShadow: active ? '0 2px 6px rgba(14,108,196,0.08)' : 'none' }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {referenceError ? (
          <ErrorState message={referenceError.message} />
        ) : deliveriesQuery.isPending || isReferenceLoading ? (
          <LoadingState />
        ) : deliveriesQuery.isError ? (
          <ErrorState message={deliveriesQuery.error.message} />
        ) : deliveries.length === 0 ? (
          <EmptyState onSchedule={() => document.querySelector<HTMLButtonElement>('[data-create-delivery]')?.click()} />
        ) : filteredDeliveries.length === 0 ? (
          <NoResultsState onClear={() => { setSearchQuery(''); setStatusFilter('all') }} />
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderTop: '1px solid var(--app-border)', fontSize: '13px', color: 'var(--app-text-soft)' }}>
            <span>Page <strong style={{ color: 'var(--app-text)', fontWeight: 600 }}>{page + 1}</strong>{deliveriesQuery.isFetching ? ' · updating…' : ''}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
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
      <ScheduleListDialog open={schedulesOpen} onOpenChange={setSchedulesOpen} customers={customersQuery.data ?? []} />
    </div>
  )
}

function StatCard({ label, value, description, accentColor, chipBg, chipColor, isLoading, icon }: {
  label: string
  value: number
  description: string
  accentColor: string
  chipBg: string
  chipColor: string
  isLoading: boolean
  icon: React.ReactNode
}) {
  return (
    <article style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderLeft: `3px solid ${accentColor}`, borderRadius: '16px', padding: '15px 16px', boxShadow: 'var(--app-shadow-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--app-text-faint)' }}>{label}</div>
        <div style={{ width: '28px', height: '28px', borderRadius: '9px', background: chipBg, color: chipColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div style={{ fontSize: '25px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--app-text)', lineHeight: 1 }}>
        {isLoading ? <span style={{ color: 'var(--app-text-faint)' }}>—</span> : value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--app-text-soft)', marginTop: '7px' }}>{description}</div>
    </article>
  )
}

function PagBtn({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--app-border-strong)', background: disabled ? 'var(--app-surface-2)' : 'var(--app-surface)', color: disabled ? 'var(--app-text-faint)' : 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, cursor: disabled ? 'default' : 'pointer' }}
    >
      {children}
    </button>
  )
}

function DeliveryToast({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite" style={{ position: 'fixed', right: '16px', top: '16px', zIndex: 90, display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--app-surface)', border: '1px solid rgba(0,245,212,0.3)', borderRadius: '16px', padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: 'var(--app-chip-green-text)', boxShadow: '0 18px 44px rgba(0,48,73,0.16)', maxWidth: '360px' }}>
      <span style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(0,245,212,0.15)', color: 'var(--app-chip-green-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.2 4.2L19 7" /></svg>
      </span>
      {message}
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ padding: '12px' }}>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1.2fr 52px', gap: '12px', padding: '14px 22px', borderTop: i > 0 ? '1px solid var(--app-border)' : 'none' }}>
          {Array.from({ length: 6 }, (__, j) => (
            <div key={j} style={{ height: '18px', borderRadius: '8px', background: 'var(--app-surface-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onSchedule }: { onSchedule: () => void }) {
  return (
    <div style={{ padding: '62px 24px', textAlign: 'center' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '22px', background: 'var(--app-chip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--app-brand)' }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M3 6.5h10v9H3z" /><path d="M13 9.5h3.6l3.4 3.3v2.7H13z" /><circle cx="7" cy="17.5" r="1.7" /><circle cx="17" cy="17.5" r="1.7" /></svg>
      </div>
      <div style={{ fontSize: '19px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '8px' }}>No deliveries scheduled</div>
      <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', margin: '0 auto 20px', maxWidth: '380px', lineHeight: 1.6 }}>Schedule your first drop-off — set a recurring weekly route or pick exact dates on the calendar.</p>
      <button type="button" onClick={onSchedule} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, padding: '12px 22px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 10px 24px rgba(14,108,196,0.3)' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Schedule delivery
      </button>
    </div>
  )
}

function NoResultsState({ onClear }: { onClear: () => void }) {
  return (
    <div style={{ padding: '56px 24px', textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--app-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: 'var(--app-text-faint)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
      </div>
      <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '6px' }}>No matching deliveries</div>
      <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', margin: '0 0 18px' }}>Try a different search or status filter.</p>
      <button type="button" onClick={onClear} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--app-surface)', border: '1px solid var(--app-border-strong)', color: 'var(--app-brand)', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 600, padding: '10px 18px', borderRadius: '11px', cursor: 'pointer' }}>
        Clear filters
      </button>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" style={{ margin: '16px', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)', fontSize: '14px', color: '#b91c1c' }}>
      {message}
    </div>
  )
}
