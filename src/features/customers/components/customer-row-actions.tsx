'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { canEditCustomer } from '../customers.guards'
import type { Customer } from '../customers.types'
import { useSetCustomerStatus } from '../hooks/use-set-customer-status'
import { EditCustomerDialog } from './edit-customer-dialog'
import { ArchiveCustomerDialog } from './archive-customer-dialog'
import { ConfirmDialog } from '@/components/app/confirm-dialog'

/** Per-row kebab menu for a customer: edit, toggle active/inactive, archive. */
export function CustomerRowActions({ customer }: { customer: Customer }) {
  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [confirmingInactive, setConfirmingInactive] = useState(false)
  const statusMutation = useSetCustomerStatus()

  const canEdit = canEditCustomer(customer)

  function toggleStatus() {
    // Deactivating hides the customer from active operations — confirm first.
    // Reactivating is benign, so it stays a one-click action.
    if (customer.isActive) {
      setConfirmingInactive(true)
      return
    }
    statusMutation.mutate({ id: customer.id, isActive: true })
  }

  function confirmInactive() {
    statusMutation.mutate(
      { id: customer.id, isActive: false },
      { onSuccess: () => setConfirmingInactive(false) },
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Customer actions"
            title="Actions"
            className="h-[34px] w-[34px] rounded-[9px] text-[var(--app-text-soft)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[206px]">
          <DropdownMenuItem disabled={!canEdit} onClick={() => setEditing(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="mr-2 text-[var(--app-brand)]"><path d="M14.5 5.5l4 4M4 20l1-4.2L16 4.8a1.6 1.6 0 0 1 2.2 0l1 1a1.6 1.6 0 0 1 0 2.2L8.2 19 4 20Z" /></svg>
            Edit details
          </DropdownMenuItem>
          <DropdownMenuItem disabled={statusMutation.isPending} onClick={toggleStatus}>
            {customer.isActive ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="mr-2 text-[var(--app-text-soft)]"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5v5M14.5 9.5v5" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-[var(--app-chip-green-text)]"><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.3 2.3 4.4-4.7" /></svg>
            )}
            {customer.isActive ? 'Set as inactive' : 'Set as active'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setArchiving(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="mr-2"><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" /><path d="M10 12h4" /></svg>
            Archive customer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCustomerDialog customer={customer} open={editing} onOpenChange={setEditing} />
      <ArchiveCustomerDialog customer={customer} open={archiving} onOpenChange={setArchiving} />
      <ConfirmDialog
        open={confirmingInactive}
        onOpenChange={(next) => {
          if (!next) {
            setConfirmingInactive(false)
            statusMutation.reset()
          }
        }}
        title="Set customer as inactive"
        description={
          <>
            Mark <strong style={{ color: 'var(--app-text)' }}>{customer.name}</strong> as inactive?
            They will be hidden from active operations but kept for your records.
          </>
        }
        confirmLabel="Set inactive"
        pendingLabel="Updating..."
        onConfirm={confirmInactive}
        isPending={statusMutation.isPending}
        errorMessage={statusMutation.isError ? statusMutation.error.message : undefined}
      />
    </>
  )
}
