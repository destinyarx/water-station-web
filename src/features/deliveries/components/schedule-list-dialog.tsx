'use client'

import { useMemo, useState } from 'react'

import { AppModal } from '@/components/app/app-modal'
import type { Customer } from '@/features/customers/customers.types'
import { MATERIALIZE_HORIZON_DAYS } from '../deliveries.constants'
import {
  nextUpcomingDate,
  recurrenceSummary,
  scheduleRecipient,
} from '../deliveries.schedule-view'
import type { DeliveryScheduleRow } from '../deliveries.types'
import { useScheduleStatus } from '../hooks/use-schedule-status'
import { useSchedules } from '../hooks/use-schedules'

interface ScheduleListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customers: Customer[]
}

const SCHEDULE_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round">
    <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
    <path d="M3 9h18M8 2.5v4M16 2.5v4" />
  </svg>
)

export function ScheduleListDialog({
  open,
  onOpenChange,
  customers,
}: ScheduleListDialogProps) {
  const [page, setPage] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const query = useSchedules(page, open)
  const mutation = useScheduleStatus()

  const customerNames = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  )

  const schedules = query.data?.schedules ?? []
  const hasNext = query.data?.hasNext ?? false
  const today = new Date().toISOString().slice(0, 10)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPage(0)
      setMessage(null)
    }
    onOpenChange(next)
  }

  function toggle(schedule: DeliveryScheduleRow) {
    const action = schedule.status === 'active' ? 'pause' : 'resume'
    mutation.mutate(
      { schedule, action },
      {
        onSuccess: () =>
          setMessage(
            action === 'pause'
              ? 'Schedule stopped. Upcoming runs were removed.'
              : 'Schedule resumed. New runs will be generated.',
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
      description="Standing orders that generate deliveries automatically. Stop to pause future runs; resume to continue."
      icon={SCHEDULE_ICON}
      maxWidth="640px"
      bodyPadding="20px 26px 0"
    >
      <div style={{ maxHeight: '58vh', overflowY: 'auto', paddingBottom: '16px' }}>
        {message ? (
          <p role="status" style={{ borderRadius: '11px', border: '1px solid var(--app-border-strong)', background: 'var(--app-chip-bg)', color: 'var(--app-brand)', padding: '9px 12px', fontSize: '13.5px', fontWeight: 600, margin: '0 0 14px' }}>
            {message}
          </p>
        ) : null}

        {query.isPending ? (
          <ScheduleSkeleton />
        ) : query.isError ? (
          <p role="alert" style={{ borderRadius: '11px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)', padding: '10px 13px', fontSize: '13.5px', color: '#dc2626' }}>
            {query.error.message}
          </p>
        ) : schedules.length === 0 ? (
          <p style={{ padding: '38px 0', textAlign: 'center', fontSize: '14px', color: 'var(--app-text-muted)' }}>
            No recurring schedules yet.
          </p>
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', margin: 0, padding: 0 }}>
            {schedules.map((schedule) => (
              <li
                key={schedule.id}
                style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', borderRadius: '14px', border: '1px solid var(--app-border)', background: 'var(--app-surface)', padding: '12px' }}
              >
                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ScheduleStatusBadge status={schedule.status} />
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--app-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {scheduleRecipient(
                        schedule,
                        schedule.customer_id != null
                          ? customerNames.get(schedule.customer_id) ?? null
                          : null,
                      )}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--app-text-soft)', margin: 0 }}>
                    {recurrenceSummary(schedule)}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--app-text-soft)', margin: 0 }}>
                    Next:{' '}
                    {formatNext(
                      nextUpcomingDate(schedule, today, MATERIALIZE_HORIZON_DAYS),
                      schedule.status,
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => toggle(schedule)}
                  style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 16px', borderRadius: '10px', border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)', color: 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, cursor: mutation.isPending ? 'default' : 'pointer' }}
                >
                  {schedule.status === 'active' ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                      Stop
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7Z" /></svg>
                      Resume
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 0', borderTop: '1px solid var(--app-border)' }}>
        <span style={{ fontSize: '13px', color: 'var(--app-text-soft)' }}>
          Page {page + 1}
          {query.isFetching ? ' · updating…' : ''}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <PagBtn onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0 || query.isFetching}>← Prev</PagBtn>
          <PagBtn onClick={() => setPage((current) => current + 1)} disabled={!hasNext || query.isFetching}>Next →</PagBtn>
        </div>
      </div>
    </AppModal>
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

function ScheduleStatusBadge({
  status,
}: {
  status: DeliveryScheduleRow['status']
}) {
  const bg =
    status === 'active'
      ? 'var(--app-chip-green-bg)'
      : status === 'paused'
        ? 'var(--app-chip-amber-bg)'
        : 'var(--app-chip-gray-bg)'
  const text =
    status === 'active'
      ? 'var(--app-chip-green-text)'
      : status === 'paused'
        ? 'var(--app-chip-amber-text)'
        : 'var(--app-chip-gray-text)'

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '8px', background: bg, color: text, padding: '4px 10px', fontSize: '11.5px', fontWeight: 700, textTransform: 'capitalize' }}>
      {status}
    </span>
  )
}

function ScheduleSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} style={{ height: '80px', borderRadius: '14px', background: 'var(--app-surface-2)', animation: 'pulse 1.4s ease-in-out infinite' }} />
      ))}
    </div>
  )
}

function formatNext(
  value: string | null,
  status: DeliveryScheduleRow['status'],
): string {
  if (status !== 'active') return 'Paused'
  if (!value) return 'None scheduled'
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}
