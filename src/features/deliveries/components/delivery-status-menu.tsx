'use client'

import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { legalNextStatuses } from '../deliveries.transitions'
import type { Delivery, DeliveryStatus } from '../deliveries.types'
import { useUpdateDeliveryStatus } from '../hooks/use-update-delivery-status'
import { CancelDeliveryDialog } from './cancel-delivery-dialog'
import {
  DeliveryStatusConfirmationDialog,
  type ConfirmableDeliveryStatus,
} from './delivery-status-confirmation-dialog'
import { FailDeliveryDialog } from './fail-delivery-dialog'

const STATUS_ACTION_LABEL: Record<DeliveryStatus, string> = {
  pending: 'Move back to pending',
  for_delivery: 'Mark for delivery',
  completed: 'Mark completed',
  failed: 'Mark failed',
  cancelled: 'Cancel delivery',
}

interface DeliveryStatusMenuProps {
  delivery: Delivery
  recipientName?: string
  recipientSource?: 'record' | 'guest'
  recipientAddress?: string | null
  onChanged?: (message: string) => void
  onError?: (message: string) => void
  onEdit?: (delivery: Delivery) => void
}

export function DeliveryStatusMenu({
  delivery,
  recipientName = 'Unknown recipient',
  recipientSource = 'guest',
  recipientAddress,
  onChanged,
  onError,
  onEdit,
}: DeliveryStatusMenuProps) {
  const mutation = useUpdateDeliveryStatus()
  const [failOpen, setFailOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [confirmStatus, setConfirmStatus] =
    useState<ConfirmableDeliveryStatus | null>(null)
  const nextStatuses = legalNextStatuses(delivery.status)

  function changeTo(
    to: DeliveryStatus,
    remarks?: { failureRemarks?: string; cancellationRemarks?: string },
  ) {
    mutation.mutate(
      { delivery, to, ...remarks },
      {
        onSuccess: () => {
          setFailOpen(false)
          setCancelOpen(false)
          setConfirmStatus(null)
          onChanged?.(successMessageFor(to))
        },
        onError: (error) => onError?.(error.message),
      },
    )
  }

  if (nextStatuses.length === 0) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={mutation.isPending}
            className="size-9 rounded-xl text-[var(--app-text-muted)] hover:bg-[var(--app-row-hover)]"
            aria-label="Change delivery status"
          >
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          {delivery.status === 'pending' && onEdit ? (
            <DropdownMenuItem onSelect={() => onEdit(delivery)}>
              Edit details
            </DropdownMenuItem>
          ) : null}
          {nextStatuses.map((status) => (
            <DropdownMenuItem
              key={status}
              onSelect={(event) => {
                event.preventDefault()
                if (status === 'failed') {
                  setFailOpen(true)
                } else if (status === 'cancelled') {
                  setCancelOpen(true)
                } else if (
                  status === 'for_delivery' ||
                  status === 'completed'
                ) {
                  setConfirmStatus(status)
                }
              }}
            >
              {STATUS_ACTION_LABEL[status]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <FailDeliveryDialog
        open={failOpen}
        onOpenChange={setFailOpen}
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        onConfirm={(remarks) => changeTo('failed', { failureRemarks: remarks })}
      />
      <CancelDeliveryDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        onConfirm={(remarks) =>
          changeTo('cancelled', { cancellationRemarks: remarks })
        }
      />
      {confirmStatus ? (
        <DeliveryStatusConfirmationDialog
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setConfirmStatus(null)
          }}
          delivery={delivery}
          recipient={{
            name: recipientName,
            source: recipientSource,
            address: recipientAddress,
          }}
          status={confirmStatus}
          isPending={mutation.isPending}
          errorMessage={mutation.isError ? mutation.error.message : undefined}
          onConfirm={() => changeTo(confirmStatus)}
        />
      ) : null}
    </>
  )
}

function successMessageFor(status: DeliveryStatus): string {
  switch (status) {
    case 'for_delivery':
      return 'Delivery is now in progress.'
    case 'completed':
      return 'Delivery completed successfully.'
    case 'failed':
      return 'Delivery marked as failed.'
    case 'cancelled':
      return 'Delivery cancelled.'
    case 'pending':
      return 'Delivery moved back to pending.'
  }
}
