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
import { FailDeliveryDialog } from './fail-delivery-dialog'

const STATUS_ACTION_LABEL: Record<DeliveryStatus, string> = {
  pending: 'Move back to pending',
  for_delivery: 'Mark for delivery',
  completed: 'Mark completed',
  failed: 'Mark failed',
}

interface DeliveryStatusMenuProps {
  delivery: Delivery
  onChanged?: (message: string) => void
  onError?: (message: string) => void
  onEdit?: (delivery: Delivery) => void
}

export function DeliveryStatusMenu({
  delivery,
  onChanged,
  onError,
  onEdit,
}: DeliveryStatusMenuProps) {
  const mutation = useUpdateDeliveryStatus()
  const [failOpen, setFailOpen] = useState(false)
  const nextStatuses = legalNextStatuses(delivery.status)

  function changeTo(to: DeliveryStatus, failureRemarks?: string) {
    mutation.mutate(
      { delivery, to, failureRemarks },
      {
        onSuccess: () => {
          setFailOpen(false)
          onChanged?.(`Delivery marked ${to.replace('_', ' ')}.`)
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
            className="size-9 rounded-xl text-[#2a4b6a] hover:bg-[#eef7ff]"
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
                } else {
                  changeTo(status)
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
        onConfirm={(remarks) => changeTo('failed', remarks)}
      />
    </>
  )
}
