'use client'

import { useCustomers } from '../hooks/use-customers'
import { CustomersTable } from './customers-table'

export function CustomersPage() {
  const { data: customers, isPending, isError, error } = useCustomers()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-muted-foreground text-sm">
          Active customers for your station.
        </p>
      </header>

      {isPending ? (
        <p className="text-muted-foreground text-sm">Loading customers…</p>
      ) : isError ? (
        <p className="text-destructive text-sm" role="alert">
          {error.message}
        </p>
      ) : customers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">No customers yet</p>
          <p className="text-muted-foreground text-sm">
            Customers you add will appear here.
          </p>
        </div>
      ) : (
        <CustomersTable customers={customers} />
      )}
    </div>
  )
}
