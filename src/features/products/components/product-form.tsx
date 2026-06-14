'use client'

import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PRODUCT_FORM_DEFAULTS } from '../products.constants'
import { productFormSchema } from '../products.schema'
import type {
  ProductFormInput,
  ProductFormValues,
} from '../products.types'

interface ProductFormProps {
  defaultValues?: ProductFormValues
  onSubmit: (values: ProductFormValues) => void
  isPending: boolean
  errorMessage?: string
  submitLabel: string
  pendingLabel: string
  onCancel?: () => void
}

export function ProductForm({
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
  submitLabel,
  pendingLabel,
  onCancel,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues ?? PRODUCT_FORM_DEFAULTS,
  })

  const isStockTracked = watch('isStockTracked')
  const submit = handleSubmit((values) => onSubmit(values))
  const numberSetValueAs = (value: string): number | undefined =>
    value.trim() === '' ? undefined : Number(value)

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="rounded-2xl border border-[#dcecff] bg-[#eef7ff]/50 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <FieldLabel htmlFor="productName">Product name</FieldLabel>
            <StyledInput
              id="productName"
              placeholder="e.g. 5 Gallon Water Refill"
              disabled={isPending}
              aria-invalid={'productName' in errors}
              {...register('productName')}
            />
            <FieldError message={errors.productName?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="price">Price</FieldLabel>
            <StyledInput
              id="price"
              inputMode="decimal"
              placeholder="0.00"
              disabled={isPending}
              aria-invalid={'price' in errors}
              {...register('price', { setValueAs: numberSetValueAs })}
            />
            <FieldError message={errors.price?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="stock">Stock</FieldLabel>
            <StyledInput
              id="stock"
              inputMode="numeric"
              placeholder={isStockTracked ? '0' : 'Not tracked'}
              disabled={isPending || !isStockTracked}
              aria-invalid={'stock' in errors}
              {...register('stock', { setValueAs: numberSetValueAs })}
            />
            <FieldError message={errors.stock?.message} />
          </div>
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-2xl border border-[#dcecff] bg-white p-4 text-sm text-[#2a4b6a]">
        <input
          type="checkbox"
          disabled={isPending}
          className="mt-1 size-4 rounded border-[#00b4d8] text-[#00b4d8]"
          {...register('isStockTracked')}
        />
        <span>
          <span className="block font-semibold text-[#001d34]">
            Track stock for this product
          </span>
          Use this for bottled water, containers, caps, dispensers, and other
          physical inventory. Turn it off for refill services and fees.
        </span>
      </label>

      <div className="space-y-2">
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <StyledInput
          id="description"
          placeholder="Optional short description"
          disabled={isPending}
          aria-invalid={'description' in errors}
          {...register('description')}
        />
        <FieldError message={errors.description?.message} />
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onCancel}
            className="rounded-xl border-[#bdefff] text-[#00677d] hover:bg-[#eef7ff]"
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#00b4d8] text-white shadow-[0_10px_24px_rgba(0,180,216,0.22)] hover:bg-[#009ec2]"
        >
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: string
  htmlFor: string
}) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-semibold text-[#001d34]">
      {children}
    </Label>
  )
}

function StyledInput(props: ComponentProps<typeof Input>) {
  return (
    <Input
      className="rounded-xl border-[#dcecff] bg-[#eef7ff]/70 text-[#001d34] placeholder:text-[#6d797e] focus-visible:border-[#00b4d8] focus-visible:ring-[#00b4d8]/20"
      {...props}
    />
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-red-600">{message}</p>
}
