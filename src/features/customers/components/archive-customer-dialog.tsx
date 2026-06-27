'use client'

import { useArchiveCustomer } from '../hooks/use-archive-customer'
import type { Customer } from '../customers.types'
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

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) mutation.reset()
  }

  function handleConfirm() {
    mutation.mutate(customer.id, { onSuccess: () => handleOpenChange(false) })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Archive customer"
      body={
        <>
          Archive <strong style={{ color: 'var(--app-text)' }}>{customer.name}</strong>? They will
          be hidden from the active list but kept for your records.
        </>
      }
      confirmLabel="Archive customer"
      pendingLabel="Archiving..."
      onConfirm={handleConfirm}
      isPending={mutation.isPending}
      errorMessage={mutation.isError ? mutation.error.message : undefined}
    />
  )
}
