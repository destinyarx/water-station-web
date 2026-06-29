'use client'

import { useArchiveCustomer } from '../hooks/use-archive-customer'
import type { Customer } from '../customers.types'
import { useMutationDialog } from '../hooks/use-mutation-dialog'
import { ConfirmDialog } from '@/components/app/confirm-dialog'

interface ArchiveCustomerDialogProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Confirmation modal for archiving (soft-deleting) a customer. */
export function ArchiveCustomerDialog({
  customer,
  open,
  onOpenChange,
}: ArchiveCustomerDialogProps) {
  const mutation = useArchiveCustomer()
  const dialog = useMutationDialog(mutation, { open, onOpenChange })

  return (
    <ConfirmDialog
      open={dialog.open}
      onOpenChange={dialog.onOpenChange}
      variant="destructive"
      title="Archive customer"
      description={
        <>
          Archive <strong style={{ color: 'var(--app-text)' }}>{customer.name}</strong>? They will
          be hidden from the active list but kept for your records.
        </>
      }
      confirmLabel="Archive customer"
      pendingLabel="Archiving..."
      onConfirm={() => dialog.submit(customer.id)}
      isPending={dialog.isPending}
      errorMessage={dialog.errorMessage}
    />
  )
}
