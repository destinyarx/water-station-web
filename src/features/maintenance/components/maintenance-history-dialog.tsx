'use client'

import { useState } from 'react'

import { AppModal } from '@/components/app/app-modal'

import { useMaintenanceHistory } from '../hooks/use-maintenance-history'
import type { MaintenanceHistoryEntry } from '../maintenance.types'
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

const PRIORITY_STYLE: Record<MaintenanceHistoryEntry['priority'], { className: string; label: string }> = {
  high: { className: 'bg-[var(--app-chip-red-bg)] text-[var(--app-chip-red-text)]', label: 'High' },
  medium: { className: 'bg-[var(--app-chip-amber-bg)] text-[var(--app-chip-amber-text)]', label: 'Medium' },
  low: { className: 'bg-[var(--app-chip-bg)] text-[var(--app-brand)]', label: 'Low' },
}

/** Read-only log of completed and cancelled upkeep, server-paginated. */
export function MaintenanceHistoryDialog({ open, onOpenChange }: MaintenanceHistoryDialogProps) {
  const [page, setPage] = useState(0)
  const history = useMaintenanceHistory(page, open)

  function handleOpenChange(next: boolean): void {
    if (!next) setPage(0)
    onOpenChange(next)
  }

  return (
    <AppModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Maintenance history"
      description="Completed and cancelled maintenance occurrences."
      icon={HISTORY_ICON}
      maxWidth="1200px"
      bodyPadding="20px 26px 0"
    >
      <div className="max-h-[58vh] overflow-y-auto pb-4 pr-[26px]">
        {history.isPending ? (
          <HistorySkeleton />
        ) : history.isError ? (
          <p role="alert" className="rounded-[11px] border border-red-600/30 bg-red-600/6 px-[13px] py-2.5 text-[13.5px] text-red-600">
            {history.error?.message ?? 'Something went wrong.'}
          </p>
        ) : history.entries.length === 0 ? (
          <p className="py-[38px] text-center text-sm text-[var(--app-text-muted)]">
            No maintenance history yet.
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {history.entries.map((entry) => <HistoryRow key={entry.id} entry={entry} />)}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--app-border)] py-3.5">
        <span className="text-[13px] text-[var(--app-text-soft)]">
          Page {page + 1}{history.isFetching ? ' · updating…' : ''}
        </span>
        <div className="flex gap-2">
          <PagBtn onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0 || history.isFetching}>← Prev</PagBtn>
          <PagBtn onClick={() => setPage((current) => current + 1)} disabled={!history.hasNext || history.isFetching}>Next →</PagBtn>
        </div>
      </div>
    </AppModal>
  )
}

function HistoryRow({ entry }: { entry: MaintenanceHistoryEntry }) {
  const priority = PRIORITY_STYLE[entry.priority]
  const cancelled = entry.status === 'cancelled'

  return (
    <li className="grid gap-4 rounded-[14px] border border-[var(--app-border)] bg-[var(--app-surface)] p-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(190px,0.8fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={cancelled
            ? 'inline-flex items-center rounded-lg bg-[var(--app-chip-gray-bg)] px-2.5 py-1 text-[11.5px] font-bold text-[var(--app-chip-gray-text)]'
            : 'inline-flex items-center rounded-lg bg-[var(--app-chip-green-bg)] px-2.5 py-1 text-[11.5px] font-bold text-[var(--app-chip-green-text)]'}>
            {cancelled ? 'Cancelled' : 'Completed'}
          </span>
          <span className={`rounded-full px-[9px] py-0.5 text-[11px] font-semibold ${priority.className}`}>
            {priority.label}
          </span>
        </div>
        <h3 className="truncate text-[14.5px] font-bold text-[var(--app-text)]">{entry.title}</h3>
        <p className="mt-1 truncate text-[12.5px] text-[var(--app-text-soft)]">{entry.equipmentLabel}</p>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12.5px] sm:grid-cols-1">
        <div className="flex min-w-0 gap-1.5">
          <dt className="text-[var(--app-text-faint)]">Assigned to</dt>
          <dd className="truncate font-medium text-[var(--app-text-soft)]">{entry.assigneeName}</dd>
        </div>
        {!cancelled ? (
          <div className="flex min-w-0 gap-1.5">
            <dt className="text-[var(--app-text-faint)]">Completed by</dt>
            <dd className="truncate font-medium text-[var(--app-text-soft)]">{entry.completedByName}</dd>
          </div>
        ) : null}
      </dl>

      <div className="text-left sm:text-right">
        <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--app-text-faint)]">
          {cancelled ? 'Cancelled on' : 'Completed on'}
        </p>
        <p className="mt-1 whitespace-nowrap text-[13px] font-semibold text-[var(--app-text)]">{entry.actionLabel}</p>
        <p className="mt-1 whitespace-nowrap text-xs text-[var(--app-text-faint)]">Scheduled {formatDate(entry.dueDate)}</p>
      </div>
    </li>
  )
}

function PagBtn({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-[10px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3.5 py-2 text-[13px] font-semibold text-[var(--app-text-muted)] disabled:cursor-default disabled:bg-[var(--app-surface-2)] disabled:text-[var(--app-text-faint)]"
    >
      {children}
    </button>
  )
}

function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-[92px] animate-pulse rounded-[14px] bg-[var(--app-surface-2)]" />
      ))}
    </div>
  )
}
