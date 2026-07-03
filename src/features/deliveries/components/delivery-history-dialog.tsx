'use client'

import { useState } from 'react'

import { AppModal } from '@/components/app/app-modal'
import { pesoFormatter } from '../deliveries.constants'
import type { Delivery } from '../deliveries.types'
import { useDeliveryHistory } from '../hooks/use-delivery-history'
import { DeliveryStatusMenu } from './delivery-status-menu'

interface DeliveryHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const HISTORY_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
)

export function DeliveryHistoryDialog({
  open,
  onOpenChange,
}: DeliveryHistoryDialogProps) {
  const [page, setPage] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const query = useDeliveryHistory(page, open)

  const deliveries = query.data?.deliveries ?? []
  const hasNext = query.data?.hasNext ?? false

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPage(0)
      setMessage(null)
    }
    onOpenChange(next)
  }

  return (
    <AppModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Delivery history"
      description="Completed, failed, and cancelled delivery runs."
      icon={HISTORY_ICON}
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
          <HistorySkeleton />
        ) : query.isError ? (
          <p role="alert" style={{ borderRadius: '11px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)', padding: '10px 13px', fontSize: '13.5px', color: '#dc2626' }}>
            {query.error.message}
          </p>
        ) : deliveries.length === 0 ? (
          <p style={{ padding: '38px 0', textAlign: 'center', fontSize: '14px', color: 'var(--app-text-muted)' }}>
            No completed, failed, or cancelled deliveries yet.
          </p>
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', margin: 0, padding: 0 }}>
            {deliveries.map((delivery) => (
              <HistoryRow
                key={delivery.id}
                delivery={delivery}
                onReverted={(text) => setMessage(text)}
                onError={(text) => setMessage(text)}
              />
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

function HistoryRow({
  delivery,
  onReverted,
  onError,
}: {
  delivery: Delivery
  onReverted: (message: string) => void
  onError: (message: string) => void
}) {
  const isFailed = delivery.status === 'failed'
  const isCancelled = delivery.status === 'cancelled'

  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', borderRadius: '14px', border: '1px solid var(--app-border)', background: 'var(--app-surface)', padding: '12px' }}>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <HistoryStatusBadge status={delivery.status} />
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--app-text)' }}>
            {formatDate(delivery.deliveryDate)}
          </span>
          <span style={{ fontSize: '13.5px', color: 'var(--app-text-soft)' }}>
            {pesoFormatter.format(delivery.total)}
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--app-text-soft)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {delivery.items.map((item) => item.productName).join(', ') || 'No items'}
        </p>
        {isFailed && delivery.failureRemarks ? (
          <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>Reason: {delivery.failureRemarks}</p>
        ) : null}
        {isCancelled && delivery.cancellationRemarks ? (
          <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>Reason: {delivery.cancellationRemarks}</p>
        ) : null}
      </div>
      <DeliveryStatusMenu delivery={delivery} onChanged={onReverted} onError={onError} />
    </li>
  )
}

function HistoryStatusBadge({ status }: { status: Delivery['status'] }) {
  const isFailed = status === 'failed'
  const isCancelled = status === 'cancelled'
  const bg = isFailed || isCancelled ? 'var(--app-chip-red-bg)' : 'var(--app-chip-green-bg)'
  const text = isFailed || isCancelled ? 'var(--app-chip-red-text)' : 'var(--app-chip-green-text)'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '8px', background: bg, color: text, padding: '4px 10px', fontSize: '11.5px', fontWeight: 700, textTransform: 'capitalize' }}>
      {status.replace('_', ' ')}
    </span>
  )
}

function HistorySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} style={{ height: '64px', borderRadius: '14px', background: 'var(--app-surface-2)', animation: 'pulse 1.4s ease-in-out infinite' }} />
      ))}
    </div>
  )
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}
