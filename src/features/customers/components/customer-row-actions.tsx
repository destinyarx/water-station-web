'use client'

import { useState } from 'react'
import { Archive, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { canEditCustomer } from '../customers.guards'
import type { Customer } from '../customers.types'
import { EditCustomerDialog } from './edit-customer-dialog'
import { ArchiveCustomerDialog } from './archive-customer-dialog'

/** Per-row actions for a customer: edit and archive. */
export function CustomerRowActions({ customer }: { customer: Customer }) {
  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={!canEditCustomer(customer)}
        onClick={() => setEditing(true)}
        className="rounded-lg border-[#bdefff] bg-white text-[#00677d] hover:bg-[#eef7ff] hover:text-[#00414f]"
      >
        <Pencil className="size-3.5" />
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => setArchiving(true)}
      >
        <Archive className="size-3.5" />
        Archive
      </Button>
      <EditCustomerDialog
        customer={customer}
        open={editing}
        onOpenChange={setEditing}
      />
      <ArchiveCustomerDialog
        customer={customer}
        open={archiving}
        onOpenChange={setArchiving}
      />
    </div>
  )
}
