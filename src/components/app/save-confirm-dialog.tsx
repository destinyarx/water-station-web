'use client'

import { ConfirmDialog } from './confirm-dialog'

interface SaveConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'update'
  /** Singular noun for the record, e.g. 'customer', 'product', 'expense'. */
  entityLabel: string
  isPending: boolean
  errorMessage?: string
  onConfirm: () => void
}

/**
 * Primary confirm dialog shown after a create/update form's Save, before the
 * record is written. Sits on top of the open form modal (higher z-index) so the
 * owner can cancel back to editing. Copy adapts to create vs update.
 */
export function SaveConfirmDialog({
  open,
  onOpenChange,
  mode,
  entityLabel,
  isPending,
  errorMessage,
  onConfirm,
}: SaveConfirmDialogProps) {
  const isCreate = mode === 'create'

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isCreate ? `Create this ${entityLabel}?` : 'Save changes?'}
      description={
        isCreate
          ? `This adds the ${entityLabel} to your station's records.`
          : `This updates the ${entityLabel}'s details.`
      }
      confirmLabel={isCreate ? 'Create' : 'Save changes'}
      pendingLabel={isCreate ? 'Creating...' : 'Saving...'}
      onConfirm={onConfirm}
      isPending={isPending}
      errorMessage={errorMessage}
      variant="primary"
    />
  )
}
