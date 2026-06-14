import { Building2, Home, MapPin, Phone, Waves } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Customer } from '../customers.types'
import { CustomerRowActions } from './customer-row-actions'

interface CustomersTableProps {
  customers: Customer[]
}

export function CustomersTable({ customers }: CustomersTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#dcecff] bg-white/95 shadow-[0_16px_44px_rgba(0,48,73,0.06)]">
      <div className="border-b border-[#dcecff] bg-[#eef7ff]/70 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-[#00b4d8] shadow-sm">
            <Waves className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold text-[#001d34]">
              Customer directory
            </h2>
            <p className="text-sm text-[#2a4b6a]">
              Contact and delivery details for active refill accounts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {customers.map((customer) => (
          <CustomerMobileCard key={customer.id} customer={customer} />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-[#dcecff] bg-white hover:bg-white">
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Customer
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Type
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Contact
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Delivery address
              </TableHead>
              <TableHead className="px-5 py-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow
                key={customer.id}
                className="border-[#e5f1ff] transition-colors hover:bg-[#eef7ff]/70"
              >
                <TableCell className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <CustomerIcon isBusiness={customer.isBusiness} />
                    <div>
                      <p className="font-semibold text-[#001d34]">
                        {customer.name}
                      </p>
                      <p className="text-xs text-[#2a4b6a]">
                        Customer #{customer.id}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <CustomerTypeBadge isBusiness={customer.isBusiness} />
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-[#2a4b6a]">
                  <CustomerInfoLine
                    icon={Phone}
                    fallback="No phone saved"
                    value={customer.contactNumber}
                  />
                </TableCell>
                <TableCell className="max-w-sm px-5 py-4 text-sm text-[#2a4b6a]">
                  <CustomerInfoLine
                    icon={MapPin}
                    fallback="No delivery address saved"
                    value={customer.fullAddress}
                  />
                </TableCell>
                <TableCell className="px-5 py-4 text-right">
                  <CustomerRowActions customer={customer} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function CustomerMobileCard({ customer }: { customer: Customer }) {
  return (
    <article className="rounded-2xl border border-[#dcecff] bg-white p-4 shadow-[0_10px_24px_rgba(0,48,73,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CustomerIcon isBusiness={customer.isBusiness} />
          <div className="min-w-0">
            <h3 className="truncate font-heading text-base font-semibold text-[#001d34]">
              {customer.name}
            </h3>
            <p className="text-xs text-[#2a4b6a]">Customer #{customer.id}</p>
          </div>
        </div>
        <CustomerTypeBadge isBusiness={customer.isBusiness} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-[#2a4b6a]">
        <CustomerInfoLine
          icon={Phone}
          fallback="No phone saved"
          value={customer.contactNumber}
        />
        <CustomerInfoLine
          icon={MapPin}
          fallback="No delivery address saved"
          value={customer.fullAddress}
        />
      </div>

      <div className="mt-4 border-t border-[#e5f1ff] pt-3">
        <CustomerRowActions customer={customer} />
      </div>
    </article>
  )
}

function CustomerIcon({ isBusiness }: { isBusiness: boolean }) {
  const Icon = isBusiness ? Building2 : Home

  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8fbff] text-[#00b4d8]">
      <Icon className="size-5" aria-hidden="true" />
    </span>
  )
}

function CustomerTypeBadge({ isBusiness }: { isBusiness: boolean }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-[#00f5d4]/15 px-2.5 py-1 text-xs font-bold text-[#005144]">
      {isBusiness ? 'Business' : 'Household'}
    </span>
  )
}

type CustomerInfoLineProps = {
  icon: typeof Phone
  value: string | null
  fallback: string
}

function CustomerInfoLine({
  icon: Icon,
  value,
  fallback,
}: CustomerInfoLineProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="size-4 shrink-0 text-[#00b4d8]" aria-hidden="true" />
      <span className="truncate">{value ?? fallback}</span>
    </div>
  )
}
