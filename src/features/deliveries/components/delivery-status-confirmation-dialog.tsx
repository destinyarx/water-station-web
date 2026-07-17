'use client'

import { CheckCheck, Truck } from 'lucide-react'

import { ConfirmDialog } from '@/components/app/confirm-dialog'

import type { Delivery } from '../deliveries.types'

export type ConfirmableDeliveryStatus = 'for_delivery' | 'completed'

type DeliveryRecipient = {
  name: string
  source: 'record' | 'guest'
  address?: string | null
}

type DeliveryStatusConfirmationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  delivery: Delivery
  recipient: DeliveryRecipient
  status: ConfirmableDeliveryStatus
  isPending: boolean
  errorMessage?: string
  onConfirm: () => void
}

const statusContent: Record<
  ConfirmableDeliveryStatus,
  {
    title: string
    description: string
    confirmLabel: string
    pendingLabel: string
  }
> = {
  for_delivery: {
    title: 'Mark delivery in progress?',
    description:
      'Stock-tracked items will be deducted and this delivery will move into the active route queue.',
    confirmLabel: 'Start delivery',
    pendingLabel: 'Starting...',
  },
  completed: {
    title: 'Mark delivery completed?',
    description:
      'This records the completion time and includes delivered items in Dashboard delivery sales.',
    confirmLabel: 'Mark completed',
    pendingLabel: 'Completing...',
  },
}

export function DeliveryStatusConfirmationDialog({
  open,
  onOpenChange,
  delivery,
  recipient,
  status,
  isPending,
  errorMessage,
  onConfirm,
}: DeliveryStatusConfirmationDialogProps) {
  const content = statusContent[status]
  const isCompleting = status === 'completed'

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={content.title}
      description={content.description}
      confirmLabel={content.confirmLabel}
      pendingLabel={content.pendingLabel}
      cancelLabel="Keep current status"
      onConfirm={onConfirm}
      isPending={isPending}
      errorMessage={errorMessage}
      icon={
        isCompleting ? (
          <CheckCheck aria-hidden="true" />
        ) : (
          <Truck aria-hidden="true" />
        )
      }
      iconColor={
        isCompleting ? 'var(--app-chip-green-text)' : 'var(--app-brand)'
      }
      iconBackground={
        isCompleting ? 'var(--app-chip-green-bg)' : 'var(--app-chip-bg)'
      }
      confirmButtonStyle={
        isCompleting
          ? {
              background: 'var(--app-green-fill)',
              boxShadow: 'var(--app-green-shadow)',
            }
          : undefined
      }
      body={
        <div className="rounded-xl border border-(--app-border) bg-(--app-surface-2) p-3.5 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-(--app-chip-bg) px-2 py-1 text-[10px] font-bold tracking-[0.04em] text-(--app-brand) uppercase">
              {recipient.source === 'record' ? 'From records' : 'Guest'}
            </span>
            <p className="min-w-0 flex-1 truncate text-[13px] font-bold text-(--app-text)">
              {recipient.name}
            </p>
          </div>
          {recipient.address ? (
            <p className="mt-2 truncate text-[11px] text-(--app-text-soft)">
              {recipient.address}
            </p>
          ) : null}
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-(--app-border) pt-3 text-[11px] text-(--app-text-soft)">
            <span>{formatDeliveryDate(delivery.deliveryDate)}</span>
            <span className="text-right">
              {delivery.items.length}{' '}
              {delivery.items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      }
    />
  )
}

function formatDeliveryDate(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}
