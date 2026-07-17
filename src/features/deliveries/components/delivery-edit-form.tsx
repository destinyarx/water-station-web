'use client'

import { useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { Product } from '@/features/products/products.types'
import { pesoFormatter } from '../deliveries.constants'
import { deliveryEditFormSchema } from '../deliveries.schema'
import type {
  Delivery,
  DeliveryEditFormInput,
  DeliveryEditFormValues,
} from '../deliveries.types'

interface DeliveryEditFormProps {
  delivery: Delivery
  products: Product[]
  onSubmit: (values: DeliveryEditFormValues) => void
  isPending: boolean
  errorMessage?: string
  onCancel: () => void
}

const inputStyle: React.CSSProperties = {
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

const selectStyle: React.CSSProperties = {
  appearance: 'none',
  width: '100%',
  padding: '11px 38px 11px 13px',
  border: '1px solid var(--app-border-strong)',
  borderRadius: '11px',
  background: 'var(--app-surface)',
  color: 'var(--app-text)',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  cursor: 'pointer',
  boxSizing: 'border-box',
}

const sectionLabel: React.CSSProperties = {
  fontSize: '11.5px',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: '14px',
}

export function DeliveryEditForm({
  delivery,
  products,
  onSubmit,
  isPending,
  errorMessage,
  onCancel,
}: DeliveryEditFormProps) {
  const [selectedProductId, setSelectedProductId] = useState('')
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DeliveryEditFormInput, unknown, DeliveryEditFormValues>({
    resolver: zodResolver(deliveryEditFormSchema),
    defaultValues: {
      deliveryDate: delivery.deliveryDate,
      notes: delivery.notes ?? '',
      items: delivery.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        isStockTracked: item.isStockTracked,
      })),
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const items = useWatch({ control, name: 'items' }) ?? []
  const total = items.reduce(
    (sum, item) => sum + Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0),
    0,
  )
  const submit = handleSubmit((values) => onSubmit(values))

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
      isStockTracked: product.isStockTracked,
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
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} noValidate>
      <div style={{ background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: '14px', padding: '18px' }}>
        <div style={{ ...sectionLabel, color: 'var(--app-brand)' }}>Delivery date</div>
        <div style={{ maxWidth: '260px' }}>
          <input
            id="editDeliveryDate"
            type="date"
            disabled={isPending}
            style={inputStyle}
            {...register('deliveryDate')}
          />
          {errors.deliveryDate ? (
            <p style={{ fontSize: '12.5px', color: '#dc2626', marginTop: '6px' }}>{errors.deliveryDate.message}</p>
          ) : null}
        </div>
      </div>

      <div>
        <div style={{ ...sectionLabel, color: 'var(--app-text-faint)' }}>Products</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <select
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              disabled={isPending}
              style={selectStyle}
              aria-label="Product to add"
            >
              <option value="">Select product or refill service</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.productName} - {pesoFormatter.format(product.price)}
                </option>
              ))}
            </select>
            <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--app-text-soft)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
            </span>
          </div>
          <button
            type="button"
            onClick={addSelectedProduct}
            disabled={isPending || selectedProductId === ''}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 18px', borderRadius: '11px', border: 'none', background: selectedProductId === '' ? 'var(--app-text-faint)' : 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 600, cursor: selectedProductId === '' ? 'default' : 'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Add
          </button>
        </div>
        {errors.items ? (
          <p style={{ fontSize: '12.5px', color: '#dc2626', marginTop: '8px' }}>{errors.items.message}</p>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
          {fields.map((field, index) => (
            <div
              key={field.id}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: '11px', padding: '8px 10px 8px 12px' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--app-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                  {items[index]?.productName}
                </p>
                <input type="hidden" {...register(`items.${index}.productId`)} />
                <input type="hidden" {...register(`items.${index}.productName`)} />
                <input
                  type="hidden"
                  value={String(items[index]?.isStockTracked ?? false)}
                  {...register(`items.${index}.isStockTracked`, {
                    setValueAs: (value) => value === true || value === 'true',
                  })}
                />
              </div>

              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--app-surface)', border: '1px solid var(--app-border-strong)', borderRadius: '9px', padding: '3px' }}>
                <button
                  type="button"
                  disabled={isPending || Number(items[index]?.quantity ?? 1) <= 1}
                  onClick={() => changeQuantity(index, Number(items[index]?.quantity ?? 1) - 1)}
                  aria-label="Decrease quantity"
                  style={{ width: '26px', height: '26px', borderRadius: '7px', border: 'none', background: 'transparent', color: 'var(--app-text-muted)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  −
                </button>
                <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '13.5px', fontWeight: 700, color: 'var(--app-text)' }}>
                  {Number(items[index]?.quantity ?? 1)}
                  <input type="hidden" {...register(`items.${index}.quantity`, { setValueAs: (v) => optionalNumberInput(v) as number })} />
                </span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => changeQuantity(index, Number(items[index]?.quantity ?? 0) + 1)}
                  aria-label="Increase quantity"
                  style={{ width: '26px', height: '26px', borderRadius: '7px', border: 'none', background: 'transparent', color: 'var(--app-text-muted)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  +
                </button>
              </div>

              <div style={{ flexShrink: 0, fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', minWidth: '80px', textAlign: 'right' }}>
                {pesoFormatter.format(Number(items[index]?.unitPrice ?? 0))}
                <input type="hidden" {...register(`items.${index}.unitPrice`, { setValueAs: (v) => optionalNumberInput(v) as number })} />
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => remove(index)}
                aria-label="Remove item"
                style={{ flexShrink: 0, width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
              </button>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'right', fontSize: '14px', fontWeight: 700, color: 'var(--app-text)', marginTop: '12px' }}>
          Total {pesoFormatter.format(total)}
        </p>
      </div>

      <div style={{ background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: '14px', padding: '18px' }}>
        <div style={{ ...sectionLabel, color: 'var(--app-text-faint)' }}>Notes</div>
        <textarea
          disabled={isPending}
          placeholder="Optional delivery instructions"
          rows={2}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
          {...register('notes')}
        />
      </div>

      {errorMessage ? (
        <p role="alert" style={{ borderRadius: '11px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)', padding: '10px 13px', fontSize: '13.5px', color: '#dc2626', margin: 0 }}>
          {errorMessage}
        </p>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          type="button"
          disabled={isPending}
          onClick={onCancel}
          style={{ padding: '11px 20px', borderRadius: '11px', border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)', color: 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 24px', borderRadius: '11px', border: 'none', background: isPending ? 'var(--app-text-faint)' : 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: isPending ? 'default' : 'pointer', boxShadow: isPending ? 'none' : '0 10px 22px rgba(14,108,196,0.3)' }}
        >
          {isPending ? 'Saving...' : 'Save changes'}
        </button>
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
