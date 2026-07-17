'use client'

import { useState } from 'react'

import { ConfirmDialog } from '@/components/app/confirm-dialog'

import type { MaintenanceTaskView, TaskDisplayStatus } from '../maintenance.types'
import { useCompleteTask } from '../hooks/use-complete-task'
import { MaintenanceRowActions } from './maintenance-row-actions'

const PRIORITY_STYLE: Record<MaintenanceTaskView['priority'], { className: string; label: string }> = {
  high: { className: 'bg-[var(--app-chip-red-bg)] text-[var(--app-chip-red-text)]', label: 'High' },
  medium: { className: 'bg-[var(--app-chip-amber-bg)] text-[var(--app-chip-amber-text)]', label: 'Medium' },
  low: { className: 'bg-[var(--app-chip-bg)] text-[var(--app-brand)]', label: 'Low' },
}

const DUE_STYLE: Record<TaskDisplayStatus, string> = {
  overdue: 'bg-[var(--app-chip-red-bg)] text-[var(--app-chip-red-text)]',
  upcoming: 'bg-[var(--app-chip-bg)] text-[var(--app-brand)]',
  completed: 'bg-[var(--app-chip-green-bg)] text-[var(--app-chip-green-text)]',
}

const checkIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
)

function CompleteButton({ done, isPending, onClick }: { done: boolean; isPending: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={done ? 'Reopen task' : 'Complete task'}
      disabled={isPending}
      onClick={onClick}
      className={done
        ? 'inline-flex flex-none items-center gap-1.5 rounded-[10px] border border-[var(--app-green-deep)] bg-[var(--app-green-soft-bg)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--app-green-deep)] transition-colors hover:bg-[var(--app-chip-green-bg)] disabled:cursor-wait disabled:opacity-60'
        : 'inline-flex flex-none items-center gap-1.5 rounded-[10px] border border-transparent bg-[var(--app-green-fill)] px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-[var(--app-green-shadow)] transition-[filter,transform] hover:brightness-95 active:translate-y-px disabled:cursor-wait disabled:opacity-60'}
    >
      <span className="flex">
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
    <div className={`flex items-center gap-[15px] rounded-[15px] border border-[var(--app-border)] bg-[var(--app-surface)] px-[18px] py-4 shadow-[var(--app-shadow-card)] ${dimmed ? 'opacity-60' : ''}`}>
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
        onConfirm={() => complete.mutate(task, { onSuccess: () => handleOpenChange(false) })}
      />

      <div className="min-w-0 flex-1">
        <div className="mb-[5px] flex flex-wrap items-center gap-[9px]">
          <span className={`text-[14.5px] font-bold text-[var(--app-text)] ${done ? 'line-through' : ''}`}>{task.title}</span>
          {task.isRecurring ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/13 px-2 py-0.5 text-[11px] font-semibold text-violet-600 dark:text-violet-300">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
              {task.recurrenceLabel}
            </span>
          ) : null}
          {dimmed ? (
            <span className="rounded-full bg-[var(--app-chip-gray-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--app-text-faint)]">Inactive</span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-[13px] text-[12.5px] text-[var(--app-text-soft)]">
          <span className="inline-flex items-center gap-[5px]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><path d="M14.7 6.3a3.7 3.7 0 0 0-4.9 4.6L4 16.7 7.3 20l5.8-5.8a3.7 3.7 0 0 0 4.6-4.9l-2.4 2.4-2-2 2.4-2.4Z" /></svg>
            {equipmentLabel}
          </span>
          <span className="inline-flex items-center gap-[5px]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
            {task.assigneeName}
          </span>
          <span className={`rounded-full px-[9px] py-0.5 text-[11px] font-semibold ${priority.className}`}>{priority.label}</span>
        </div>
      </div>

      <span className={`flex-none whitespace-nowrap rounded-full px-[13px] py-1.5 text-[12.5px] font-bold ${due}`}>{task.dueLabel}</span>

      <MaintenanceRowActions task={task} />
    </div>
  )
}
