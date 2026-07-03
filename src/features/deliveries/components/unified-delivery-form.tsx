'use client'

import { useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { UserRound } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'

import type { Customer } from '@/features/customers/customers.types'
import type { Product } from '@/features/products/products.types'
import {
  UNIFIED_DELIVERY_FORM_DEFAULTS,
  pesoFormatter,
} from '../deliveries.constants'
import { unifiedDeliveryFormSchema } from '../deliveries.schema'
import type {
  OrgUser,
  UnifiedDeliveryFormInput,
  UnifiedDeliveryFormValues,
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

interface UnifiedDeliveryFormProps {
  customers: Customer[]
  products: Product[]
  users: OrgUser[]
  usersLoading: boolean
  onSubmit: (values: UnifiedDeliveryFormValues) => void
  isPending: boolean
  errorMessage?: string
  onCancel: () => void
}

export function UnifiedDeliveryForm({
  customers,
  products,
  users,
  usersLoading,
  onSubmit,
  isPending,
  errorMessage,
  onCancel,
}: UnifiedDeliveryFormProps) {
  const [productSearch, setProductSearch] = useState('')
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UnifiedDeliveryFormInput, unknown, UnifiedDeliveryFormValues>({
    resolver: zodResolver(unifiedDeliveryFormSchema),
    defaultValues: UNIFIED_DELIVERY_FORM_DEFAULTS,
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const targetType = useWatch({ control, name: 'targetType' })
  const scheduleMode = useWatch({ control, name: 'scheduleMode' })
  const weekdays = useWatch({ control, name: 'weekdays' }) ?? []
  const intervalWeeks = useWatch({ control, name: 'intervalWeeks' })
  const customDates = useWatch({ control, name: 'customDates' }) ?? []
  const items = useWatch({ control, name: 'items' }) ?? []

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    const addedIds = new Set(items.map((it) => it.productId))
    return products
      .filter((p) => !addedIds.has(p.id))
      .filter((p) => !q || p.productName.toLowerCase().includes(q))
  }, [productSearch, products, items])

  const submit = handleSubmit((values) => onSubmit(values))

  function setTargetType(value: 'customer' | 'guest') {
    setValue('targetType', value, { shouldDirty: true, shouldValidate: true })
    if (value === 'customer') {
      setValue('guestName', '')
      setValue('guestContact', '')
      setValue('guestAddress', '')
    } else {
      setValue('customerId', undefined)
    }
  }

  function setMode(value: 'recurring_route' | 'custom_dates') {
    setValue('scheduleMode', value, { shouldDirty: true, shouldValidate: true })
  }

  function toggleWeekday(day: number) {
    const next = weekdays.includes(day)
      ? weekdays.filter((v) => v !== day)
      : [...weekdays, day].sort((a, b) => a - b)
    setValue('weekdays', next, { shouldDirty: true, shouldValidate: true })
  }

  function toggleDate(date: string) {
    const set = new Set(customDates)
    if (set.has(date)) {
      set.delete(date)
    } else {
      set.add(date)
    }
    setValue('customDates', [...set].sort(), { shouldDirty: true, shouldValidate: true })
  }

  function addProduct(productId: number) {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    append({ productId: product.id, productName: product.productName, quantity: 1, unitPrice: product.price })
  }

  function changeQuantity(index: number, next: number) {
    setValue(`items.${index}.quantity`, Math.max(1, next), { shouldDirty: true, shouldValidate: true })
  }

  const recurringSummary = useMemo(() => {
    if (scheduleMode !== 'recurring_route') return ''
    const days = weekdays.map((d) => WEEKDAYS.find((w) => w.value === d)?.label).filter(Boolean).join(', ')
    if (!days) return 'No days selected'
    return `Every ${intervalWeeks === 2 ? '2 weeks' : 'week'} on ${days}`
  }, [scheduleMode, weekdays, intervalWeeks])

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>

      {/* ── Customer section ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--app-text)' }}>
            Customer <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <div style={{ display: 'inline-flex', padding: '3px', gap: '3px', background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: '9px' }}>
            <TabBtn active={targetType === 'customer'} onClick={() => setTargetType('customer')} disabled={isPending}>From records</TabBtn>
            <TabBtn active={targetType === 'guest'} onClick={() => setTargetType('guest')} disabled={isPending}>Guest</TabBtn>
          </div>
        </div>

        {targetType === 'customer' ? (
          <div style={{ position: 'relative' }}>
            <select
              disabled={isPending}
              style={selectStyle}
              {...register('customerId', { setValueAs: (v) => optionalNumber(v) as number | undefined })}
            >
              <option value="">Select a saved customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.isBusiness ? '🏢 Business' : '🏠 Household'} — {c.name}
                </option>
              ))}
            </select>
            <ChevronIcon />
            {errors.customerId && <FieldError>{errors.customerId.message}</FieldError>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
              <input disabled={isPending} placeholder="Guest name" style={inputStyle} {...register('guestName')} />
              <input disabled={isPending} placeholder="Phone (optional)" style={inputStyle} {...register('guestContact')} />
            </div>
            <input disabled={isPending} placeholder="Delivery address" style={inputStyle} {...register('guestAddress')} />
            {errors.guestName && <FieldError>{errors.guestName.message}</FieldError>}
          </div>
        )}
      </div>

      {/* ── Schedule type ── */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '10px' }}>
          Schedule type <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <ScheduleTypeCard
            active={scheduleMode === 'recurring_route'}
            onClick={() => setMode('recurring_route')}
            disabled={isPending}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>}
            title="Recurring route"
            subtitle="Repeat on set weekdays"
          />
          <ScheduleTypeCard
            active={scheduleMode === 'custom_dates'}
            onClick={() => setMode('custom_dates')}
            disabled={isPending}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /><path d="M8.5 14l2 2 4-4.5" /></svg>}
            title="Custom dates"
            subtitle="Pick exact days"
          />
        </div>
      </div>

      {/* ── Recurring config ── */}
      {scheduleMode === 'recurring_route' && (
        <div style={{ background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: '14px', padding: '18px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--app-brand)', marginBottom: '14px' }}>
            Weekly route
          </div>

          {/* Delivery days + Repeat every, side by side */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <div style={{ flex: '1 1 260px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '8px' }}>Delivery days</label>
              <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                {WEEKDAYS.map((day) => {
                  const active = weekdays.includes(day.value)
                  return (
                    <button
                      key={day.value}
                      type="button"
                      disabled={isPending}
                      aria-pressed={active}
                      onClick={() => toggleWeekday(day.value)}
                      style={{ width: '42px', height: '42px', borderRadius: '11px', border: `1.5px solid ${active ? '#7dd3fc' : 'var(--app-border-strong)'}`, background: active ? 'var(--app-chip-bg)' : 'var(--app-surface)', color: active ? 'var(--app-brand)' : 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {day.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div style={{ flex: '0 0 140px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '8px' }}>Repeat every</label>
              <div style={{ display: 'flex', gap: '7px' }}>
                {[1, 2].map((n) => {
                  const active = Number(intervalWeeks) === n
                  return (
                    <button
                      key={n}
                      type="button"
                      disabled={isPending}
                      onClick={() => setValue('intervalWeeks', n, { shouldDirty: true, shouldValidate: true })}
                      style={{ flex: 1, padding: '10px 6px', height: '42px', border: `1.5px solid ${active ? 'var(--app-brand)' : 'var(--app-border-strong)'}`, borderRadius: '10px', background: active ? 'var(--app-brand)' : 'var(--app-surface)', color: active ? '#fff' : 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {n === 1 ? 'Week' : '2 weeks'}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          {errors.weekdays && <FieldError>{errors.weekdays.message}</FieldError>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '7px' }}>Starting from</label>
              <input
                type="date"
                disabled={isPending}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--app-border-strong)', borderRadius: '10px', background: 'var(--app-surface)', color: 'var(--app-text)', fontSize: '13.5px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                {...register('startDate')}
              />
              {errors.startDate && <FieldError>{errors.startDate.message}</FieldError>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '7px' }}>End date (optional)</label>
              <input
                type="date"
                disabled={isPending}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--app-border-strong)', borderRadius: '10px', background: 'var(--app-surface)', color: 'var(--app-text)', fontSize: '13.5px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                {...register('endDate')}
              />
              {errors.endDate && <FieldError>{errors.endDate.message}</FieldError>}
            </div>
          </div>

          {recurringSummary && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', padding: '10px 13px', background: 'var(--app-chip-bg)', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600, color: 'var(--app-brand)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l2.5 1.5" /></svg>
              {recurringSummary}
            </div>
          )}
        </div>
      )}

      {/* ── Custom dates calendar ── */}
      {scheduleMode === 'custom_dates' && (
        <>
          <MultiDateCalendar
            selected={customDates}
            onToggle={toggleDate}
            disabled={isPending}
          />
          {errors.customDates && <FieldError>{errors.customDates.message}</FieldError>}
        </>
      )}

      {/* ── Delivery items ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--app-text)' }}>Delivery items</label>
          <span style={{ fontSize: '12px', color: 'var(--app-text-faint)' }}>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        </div>

        {/* item rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {fields.map((field, index) => (
            <div
              key={field.id}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: '11px', padding: '8px 10px 8px 12px' }}
            >
              <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '9px', background: 'var(--app-chip-bg)', color: 'var(--app-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M9 2.5h6v2l-1 1.3h-4L9 4.5v-2Z" /><path d="M8 5.8h8a1 1 0 0 1 1 1V20a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20V6.8a1 1 0 0 1 1-1Z" /></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--app-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {items[index]?.productName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--app-text-soft)' }}>
                  {pesoFormatter.format(Number(items[index]?.unitPrice ?? 0))} each
                </div>
                <input type="hidden" {...register(`items.${index}.productId`)} />
                <input type="hidden" {...register(`items.${index}.productName`)} />
                <input type="hidden" {...register(`items.${index}.unitPrice`, { setValueAs: (v) => optionalNumber(v) as number })} />
              </div>
              {/* qty stepper */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--app-surface)', border: '1px solid var(--app-border-strong)', borderRadius: '9px', padding: '3px' }}>
                <button
                  type="button"
                  disabled={isPending || Number(items[index]?.quantity ?? 1) <= 1}
                  onClick={() => changeQuantity(index, Number(items[index]?.quantity ?? 1) - 1)}
                  style={{ width: '26px', height: '26px', borderRadius: '7px', border: 'none', background: 'transparent', color: 'var(--app-text-muted)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  −
                </button>
                <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '13.5px', fontWeight: 700, color: 'var(--app-text)' }}>
                  {Number(items[index]?.quantity ?? 1)}
                  <input type="hidden" {...register(`items.${index}.quantity`, { setValueAs: (v) => optionalNumber(v) as number })} />
                </span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => changeQuantity(index, Number(items[index]?.quantity ?? 0) + 1)}
                  style={{ width: '26px', height: '26px', borderRadius: '7px', border: 'none', background: 'transparent', color: 'var(--app-text-muted)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => remove(index)}
                aria-label="Remove item"
                style={{ flexShrink: 0, width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
          ))}
        </div>

        {/* product search + dashed add select */}
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {products.length > 6 && (
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--app-text-faint)', pointerEvents: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
              </span>
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                disabled={isPending}
                placeholder="Filter products…"
                style={{ ...inputStyle, paddingLeft: '35px', fontSize: '13px' }}
              />
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <select
              value=""
              disabled={isPending}
              onChange={(e) => {
                if (!e.target.value) return
                addProduct(Number(e.target.value))
                setProductSearch('')
              }}
              style={{ appearance: 'none', width: '100%', padding: '11px 38px 11px 13px', border: '1.5px dashed var(--app-border-strong)', borderRadius: '11px', background: 'transparent', color: 'var(--app-brand)', fontSize: '13.5px', fontWeight: 600, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">+ Add a product to this delivery…</option>
              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName} — {pesoFormatter.format(p.price)}
                </option>
              ))}
            </select>
            <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--app-brand)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
            </span>
          </div>
          {errors.items && <FieldError>{typeof errors.items.message === 'string' ? errors.items.message : 'Add at least one product.'}</FieldError>}
        </div>
      </div>

      {/* ── Assigned to + Notes ── */}
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '7px' }}>Assigned to</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--app-text-faint)', pointerEvents: 'none' }}>
              <UserRound style={{ width: 16, height: 16 }} />
            </span>
            <select
              disabled={isPending || usersLoading}
              style={{ ...selectStyle, paddingLeft: '39px' }}
              {...register('assignedTo')}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.clerkId} value={u.clerkId}>{u.name || u.clerkId}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '7px' }}>Notes</label>
          <textarea
            disabled={isPending}
            placeholder="Gate code, landmarks, preferred time, payment reminders…"
            rows={2}
            style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--app-border-strong)', borderRadius: '11px', background: 'var(--app-surface-2)', color: 'var(--app-text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', lineHeight: 1.5, boxSizing: 'border-box' }}
            {...register('notes')}
          />
        </div>
      </div>

      {errorMessage && (
        <div role="alert" style={{ padding: '10px 13px', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)', fontSize: '13.5px', color: '#b91c1c' }}>
          {errorMessage}
        </div>
      )}

      {/* ── Footer actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '4px' }}>
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
          {isPending ? 'Scheduling…' : 'Schedule delivery'}
        </button>
      </div>
    </form>
  )
}

function MultiDateCalendar({
  selected,
  onToggle,
  disabled,
}: {
  selected: string[]
  onToggle: (date: string) => void
  disabled?: boolean
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-PH', {
    month: 'long',
    year: 'numeric',
  })

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    // Mon-first offset: Sun=0 → 6, Mon=1 → 0, ...
    const offset = (firstDay.getDay() + 6) % 7
    const result: Array<string | null> = Array.from({ length: offset }, () => null)
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(
        `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      )
    }
    return result
  }, [viewYear, viewMonth])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const selectedSet = new Set(selected)

  return (
    <div style={{ background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: '14px', padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--app-brand)' }}>
          Pick delivery dates
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button type="button" onClick={prevMonth} aria-label="Previous month" style={calNavBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--app-text)', minWidth: '140px', textAlign: 'center' }}>{monthLabel}</span>
          <button type="button" onClick={nextMonth} aria-label="Next month" style={calNavBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>

      {/* weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '6px' }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((h) => (
          <div key={h} style={{ textAlign: 'center', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--app-text-faint)', padding: '4px 0' }}>{h}</div>
        ))}
      </div>

      {/* day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
        {days.map((date, i) => {
          if (!date) return <div key={i} />
          const isPast = date < today
          const isSel = selectedSet.has(date)
          const isToday = date === today
          return (
            <button
              key={date}
              type="button"
              disabled={disabled || isPast}
              onClick={() => !isPast && onToggle(date)}
              style={{
                aspectRatio: '1',
                border: `1.5px solid ${isSel ? 'var(--app-brand)' : isToday ? 'var(--app-brand-soft)' : 'var(--app-border)'}`,
                borderRadius: '9px',
                background: isSel ? 'var(--app-brand)' : 'transparent',
                color: isSel ? '#fff' : isPast ? 'var(--app-text-faint)' : 'var(--app-text)',
                fontFamily: 'inherit',
                fontSize: '12.5px',
                fontWeight: isSel || isToday ? 700 : 400,
                cursor: isPast ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {date.slice(-2).replace(/^0/, '')}
              {isToday && !isSel && (
                <span style={{ position: 'absolute', bottom: '3px', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--app-brand)' }} />
              )}
            </button>
          )
        })}
      </div>

      {/* summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', padding: '10px 13px', background: selected.length > 0 ? 'var(--app-chip-bg)' : 'var(--app-surface-3)', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600, color: selected.length > 0 ? 'var(--app-brand)' : 'var(--app-text-faint)' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>
        {selected.length === 0 ? 'No dates selected' : `${selected.length} date${selected.length === 1 ? '' : 's'} selected`}
      </div>
    </div>
  )
}

// ── helpers ──

function optionalNumber(value: unknown): unknown {
  if (typeof value === 'string') {
    const t = value.trim()
    return t === '' ? undefined : Number(t)
  }
  return value
}

function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return <p style={{ fontSize: '12.5px', color: '#dc2626', marginTop: '6px' }}>{children}</p>
}

function TabBtn({ active, disabled, onClick, children }: { active: boolean; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{ padding: '5px 12px', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, background: active ? 'var(--app-surface)' : 'transparent', color: active ? 'var(--app-brand)' : 'var(--app-text-soft)', boxShadow: active ? '0 2px 6px rgba(14,108,196,0.1)' : 'none' }}
    >
      {children}
    </button>
  )
}

function ScheduleTypeCard({ active, disabled, onClick, icon, title, subtitle }: {
  active: boolean
  disabled: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', textAlign: 'left', padding: '14px', border: `1.5px solid ${active ? 'var(--app-brand)' : 'var(--app-border-strong)'}`, borderRadius: '13px', background: active ? 'var(--app-chip-bg)' : 'var(--app-surface)', cursor: 'pointer', fontFamily: 'inherit' }}
    >
      <div style={{ flexShrink: 0, width: '34px', height: '34px', borderRadius: '10px', background: active ? 'var(--app-brand)' : 'var(--app-chip-bg)', color: active ? '#fff' : 'var(--app-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--app-text)' }}>{title}</div>
        <div style={{ fontSize: '12px', color: 'var(--app-text-soft)', marginTop: '2px', lineHeight: 1.4 }}>{subtitle}</div>
      </div>
    </button>
  )
}

function ChevronIcon() {
  return (
    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--app-text-soft)' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
    </span>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 13px',
  border: '1px solid var(--app-border-strong)',
  borderRadius: '11px',
  background: 'var(--app-surface-2)',
  color: 'var(--app-text)',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  appearance: 'none',
  width: '100%',
  padding: '12px 38px 12px 13px',
  border: '1px solid var(--app-border-strong)',
  borderRadius: '11px',
  background: 'var(--app-surface-2)',
  color: 'var(--app-text)',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  cursor: 'pointer',
  boxSizing: 'border-box',
}

const calNavBtn: React.CSSProperties = {
  width: '30px',
  height: '30px',
  borderRadius: '8px',
  border: '1px solid var(--app-border-strong)',
  background: 'var(--app-surface)',
  color: 'var(--app-text-soft)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
