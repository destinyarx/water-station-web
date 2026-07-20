'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { PRODUCT_FORM_DEFAULTS } from '../products.constants'
import { productFormSchema } from '../products.schema'
import type { ProductFormInput, ProductFormValues } from '../products.types'

interface ProductFormProps {
  defaultValues?: ProductFormValues
  onSubmit: (values: ProductFormValues) => void
  isPending: boolean
  errorMessage?: string
  submitLabel: string
  pendingLabel: string
  onCancel?: () => void
}

const INPUT_CLASS_NAME = 'w-full box-border rounded-[11px] border border-(--app-border-strong) bg-(--app-surface) px-3.25 py-2.75 text-sm text-(--app-text) outline-none disabled:cursor-not-allowed disabled:opacity-60'
const LABEL_CLASS_NAME = 'mb-1.5 block text-[13px] font-semibold text-(--app-text)'

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
    control,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues ?? PRODUCT_FORM_DEFAULTS,
  })

  const isStockTracked = useWatch({ control, name: 'isStockTracked' })
  const submit = handleSubmit((values) => onSubmit(values))
  const numberSetValueAs = (value: unknown): number | undefined => {
    if (typeof value === 'number') return Number.isNaN(value) ? undefined : value
    if (typeof value !== 'string') return undefined
    return value.trim() === '' ? undefined : Number(value)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <div className="rounded-[14px] border border-(--app-border) bg-(--app-surface-2) p-4.5">
        <div className="mb-3.5 text-[11px] font-bold tracking-[0.07em] text-(--app-brand) uppercase">Product info</div>
        <div className="mb-3.5">
          <label className={LABEL_CLASS_NAME}>Product name <span className="text-[#dc2626]">*</span></label>
          <input
            placeholder="e.g. 5-Gallon Refill or Bottled Water 1L"
            disabled={isPending}
            className={INPUT_CLASS_NAME}
            {...register('productName')}
          />
          {errors.productName?.message ? <FieldError message={errors.productName.message} /> : null}
        </div>
        <div>
          <label className={LABEL_CLASS_NAME}>Description</label>
          <textarea
            placeholder="Brief description shown on receipts and reports…"
            rows={3}
            disabled={isPending}
            className={`${INPUT_CLASS_NAME} resize-y leading-[1.5]`}
            {...register('description')}
          />
          {errors.description?.message ? <FieldError message={errors.description.message} /> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div>
          <label className={LABEL_CLASS_NAME}>Unit price (₱) <span className="text-[#dc2626]">*</span></label>
          <div className="relative">
            <span className="absolute top-1/2 left-3.25 -translate-y-1/2 text-[15px] font-bold text-(--app-text-soft)">₱</span>
            <input
              placeholder="0.00"
              inputMode="decimal"
              disabled={isPending}
              className={`${INPUT_CLASS_NAME} pl-6.5`}
              {...register('price', { setValueAs: numberSetValueAs })}
            />
          </div>
          {errors.price?.message ? <FieldError message={errors.price.message} /> : null}
        </div>
        <div className="flex items-end">
          <div className="w-full rounded-[11px] border border-(--app-border) bg-(--app-surface-2) px-3.5 py-3">
            <label className="flex cursor-pointer items-start gap-2.75">
              <input
                type="checkbox"
                checked={!isStockTracked}
                disabled={isPending}
                onChange={(event) => setValue('isStockTracked', !event.target.checked, { shouldValidate: true })}
                className="mt-0.5 size-4.5 flex-none cursor-pointer accent-[#0a6cc4] disabled:cursor-not-allowed"
              />
              <div>
                <div className="text-[13.5px] leading-none font-semibold text-(--app-text)">Refillable service</div>
                <div className="mt-0.75 text-[10px] leading-none text-(--app-text-soft)">No stock count needed — unlimited refill.</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {isStockTracked ? (
        <div>
          <label className={LABEL_CLASS_NAME}>Current stock (units) <span className="text-[#dc2626]">*</span></label>
          <input
            placeholder="0"
            inputMode="numeric"
            disabled={isPending}
            className={INPUT_CLASS_NAME}
            {...register('stock', { setValueAs: numberSetValueAs })}
          />
          {errors.stock?.message ? <FieldError message={errors.stock.message} /> : null}
        </div>
      ) : null}

      {errorMessage ? (
        <p role="alert" className="rounded-[11px] border border-[rgba(220,38,38,0.3)] bg-[rgba(220,38,38,0.06)] px-3.25 py-2.5 text-[13.5px] text-[#dc2626]">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex justify-end gap-3 pt-0.5">
        {onCancel ? (
          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="cursor-pointer rounded-[11px] border border-(--app-border-strong) bg-(--app-surface) px-5 py-2.75 text-sm font-semibold text-(--app-text-muted) disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex cursor-pointer items-center gap-2 rounded-[11px] bg-[linear-gradient(150deg,#3fb0f0,#0a6cc4)] px-6 py-2.75 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(14,108,196,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}

function FieldError({ message }: { message: string }) {
  return <div className="mt-1.5 text-[12.5px] text-[#dc2626]">{message}</div>
}
