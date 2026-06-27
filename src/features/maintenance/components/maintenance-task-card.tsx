'use client'

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

/** One occurrence row: complete toggle, title + meta, due pill, kebab menu. */
export function MaintenanceTaskCard({ task }: { task: MaintenanceTaskView }) {
  const complete = useCompleteTask()
  const done = task.displayStatus === 'completed'
  const dimmed = !task.isScheduleActive
  const priority = PRIORITY_STYLE[task.priority]
  const due = DUE_STYLE[task.displayStatus]
  const equipmentLabel = task.equipmentOther ?? task.equipment

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 18px', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '15px', boxShadow: 'var(--app-shadow-card)', opacity: dimmed ? 0.6 : 1 }}>
      <button
        type="button"
        aria-label={done ? 'Reopen task' : 'Complete task'}
        disabled={complete.isPending}
        onClick={() => complete.mutate(task)}
        title={complete.isError ? complete.error.message : undefined}
        style={{ flex: 'none', width: '26px', height: '26px', borderRadius: '50%', border: `2px solid ${done ? 'var(--app-chip-green-text)' : 'var(--app-border-strong)'}`, background: done ? 'var(--app-chip-green-text)' : 'transparent', color: '#fff', cursor: complete.isPending ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {done ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
        ) : null}
      </button>

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
