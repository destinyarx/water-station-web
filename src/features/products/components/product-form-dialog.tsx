'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#dcecff] bg-white shadow-[0_24px_70px_rgba(0,48,73,0.16)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-semibold text-[#001d34]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[#2a4b6a]">
            {description}
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isPending={isPending}
          errorMessage={errorMessage}
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
