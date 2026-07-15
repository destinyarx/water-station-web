'use client'

import { useState } from 'react'

import { AppModal } from '@/components/app/app-modal'

import type { MaintenanceHistoryEntry } from '../maintenance.types'
import { useMaintenanceHistory } from '../hooks/use-maintenance-history'
import { formatDate } from '../maintenance.view'

interface MaintenanceHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const HISTORY_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
)

const PRIORITY_STYLE: Record<MaintenanceHistoryEntry['priority'], { bg: string; text: string; label: string }> = {
  high: { bg: 'var(--app-chip-red-bg)', text: 'var(--app-chip-red-text)', label: 'High' },
  medium: { bg: 'var(--app-chip-amber-bg)', text: 'var(--app-chip-amber-text)', label: 'Medium' },
  low: { bg: 'var(--app-chip-bg)', text: 'var(--app-brand)', label: 'Low' },
}

/** Read-only log of completed upkeep, server-paginated. Mirrors delivery history. */
export function MaintenanceHistoryDialog({ open, onOpenChange }: MaintenanceHistoryDialogProps) {
  const [page, setPage] = useState(0)
  const history = useMaintenanceHistory(page, open)

  function handleOpenChange(next: boolean) {
    if (!next) setPage(0)
    onOpenChange(next)
  }

  return (
    <AppModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Maintenance history"
      description="Upkeep that has been completed."
      icon={HISTORY_ICON}
      maxWidth="640px"
      bodyPadding="20px 26px 0"
    >
      <div style={{ maxHeight: '58vh', overflowY: 'auto', paddingBottom: '16px' }}>
        {history.isPending ? (
          <HistorySkeleton />
        ) : history.isError ? (
          <p role="alert" style={{ borderRadius: '11px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)', padding: '10px 13px', fontSize: '13.5px', color: '#dc2626' }}>
            {history.error?.message ?? 'Something went wrong.'}
          </p>
        ) : history.entries.length === 0 ? (
          <p style={{ padding: '38px 0', textAlign: 'center', fontSize: '14px', color: 'var(--app-text-muted)' }}>
            No completed maintenance yet.
          </p>
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', margin: 0, padding: 0 }}>
            {history.entries.map((entry) => (
              <HistoryRow key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 0', borderTop: '1px solid var(--app-border)' }}>
        <span style={{ fontSize: '13px', color: 'var(--app-text-soft)' }}>
          Page {page + 1}
          {history.isFetching ? ' · updating…' : ''}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <PagBtn onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0 || history.isFetching}>← Prev</PagBtn>
          <PagBtn onClick={() => setPage((current) => current + 1)} disabled={!history.hasNext || history.isFetching}>Next →</PagBtn>
        </div>
      </div>
    </AppModal>
  )
}

function HistoryRow({ entry }: { entry: MaintenanceHistoryEntry }) {
  const priority = PRIORITY_STYLE[entry.priority]
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', borderRadius: '14px', border: '1px solid var(--app-border)', background: 'var(--app-surface)', padding: '12px' }}>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '8px', background: 'var(--app-chip-green-bg)', color: 'var(--app-chip-green-text)', padding: '4px 10px', fontSize: '11.5px', fontWeight: 700 }}>
            Completed
          </span>
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--app-text)' }}>{entry.title}</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: priority.text, background: priority.bg, borderRadius: '99px', padding: '2px 9px' }}>
            {priority.label}
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--app-text-soft)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {entry.equipmentLabel} · by {entry.completedByName}
        </p>
        <p style={{ fontSize: '12.5px', color: 'var(--app-text-faint)', margin: 0 }}>
          Due {formatDate(entry.dueDate)}
        </p>
      </div>
      <span style={{ flex: 'none', fontSize: '12.5px', fontWeight: 600, color: 'var(--app-text-soft)', whiteSpace: 'nowrap' }}>
        {entry.completedLabel}
      </span>
    </li>
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

function HistorySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} style={{ height: '78px', borderRadius: '14px', background: 'var(--app-surface-2)', animation: 'pulse 1.4s ease-in-out infinite' }} />
      ))}
    </div>
  )
}
