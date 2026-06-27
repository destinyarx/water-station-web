'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

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

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  border: '1px solid var(--app-border-strong)',
  borderRadius: '11px',
  background: 'var(--app-surface)',
  color: 'var(--app-text)',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--app-text)',
  marginBottom: '6px',
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
    setValue,
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
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
      {/* name + description */}
      <div style={{ background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: '14px', padding: '18px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--app-brand)', marginBottom: '14px' }}>Product info</div>
        <div style={{ marginBottom: '14px' }}>
          <label style={LABEL_STYLE}>Product name <span style={{ color: '#dc2626' }}>*</span></label>
          <input placeholder="e.g. 5-Gallon Refill or Bottled Water 1L" disabled={isPending} style={INPUT_STYLE} {...register('productName')} />
          {errors.productName?.message ? <FieldError message={errors.productName.message} /> : null}
        </div>
        <div>
          <label style={LABEL_STYLE}>Description</label>
          <textarea placeholder="Brief description shown on receipts and reports…" rows={3} disabled={isPending} style={{ ...INPUT_STYLE, resize: 'vertical', lineHeight: 1.5 }} {...register('description')} />
          {errors.description?.message ? <FieldError message={errors.description.message} /> : null}
        </div>
      </div>

      {/* price + refillable */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label style={LABEL_STYLE}>Unit price (₱) <span style={{ color: '#dc2626' }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', fontWeight: 700, color: 'var(--app-text-soft)' }}>₱</span>
            <input placeholder="0.00" inputMode="decimal" disabled={isPending} style={{ ...INPUT_STYLE, paddingLeft: '26px' }} {...register('price', { setValueAs: numberSetValueAs })} />
          </div>
          {errors.price?.message ? <FieldError message={errors.price.message} /> : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: '11px', padding: '12px 14px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!isStockTracked}
                disabled={isPending}
                onChange={(event) => setValue('isStockTracked', !event.target.checked, { shouldValidate: true })}
                style={{ marginTop: '2px', width: '18px', height: '18px', accentColor: '#0a6cc4', cursor: 'pointer', flex: 'none' }}
              />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--app-text)', lineHeight: 1.3 }}>Refillable service</div>
                <div style={{ fontSize: '12px', color: 'var(--app-text-soft)', marginTop: '3px', lineHeight: 1.4 }}>No stock count needed — unlimited refill.</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* stock qty (only when stock-tracked) */}
      {isStockTracked ? (
        <div>
          <label style={LABEL_STYLE}>Current stock (units) <span style={{ color: '#dc2626' }}>*</span></label>
          <input placeholder="0" inputMode="numeric" disabled={isPending} style={INPUT_STYLE} {...register('stock', { setValueAs: numberSetValueAs })} />
          {errors.stock?.message ? <FieldError message={errors.stock.message} /> : null}
        </div>
      ) : null}

      {errorMessage ? (
        <p role="alert" style={{ borderRadius: '11px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)', padding: '10px 13px', fontSize: '13.5px', color: '#dc2626', margin: 0 }}>
          {errorMessage}
        </p>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '2px' }}>
        {onCancel ? (
          <button type="button" disabled={isPending} onClick={onCancel} style={{ padding: '11px 20px', borderRadius: '11px', border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)', color: 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
        ) : null}
        <button type="submit" disabled={isPending} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 24px', borderRadius: '11px', border: 'none', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 10px 22px rgba(14,108,196,0.3)' }}>
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}

function FieldError({ message }: { message: string }) {
  return <div style={{ fontSize: '12.5px', color: '#dc2626', marginTop: '6px' }}>{message}</div>
}
