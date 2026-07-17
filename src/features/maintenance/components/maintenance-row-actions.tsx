'use client'

import { useEffect, useRef, useState } from 'react'

import { canArchiveSchedule } from '../maintenance.guards'
import type { MaintenanceTaskView } from '../maintenance.types'
import { useIsOwner } from '../hooks/use-maintenance-owner'
import { useSetScheduleStatus } from '../hooks/use-set-schedule-status'
import { useCancelTask } from '../hooks/use-cancel-task'
import { EditScheduleDialog } from './edit-schedule-dialog'
import { DeleteScheduleDialog } from './delete-schedule-dialog'
import { ConfirmDialog } from '@/components/app/confirm-dialog'

/** Per-card kebab menu: edit, toggle schedule active/inactive, delete (owner). */
export function MaintenanceRowActions({ task }: { task: MaintenanceTaskView }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmingInactive, setConfirmingInactive] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const statusMutation = useSetScheduleStatus()
  const cancelMutation = useCancelTask()
  const canDelete = canArchiveSchedule(useIsOwner())

  useEffect(() => {
    if (!menuOpen) return
    function close(event: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        btnRef.current && !btnRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  function toggleStatus() {
    setMenuOpen(false)
    // Deactivating a schedule stops it from generating tasks — confirm first.
    // Reactivating is benign, so it stays a one-click action.
    if (task.isScheduleActive) {
      setConfirmingInactive(true)
      return
    }
    statusMutation.mutate({ scheduleId: task.scheduleId, isActive: true })
  }

  function confirmInactive() {
    statusMutation.mutate(
      { scheduleId: task.scheduleId, isActive: false },
      { onSuccess: () => setConfirmingInactive(false) },
    )
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-label="Task actions"
        onClick={() => setMenuOpen((open) => !open)}
        className={menuOpen
          ? 'flex h-[34px] w-[34px] flex-none cursor-pointer items-center justify-center rounded-[9px] border border-[var(--app-brand-soft)] bg-[var(--app-chip-bg)] text-[var(--app-brand)]'
          : 'flex h-[34px] w-[34px] flex-none cursor-pointer items-center justify-center rounded-[9px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] text-[var(--app-text-soft)]'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></svg>
      </button>

      {menuOpen ? (
        <div ref={menuRef} className="absolute right-0 top-10 z-[61] w-52 animate-[popIn_.14s_ease] rounded-[13px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-1.5 shadow-[0_18px_44px_rgba(7,40,70,0.22)]">
          <MenuBtn
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="text-[var(--app-brand)]"><path d="M14.5 5.5l4 4M4 20l1-4.2L16 4.8a1.6 1.6 0 0 1 2.2 0l1 1a1.6 1.6 0 0 1 0 2.2L8.2 19 4 20Z" /></svg>}
            label="Edit task"
            onClick={() => { setMenuOpen(false); setEditing(true) }}
          />
          <MenuBtn
            icon={
              task.isScheduleActive ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-[var(--app-text-soft)]"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5v5M14.5 9.5v5" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--app-chip-green-text)]"><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.3 2.3 4.4-4.7" /></svg>
              )
            }
            label={task.isScheduleActive ? 'Set schedule inactive' : 'Set schedule active'}
            disabled={statusMutation.isPending}
            onClick={toggleStatus}
          />
          {task.status === 'pending' ? (
            <MenuBtn
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></svg>}
              label="Cancel occurrence"
              disabled={cancelMutation.isPending}
              onClick={() => { setMenuOpen(false); setConfirmingCancel(true) }}
              danger
            />
          ) : null}
          {canDelete ? (
            <>
              <div className="mx-1 my-[5px] h-px bg-[var(--app-border)]" />
              <MenuBtn
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>}
                label="Delete task"
                onClick={() => { setMenuOpen(false); setDeleting(true) }}
                danger
              />
            </>
          ) : null}
        </div>
      ) : null}

      <EditScheduleDialog task={task} open={editing} onOpenChange={setEditing} />
      <DeleteScheduleDialog task={task} open={deleting} onOpenChange={setDeleting} />
      <ConfirmDialog
        open={confirmingCancel}
        onOpenChange={(next) => {
          if (!next) {
            setConfirmingCancel(false)
            cancelMutation.reset()
          }
        }}
        variant="destructive"
        title="Cancel this occurrence?"
        description={
          <>
            <strong className="text-[var(--app-text)]">{task.title}</strong> will move to Maintenance history.
            {task.isRecurring ? ' Its recurring schedule will continue with the next occurrence.' : ''}
          </>
        }
        confirmLabel="Cancel occurrence"
        pendingLabel="Cancelling..."
        onConfirm={() => cancelMutation.mutate(task, { onSuccess: () => setConfirmingCancel(false) })}
        isPending={cancelMutation.isPending}
        errorMessage={cancelMutation.isError ? cancelMutation.error.message : undefined}
      />
      <ConfirmDialog
        open={confirmingInactive}
        onOpenChange={(next) => {
          if (!next) {
            setConfirmingInactive(false)
            statusMutation.reset()
          }
        }}
        title="Set schedule inactive"
        description={
          <>
            Mark <strong className="text-[var(--app-text)]">{task.title}</strong> as inactive?
            It will stop generating upcoming maintenance tasks until reactivated.
          </>
        }
        confirmLabel="Set inactive"
        pendingLabel="Updating..."
        onConfirm={confirmInactive}
        isPending={statusMutation.isPending}
        errorMessage={statusMutation.isError ? statusMutation.error.message : undefined}
      />
    </div>
  )
}

function MenuBtn({ icon, label, onClick, danger, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={danger
        ? 'flex w-full items-center gap-[11px] rounded-[9px] border-0 bg-transparent px-[11px] py-2.5 text-left text-[13.5px] font-medium text-red-600 hover:bg-red-600/9 disabled:cursor-not-allowed disabled:opacity-50'
        : 'flex w-full items-center gap-[11px] rounded-[9px] border-0 bg-transparent px-[11px] py-2.5 text-left text-[13.5px] font-medium text-[var(--app-text)] hover:bg-[var(--app-surface-2)] disabled:cursor-not-allowed disabled:opacity-50'}
    >
      {icon}
      {label}
    </button>
  )
}
