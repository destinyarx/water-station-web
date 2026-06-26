'use client'

import { useState } from 'react'
import { CalendarClock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Customer } from '@/features/customers/customers.types'
import type { Product } from '@/features/products/products.types'
import type { DeliveryScheduleFormValues } from '../deliveries.types'
import { useCreateSchedule } from '../hooks/use-create-schedule'
import { ScheduleForm } from './schedule-form'

interface CreateScheduleDialogProps {
  customers: Customer[]
  products: Product[]
  disabled?: boolean
  onCreated?: () => void
}

export function CreateScheduleDialog({
  customers,
  products,
  disabled = false,
  onCreated,
}: CreateScheduleDialogProps) {
  const [open, setOpen] = useState(false)
  const mutation = useCreateSchedule()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      mutation.reset()
    }
  }

  function handleSubmit(values: DeliveryScheduleFormValues) {
    mutation.mutate(values, {
      onSuccess: () => {
        handleOpenChange(false)
        onCreated?.()
      },
    })
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="h-11 rounded-xl border-[#bdefff] px-4 font-semibold text-[#00677d] hover:bg-[#eef7ff]"
      >
        <CalendarClock className="size-4" />
        New Schedule
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border-[#dcecff] bg-white shadow-[0_24px_70px_rgba(0,48,73,0.16)] sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-semibold text-[#001d34]">
              New weekly schedule
            </DialogTitle>
            <DialogDescription className="text-[#2a4b6a]">
              Set up a standing order; deliveries are generated automatically on
              the chosen weekdays.
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm
            customers={customers}
            products={products}
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
            errorMessage={mutation.isError ? mutation.error.message : undefined}
            onCancel={() => handleOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
