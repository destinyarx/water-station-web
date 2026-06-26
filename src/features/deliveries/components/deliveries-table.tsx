import { useMemo } from 'react'
import { CalendarDays, Droplets, Package } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Product } from '@/features/products/products.types'
import { pesoFormatter } from '../deliveries.constants'
import type { Delivery } from '../deliveries.types'
import { DeliveryStatusMenu } from './delivery-status-menu'

interface DeliveriesTableProps {
  deliveries: Delivery[]
  products?: Product[]
  onStatusChanged?: (message: string) => void
  onStatusError?: (message: string) => void
  onEdit?: (delivery: Delivery) => void
}

// Narrow columns hug their content so recipient/items get the remaining width.
const NARROW_COLUMN = 'w-px whitespace-nowrap'

export function DeliveriesTable({
  deliveries,
  products = [],
  onStatusChanged,
  onStatusError,
  onEdit,
}: DeliveriesTableProps) {
  const stockTrackedIds = useMemo(
    () =>
      new Set(
        products.filter((product) => product.isStockTracked).map((p) => p.id),
      ),
    [products],
  )

  return (
    <>
      <div className="grid gap-3 p-3 md:hidden">
        {deliveries.map((delivery) => (
          <DeliveryMobileCard
            key={delivery.id}
            delivery={delivery}
            stockTrackedIds={stockTrackedIds}
            onStatusChanged={onStatusChanged}
            onStatusError={onStatusError}
            onEdit={onEdit}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-[#dcecff] bg-white hover:bg-white">
              <TableHead
                className={cn(
                  NARROW_COLUMN,
                  'px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]',
                )}
              >
                Date
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Items
              </TableHead>
              <TableHead
                className={cn(
                  NARROW_COLUMN,
                  'px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]',
                )}
              >
                Status
              </TableHead>
              <TableHead
                className={cn(
                  NARROW_COLUMN,
                  'px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]',
                )}
              >
                Total
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Notes
              </TableHead>
              <TableHead
                className={cn(
                  NARROW_COLUMN,
                  'px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]',
                )}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow
                key={delivery.id}
                className="border-[#e5f1ff] transition-colors hover:bg-[#eef7ff]/70"
              >
                <TableCell
                  className={cn(
                    NARROW_COLUMN,
                    'px-5 py-4 text-sm font-semibold text-[#001d34]',
                  )}
                >
                  {formatDate(delivery.deliveryDate)}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <DeliveryItemsSummary
                    delivery={delivery}
                    stockTrackedIds={stockTrackedIds}
                  />
                </TableCell>
                <TableCell className={cn(NARROW_COLUMN, 'px-5 py-4')}>
                  <DeliveryStatusBadge status={delivery.status} />
                </TableCell>
                <TableCell
                  className={cn(
                    NARROW_COLUMN,
                    'px-5 py-4 text-right text-sm font-semibold text-[#001d34]',
                  )}
                >
                  {pesoFormatter.format(delivery.total)}
                </TableCell>
                <TableCell className="max-w-xs truncate px-5 py-4 text-sm text-[#2a4b6a]">
                  {delivery.notes ?? 'No notes'}
                </TableCell>
                <TableCell className={cn(NARROW_COLUMN, 'px-5 py-4 text-right')}>
                  <DeliveryStatusMenu
                    delivery={delivery}
                    onChanged={onStatusChanged}
                    onError={onStatusError}
                    onEdit={onEdit}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

function DeliveryMobileCard({
  delivery,
  stockTrackedIds,
  onStatusChanged,
  onStatusError,
  onEdit,
}: {
  delivery: Delivery
  stockTrackedIds: Set<number>
  onStatusChanged?: (message: string) => void
  onStatusError?: (message: string) => void
  onEdit?: (delivery: Delivery) => void
}) {
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
        <div className="flex items-center gap-1">
          <DeliveryStatusBadge status={delivery.status} />
          <DeliveryStatusMenu
            delivery={delivery}
            onChanged={onStatusChanged}
            onError={onStatusError}
            onEdit={onEdit}
          />
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm text-[#2a4b6a]">
        <DeliveryItemsSummary
          delivery={delivery}
          stockTrackedIds={stockTrackedIds}
        />
        <p className="font-semibold text-[#001d34]">
          {pesoFormatter.format(delivery.total)}
        </p>
        <p>{delivery.notes ?? 'No notes'}</p>
      </div>
    </article>
  )
}

function DeliveryItemsSummary({
  delivery,
  stockTrackedIds,
}: {
  delivery: Delivery
  stockTrackedIds: Set<number>
}) {
  return (
    <div className="space-y-1">
      {delivery.items.map((item) => {
        // Physical, stock-tracked goods vs services (refills, fees) read differently.
        const isStocked = stockTrackedIds.has(item.productId)
        const Icon = isStocked ? Package : Droplets

        return (
          <div key={item.id} className="flex min-w-0 items-center gap-2 text-sm">
            <Icon
              className={cn(
                'size-4 shrink-0',
                isStocked ? 'text-[#0077b6]' : 'text-[#00b4d8]',
              )}
              aria-label={isStocked ? 'Stocked product' : 'Service'}
            />
            <span className="truncate text-[#001d34]">{item.productName}</span>
            <span className="shrink-0 text-[#2a4b6a]">
              x{item.quantity} - {pesoFormatter.format(item.unitPrice)}
            </span>
          </div>
        )
      })}
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
