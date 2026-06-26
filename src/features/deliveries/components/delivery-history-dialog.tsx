'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, History } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { pesoFormatter } from '../deliveries.constants'
import type { Delivery } from '../deliveries.types'
import { useDeliveryHistory } from '../hooks/use-delivery-history'
import { DeliveryStatusMenu } from './delivery-status-menu'

interface DeliveryHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeliveryHistoryDialog({
  open,
  onOpenChange,
}: DeliveryHistoryDialogProps) {
  const [page, setPage] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const query = useDeliveryHistory(page, open)

  const deliveries = query.data?.deliveries ?? []
  const hasNext = query.data?.hasNext ?? false

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPage(0)
      setMessage(null)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-[#dcecff] bg-white shadow-[0_24px_70px_rgba(0,48,73,0.16)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-2xl font-semibold text-[#001d34]">
            <History className="size-6 text-[#00b4d8]" aria-hidden="true" />
            Delivery history
          </DialogTitle>
          <DialogDescription className="text-[#2a4b6a]">
            Completed and failed runs. Revert a run to send it back to the queue.
          </DialogDescription>
        </DialogHeader>

        {message ? (
          <p
            role="status"
            className="rounded-xl border border-[#bdefff] bg-[#eef7ff] px-3 py-2 text-sm font-semibold text-[#00677d]"
          >
            {message}
          </p>
        ) : null}

        {query.isPending ? (
          <HistorySkeleton />
        ) : query.isError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {query.error.message}
          </p>
        ) : deliveries.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#2a4b6a]">
            No completed or failed deliveries yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {deliveries.map((delivery) => (
              <HistoryRow
                key={delivery.id}
                delivery={delivery}
                onReverted={(text) => setMessage(text)}
                onError={(text) => setMessage(text)}
              />
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-[#dcecff] pt-3">
          <p className="text-sm text-[#2a4b6a]">
            Page {page + 1}
            {query.isFetching ? ' · updating…' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0 || query.isFetching}
              className="h-9 rounded-xl border-[#bdefff] text-[#00677d] hover:bg-[#eef7ff]"
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((current) => current + 1)}
              disabled={!hasNext || query.isFetching}
              className="h-9 rounded-xl border-[#bdefff] text-[#00677d] hover:bg-[#eef7ff]"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function HistoryRow({
  delivery,
  onReverted,
  onError,
}: {
  delivery: Delivery
  onReverted: (message: string) => void
  onError: (message: string) => void
}) {
  const isFailed = delivery.status === 'failed'

  return (
    <li className="flex items-start justify-between gap-3 rounded-2xl border border-[#dcecff] bg-white p-3">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <HistoryStatusBadge status={delivery.status} />
          <span className="text-sm font-semibold text-[#001d34]">
            {formatDate(delivery.deliveryDate)}
          </span>
          <span className="text-sm text-[#2a4b6a]">
            {pesoFormatter.format(delivery.total)}
          </span>
        </div>
        <p className="truncate text-sm text-[#2a4b6a]">
          {delivery.items.map((item) => item.productName).join(', ') ||
            'No items'}
        </p>
        {isFailed && delivery.failureRemarks ? (
          <p className="text-sm text-red-600">Reason: {delivery.failureRemarks}</p>
        ) : null}
      </div>
      <DeliveryStatusMenu
        delivery={delivery}
        onChanged={onReverted}
        onError={onError}
      />
    </li>
  )
}

function HistoryStatusBadge({ status }: { status: Delivery['status'] }) {
  const isFailed = status === 'failed'
  return (
    <span
      className={
        isFailed
          ? 'inline-flex items-center rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold capitalize text-red-700'
          : 'inline-flex items-center rounded-lg bg-[#00f5d4]/15 px-2.5 py-1 text-xs font-bold capitalize text-[#005144]'
      }
    >
      {status.replace('_', ' ')}
    </span>
  )
}

function HistorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-2xl bg-[#eef7ff]/70"
        />
      ))}
    </div>
  )
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}
