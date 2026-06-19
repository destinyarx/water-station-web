import { CalendarDays, PackageCheck } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { pesoFormatter } from '../deliveries.constants'
import type { Delivery } from '../deliveries.types'

interface DeliveriesTableProps {
  deliveries: Delivery[]
}

export function DeliveriesTable({ deliveries }: DeliveriesTableProps) {
  return (
    <>
      <div className="grid gap-3 p-3 md:hidden">
        {deliveries.map((delivery) => (
          <DeliveryMobileCard key={delivery.id} delivery={delivery} />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-[#dcecff] bg-white hover:bg-white">
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Date
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Items
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Status
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Total
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Notes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow
                key={delivery.id}
                className="border-[#e5f1ff] transition-colors hover:bg-[#eef7ff]/70"
              >
                <TableCell className="px-5 py-4 text-sm font-semibold text-[#001d34]">
                  {formatDate(delivery.deliveryDate)}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <DeliveryItemsSummary delivery={delivery} />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <DeliveryStatusBadge status={delivery.status} />
                </TableCell>
                <TableCell className="px-5 py-4 text-sm font-semibold text-[#001d34]">
                  {pesoFormatter.format(delivery.total)}
                </TableCell>
                <TableCell className="max-w-xs truncate px-5 py-4 text-sm text-[#2a4b6a]">
                  {delivery.notes ?? 'No notes'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

function DeliveryMobileCard({ delivery }: { delivery: Delivery }) {
  return (
    <article className="rounded-2xl border border-[#dcecff] bg-white p-4 shadow-[0_10px_24px_rgba(0,48,73,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8fbff] text-[#00b4d8]">
            <CalendarDays className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-base font-semibold text-[#001d34]">
              {formatDate(delivery.deliveryDate)}
            </h3>
            <p className="truncate text-xs text-[#2a4b6a]">
              {delivery.items.length} item line
              {delivery.items.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <DeliveryStatusBadge status={delivery.status} />
      </div>
      <div className="mt-4 space-y-2 text-sm text-[#2a4b6a]">
        <DeliveryItemsSummary delivery={delivery} />
        <p className="font-semibold text-[#001d34]">
          {pesoFormatter.format(delivery.total)}
        </p>
        <p>{delivery.notes ?? 'No notes'}</p>
      </div>
    </article>
  )
}

function DeliveryItemsSummary({ delivery }: { delivery: Delivery }) {
  return (
    <div className="space-y-1">
      {delivery.items.map((item) => (
        <div key={item.id} className="flex min-w-0 items-center gap-2 text-sm">
          <PackageCheck
            className="size-4 shrink-0 text-[#00b4d8]"
            aria-hidden="true"
          />
          <span className="truncate text-[#001d34]">{item.productName}</span>
          <span className="shrink-0 text-[#2a4b6a]">
            x{item.quantity} - {pesoFormatter.format(item.unitPrice)}
          </span>
        </div>
      ))}
    </div>
  )
}

function DeliveryStatusBadge({ status }: { status: Delivery['status'] }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-[#00f5d4]/15 px-2.5 py-1 text-xs font-bold capitalize text-[#005144]">
      {status.replace('_', ' ')}
    </span>
  )
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}
