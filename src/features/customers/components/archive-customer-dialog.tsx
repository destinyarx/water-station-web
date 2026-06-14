'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useArchiveCustomer } from '../hooks/use-archive-customer'
import type { Customer } from '../customers.types'

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
    if (!next) {
      mutation.reset()
    }
  }

  function handleConfirm() {
    mutation.mutate(customer.id, {
      onSuccess: () => handleOpenChange(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-[#dcecff] bg-white shadow-[0_24px_70px_rgba(0,48,73,0.16)]">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-semibold text-[#001d34]">
            Archive customer
          </DialogTitle>
          <DialogDescription className="text-[#2a4b6a]">
            Archive <span className="font-medium">{customer.name}</span>? They
            will be hidden from the active list but kept for your records.
          </DialogDescription>
        </DialogHeader>

        {mutation.isError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {mutation.error.message}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => handleOpenChange(false)}
            className="rounded-xl border-[#bdefff] text-[#00677d] hover:bg-[#eef7ff]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={handleConfirm}
            className="rounded-xl"
          >
            {mutation.isPending ? 'Archiving...' : 'Archive customer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
