'use client'

import { AppModal } from '@/components/app/app-modal'
import type { ProductFormValues } from '../products.types'
import { ProductForm } from './product-form'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  defaultValues?: ProductFormValues
  onSubmit: (values: ProductFormValues) => void
  isPending: boolean
  errorMessage?: string
  submitLabel: string
  pendingLabel: string
}

/** Custom modal shell around `ProductForm`, matching the AquaFlow design. */
export function ProductFormDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
  submitLabel,
  pendingLabel,
}: ProductFormDialogProps) {
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="xl"
      bodyPadding="22px 24px"
      icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
          <path d="M12 3c3.5 4.5 5.5 7 5.5 9.8a5.5 5.5 0 1 1-11 0C6.5 10 8.5 7.5 12 3Z" />
        </svg>
      }
    >
      <ProductForm
        key={open ? 'open' : 'closed'}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        isPending={isPending}
        errorMessage={errorMessage}
        submitLabel={submitLabel}
        pendingLabel={pendingLabel}
        onCancel={() => onOpenChange(false)}
      />
    </AppModal>
  )
}
