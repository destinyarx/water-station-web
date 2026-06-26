'use client'

import { useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Customer } from '@/features/customers/customers.types'
import type { Product } from '@/features/products/products.types'
import { pesoFormatter } from '../deliveries.constants'
import { deliveryScheduleFormSchema } from '../deliveries.schema'
import type {
  DeliveryScheduleFormInput,
  DeliveryScheduleFormValues,
} from '../deliveries.types'

const WEEKDAYS: { value: number; label: string }[] = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
]

interface ScheduleFormProps {
  customers: Customer[]
  products: Product[]
  onSubmit: (values: DeliveryScheduleFormValues) => void
  isPending: boolean
  errorMessage?: string
  onCancel: () => void
}

export function ScheduleForm({
  customers,
  products,
  onSubmit,
  isPending,
  errorMessage,
  onCancel,
}: ScheduleFormProps) {
  const [selectedProductId, setSelectedProductId] = useState('')
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DeliveryScheduleFormInput, unknown, DeliveryScheduleFormValues>({
    resolver: zodResolver(deliveryScheduleFormSchema),
    defaultValues: {
      targetType: 'guest',
      customerId: undefined,
      guestName: '',
      guestContact: '',
      guestAddress: '',
      weekdays: [],
      intervalWeeks: 1,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      items: [],
      notes: '',
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const targetType = useWatch({ control, name: 'targetType' })
  const weekdays = useWatch({ control, name: 'weekdays' }) ?? []
  const items = useWatch({ control, name: 'items' }) ?? []
  const total = items.reduce(
    (sum, item) => sum + Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0),
    0,
  )
  const submit = handleSubmit((values) => onSubmit(values))

  function toggleWeekday(day: number) {
    const next = weekdays.includes(day)
      ? weekdays.filter((value) => value !== day)
      : [...weekdays, day].sort((a, b) => a - b)

    setValue('weekdays', next, { shouldDirty: true, shouldValidate: true })
  }

  function addSelectedProduct() {
    const product = products.find(
      (candidate) => candidate.id === Number(selectedProductId),
    )
    if (!product) return

    append({
      productId: product.id,
      productName: product.productName,
      quantity: 1,
      unitPrice: product.price,
    })
    setSelectedProductId('')
  }

  function changeQuantity(index: number, nextQuantity: number) {
    setValue(`items.${index}.quantity`, Math.max(1, nextQuantity), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <section className="rounded-2xl border border-[#dcecff] bg-[#eef7ff]/50 p-4">
        <SectionHeading title="Customer" />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="targetType">Delivery target</FieldLabel>
            <select
              id="targetType"
              disabled={isPending}
              className="h-10 w-full rounded-xl border border-[#dcecff] bg-white px-3 text-sm text-[#001d34] outline-none focus:border-[#00b4d8] focus:ring-4 focus:ring-[#00b4d8]/20"
              {...register('targetType', {
                onChange: (event) => {
                  if (event.target.value === 'customer') {
                    setValue('guestName', '')
                    setValue('guestContact', '')
                    setValue('guestAddress', '')
                  } else {
                    setValue('customerId', undefined)
                  }
                },
              })}
            >
              <option value="guest">Guest / named delivery</option>
              <option value="customer">Existing customer</option>
            </select>
          </div>

          {targetType === 'customer' ? (
            <div className="space-y-2">
              <FieldLabel htmlFor="customerId">Customer</FieldLabel>
              <select
                id="customerId"
                disabled={isPending}
                className="h-10 w-full rounded-xl border border-[#dcecff] bg-white px-3 text-sm text-[#001d34] outline-none focus:border-[#00b4d8] focus:ring-4 focus:ring-[#00b4d8]/20"
                {...register('customerId', { setValueAs: optionalNumberInput })}
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              <FieldError message={errors.customerId?.message} />
            </div>
          ) : (
            <>
              <FormField
                id="guestName"
                label="Guest name"
                disabled={isPending}
                error={errors.guestName?.message}
                {...register('guestName')}
              />
              <FormField
                id="guestContact"
                label="Contact"
                disabled={isPending}
                error={errors.guestContact?.message}
                {...register('guestContact')}
              />
              <FormField
                id="guestAddress"
                label="Address"
                disabled={isPending}
                error={errors.guestAddress?.message}
                className="md:col-span-2"
                {...register('guestAddress')}
              />
            </>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[#dcecff] bg-white p-4">
        <SectionHeading title="Recurrence" />
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="weekdays">Delivery days</FieldLabel>
            <div id="weekdays" className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const active = weekdays.includes(day.value)
                return (
                  <button
                    key={day.value}
                    type="button"
                    disabled={isPending}
                    aria-pressed={active}
                    onClick={() => toggleWeekday(day.value)}
                    className={cn(
                      'h-10 w-12 rounded-xl border text-sm font-semibold transition',
                      active
                        ? 'border-[#00b4d8] bg-[#00b4d8] text-white'
                        : 'border-[#dcecff] bg-white text-[#00677d] hover:bg-[#eef7ff]',
                    )}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
            <FieldError message={errors.weekdays?.message} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <FieldLabel htmlFor="intervalWeeks">Repeat every (weeks)</FieldLabel>
              <Input
                id="intervalWeeks"
                type="number"
                min={1}
                max={12}
                disabled={isPending}
                className="rounded-xl border-[#dcecff] bg-[#eef7ff]/70 text-[#001d34] focus-visible:border-[#00b4d8] focus-visible:ring-[#00b4d8]/20"
                {...register('intervalWeeks', { setValueAs: optionalNumberInput })}
              />
              <FieldError message={errors.intervalWeeks?.message} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="startDate">Start date</FieldLabel>
              <Input
                id="startDate"
                type="date"
                disabled={isPending}
                className="rounded-xl border-[#dcecff] bg-[#eef7ff]/70 text-[#001d34] focus-visible:border-[#00b4d8] focus-visible:ring-[#00b4d8]/20"
                {...register('startDate')}
              />
              <FieldError message={errors.startDate?.message} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="endDate">End date (optional)</FieldLabel>
              <Input
                id="endDate"
                type="date"
                disabled={isPending}
                className="rounded-xl border-[#dcecff] bg-[#eef7ff]/70 text-[#001d34] focus-visible:border-[#00b4d8] focus-visible:ring-[#00b4d8]/20"
                {...register('endDate')}
              />
              <FieldError message={errors.endDate?.message} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#dcecff] bg-[#eef7ff]/50 p-4">
        <SectionHeading title="Products" />
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <select
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
            disabled={isPending}
            className="h-10 min-w-0 flex-1 rounded-xl border border-[#dcecff] bg-white px-3 text-sm text-[#001d34] outline-none focus:border-[#00b4d8] focus:ring-4 focus:ring-[#00b4d8]/20"
            aria-label="Product to add"
          >
            <option value="">Select product or refill service</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.productName} - {pesoFormatter.format(product.price)}
              </option>
            ))}
          </select>
          <Button
            type="button"
            onClick={addSelectedProduct}
            disabled={isPending || selectedProductId === ''}
            className="rounded-xl bg-[#00b4d8] text-white hover:bg-[#009ec2]"
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>
        <FieldError message={errors.items?.message} />

        <div className="mt-4 space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-2xl border border-[#dcecff] bg-white p-3 md:grid-cols-[minmax(0,1fr)_172px_148px_auto]"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#001d34]">
                  {items[index]?.productName}
                </p>
                <input type="hidden" {...register(`items.${index}.productId`)} />
                <input type="hidden" {...register(`items.${index}.productName`)} />
              </div>
              <div className="flex h-10 overflow-hidden rounded-xl border border-[#dcecff] bg-[#eef7ff]/70">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isPending || Number(items[index]?.quantity ?? 1) <= 1}
                  onClick={() =>
                    changeQuantity(index, Number(items[index]?.quantity ?? 1) - 1)
                  }
                  className="h-full w-10 rounded-none border-r border-[#dcecff] px-0 text-[#00677d] hover:bg-white/80"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  step="any"
                  inputMode="decimal"
                  aria-label="Quantity"
                  disabled={isPending}
                  className="h-full min-w-0 rounded-none border-0 bg-transparent px-2 text-center text-[#001d34] shadow-none focus-visible:ring-0"
                  {...register(`items.${index}.quantity`, {
                    setValueAs: optionalNumberInput,
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() =>
                    changeQuantity(index, Number(items[index]?.quantity ?? 0) + 1)
                  }
                  className="h-full w-10 rounded-none border-l border-[#dcecff] px-0 text-[#00677d] hover:bg-white/80"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <div className="flex h-10 items-center rounded-xl border border-[#dcecff] bg-[#eef7ff]/70 px-3 text-sm font-semibold tabular-nums text-[#001d34]">
                {pesoFormatter.format(Number(items[index]?.unitPrice ?? 0))}
                <input
                  type="hidden"
                  {...register(`items.${index}.unitPrice`, {
                    setValueAs: optionalNumberInput,
                  })}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                onClick={() => remove(index)}
                className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                aria-label="Remove item"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-4 text-right text-sm font-bold text-[#001d34]">
          Total {pesoFormatter.format(total)}
        </p>
      </section>

      <section className="rounded-2xl border border-[#dcecff] bg-white p-4">
        <SectionHeading title="Notes" />
        <Input
          disabled={isPending}
          placeholder="Optional standing-order instructions"
          className="mt-4 rounded-xl border-[#dcecff] bg-[#eef7ff]/70"
          {...register('notes')}
        />
      </section>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onCancel}
          className="rounded-xl border-[#bdefff] text-[#00677d] hover:bg-[#eef7ff]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#00b4d8] text-white shadow-[0_10px_24px_rgba(0,180,216,0.22)] hover:bg-[#009ec2]"
        >
          {isPending ? 'Creating...' : 'Create Schedule'}
        </Button>
      </div>
    </form>
  )
}

function optionalNumberInput(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed === '' ? undefined : Number(trimmed)
  }

  return value
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h3 className="font-heading text-lg font-semibold text-[#001d34]">{title}</h3>
  )
}

function FieldLabel({ children, htmlFor }: { children: string; htmlFor: string }) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-semibold text-[#001d34]">
      {children}
    </Label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-red-600">{message}</p>
}

function FormField({
  id,
  label,
  error,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  id: string
  label: string
  error?: string
}) {
  return (
    <div className={className ? `space-y-2 ${className}` : 'space-y-2'}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        className="rounded-xl border-[#dcecff] bg-white text-[#001d34] placeholder:text-[#6d797e] focus-visible:border-[#00b4d8] focus-visible:ring-[#00b4d8]/20"
        {...props}
      />
      <FieldError message={error} />
    </div>
  )
}
