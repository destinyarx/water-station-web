'use client'

import { useState } from 'react'

import { ConfirmDialog } from '@/components/app/confirm-dialog'

import type { MaintenanceTaskView, TaskDisplayStatus } from '../maintenance.types'
import { useCompleteTask } from '../hooks/use-complete-task'
import { MaintenanceRowActions } from './maintenance-row-actions'

const PRIORITY_STYLE: Record<MaintenanceTaskView['priority'], { bg: string; text: string; label: string }> = {
  high: { bg: 'var(--app-chip-red-bg)', text: 'var(--app-chip-red-text)', label: 'High' },
  medium: { bg: 'var(--app-chip-amber-bg)', text: 'var(--app-chip-amber-text)', label: 'Medium' },
  low: { bg: 'var(--app-chip-bg)', text: 'var(--app-brand)', label: 'Low' },
}

const DUE_STYLE: Record<TaskDisplayStatus, { bg: string; text: string }> = {
  overdue: { bg: 'var(--app-chip-red-bg)', text: 'var(--app-chip-red-text)' },
  upcoming: { bg: 'var(--app-chip-bg)', text: 'var(--app-brand)' },
  completed: { bg: 'var(--app-chip-green-bg)', text: 'var(--app-chip-green-text)' },
}

const checkIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
)

/**
 * A restrained outline control rather than the old gradient pill: the row is a
 * table row, and a filled green button on every one of them read as the loudest
 * thing on the page. Both states use theme tokens, so dark mode follows.
 */
function CompleteButton({ done, isPending, onClick }: { done: boolean; isPending: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const active = hovered && !isPending

  return (
    <button
      type="button"
      aria-label={done ? 'Reopen task' : 'Complete task'}
      disabled={isPending}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        padding: '8px 14px',
        borderRadius: '10px',
        border: `1px solid ${done || active ? 'var(--app-green-deep)' : 'var(--app-border-strong)'}`,
        background: done || active ? 'var(--app-green-soft-bg)' : 'var(--app-surface)',
        color: done || active ? 'var(--app-green-deep)' : 'var(--app-text-muted)',
        fontFamily: 'inherit',
        fontSize: '12.5px',
        fontWeight: 600,
        cursor: isPending ? 'wait' : 'pointer',
        opacity: isPending ? 0.6 : 1,
        transition: 'background 0.12s ease, border-color 0.12s ease, color 0.12s ease',
      }}
    >
      <span style={{ display: 'flex', color: done || active ? 'var(--app-green-deep)' : 'var(--app-text-faint)' }}>
        {checkIcon}
      </span>
      {done ? 'Completed' : 'Complete'}
    </button>
  )
}

/** One occurrence row: complete button, title + meta, due pill, kebab menu. */
export function MaintenanceTaskCard({ task }: { task: MaintenanceTaskView }) {
  const complete = useCompleteTask()
  const [confirming, setConfirming] = useState(false)
  const done = task.displayStatus === 'completed'
  const dimmed = !task.isScheduleActive
  const priority = PRIORITY_STYLE[task.priority]
  const due = DUE_STYLE[task.displayStatus]
  const equipmentLabel = task.equipmentOther ?? task.equipment

  function handleOpenChange(next: boolean) {
    setConfirming(next)
    if (!next) complete.reset()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 18px', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '15px', boxShadow: 'var(--app-shadow-card)', opacity: dimmed ? 0.6 : 1 }}>
      <CompleteButton
        done={done}
        isPending={complete.isPending}
        onClick={() => (done ? complete.mutate(task) : setConfirming(true))}
      />

      <ConfirmDialog
        open={confirming}
        onOpenChange={handleOpenChange}
        title="Mark task as complete?"
        description={<>&quot;{task.title}&quot; will be marked complete{task.isRecurring ? ' and its next occurrence will be scheduled' : ''}.</>}
        confirmLabel="Yes, complete"
        pendingLabel="Completing…"
        isPending={complete.isPending}
        errorMessage={complete.isError ? complete.error.message : undefined}
        icon={
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.3 2.3 4.4-4.7" /></svg>
        }
        iconColor="var(--app-chip-green-text)"
        iconBackground="var(--app-chip-green-bg)"
        confirmButtonStyle={{ background: 'var(--app-green-fill)', boxShadow: 'var(--app-green-shadow)' }}
        onConfirm={() => complete.mutate(task, { onSuccess: () => handleOpenChange(false) })}
      />

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '5px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--app-text)', textDecoration: done ? 'line-through' : 'none' }}>{task.title}</span>
          {task.isRecurring ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#7c3aed', background: 'rgba(139,92,246,0.13)', borderRadius: '99px', padding: '2px 8px' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
              {task.recurrenceLabel}
            </span>
          ) : null}
          {dimmed ? (
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--app-text-faint)', background: 'var(--app-chip-gray-bg)', borderRadius: '99px', padding: '2px 8px' }}>Inactive</span>
          ) : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '13px', fontSize: '12.5px', color: 'var(--app-text-soft)', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><path d="M14.7 6.3a3.7 3.7 0 0 0-4.9 4.6L4 16.7 7.3 20l5.8-5.8a3.7 3.7 0 0 0 4.6-4.9l-2.4 2.4-2-2 2.4-2.4Z" /></svg>
            {equipmentLabel}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
            {task.assigneeName}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: priority.text, background: priority.bg, borderRadius: '99px', padding: '2px 9px' }}>{priority.label}</span>
        </div>
      </div>

      <span style={{ flex: 'none', fontSize: '12.5px', fontWeight: 700, color: due.text, background: due.bg, borderRadius: '99px', padding: '6px 13px', whiteSpace: 'nowrap' }}>{task.dueLabel}</span>

      <MaintenanceRowActions task={task} />
    </div>
  )
}
