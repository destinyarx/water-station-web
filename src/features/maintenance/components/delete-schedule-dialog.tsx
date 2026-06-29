'use client'

import { ConfirmDialog } from '@/components/app/confirm-dialog'

import type { MaintenanceTaskView } from '../maintenance.types'
import { useArchiveSchedule } from '../hooks/use-archive-schedule'

interface DeleteScheduleDialogProps {
  task: MaintenanceTaskView
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Deletes (soft) the whole schedule the task belongs to. Owner-only — the row
 * menu hides the action for staff, and RLS rejects it server-side.
 */
export function DeleteScheduleDialog({ task, open, onOpenChange }: DeleteScheduleDialogProps) {
  const mutation = useArchiveSchedule()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) mutation.reset()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      variant="destructive"
      title="Delete this task?"
      description={
        <>
          &quot;{task.title}&quot; and its schedule will be removed from your maintenance list.
        </>
      }
      confirmLabel="Yes, delete"
      pendingLabel="Deleting…"
      isPending={mutation.isPending}
      errorMessage={mutation.isError ? mutation.error.message : undefined}
      onConfirm={() =>
        mutation.mutate(task.scheduleId, { onSuccess: () => handleOpenChange(false) })
      }
    />
  )
}
