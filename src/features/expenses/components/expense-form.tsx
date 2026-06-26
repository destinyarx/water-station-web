'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  EXPENSE_FORM_DEFAULTS,
  expenseCategories,
  paymentMethods,
} from '../expenses.constants'
import { expenseFormSchema } from '../expenses.schema'
import { getPaymentMeta } from '../expenses.ui-meta'
import type { ExpenseFormInput, ExpenseFormValues } from '../expenses.types'

interface ExpenseFormProps {
  defaultValues?: ExpenseFormValues
  onSubmit: (values: ExpenseFormValues) => void
  isPending: boolean
  errorMessage?: string
  submitLabel: string
  pendingLabel: string
  onCancel?: () => void
}

const INPUT_STYLE: React.CSSProperties = {
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

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--app-text)',
  marginBottom: '7px',
}

export function ExpenseForm({
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
  submitLabel,
  pendingLabel,
  onCancel,
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: defaultValues ?? EXPENSE_FORM_DEFAULTS,
  })

  const selectedPayment = watch('paymentMethod')
  const selectedCategory = watch('category')
  const submit = handleSubmit((values) => onSubmit(values))

  const numberSetValueAs = (value: string): number | undefined =>
    value.trim() === '' ? undefined : Number(value)

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} noValidate>
      {/* Title */}
      <Field label="Expense title" required error={errors.name?.message}>
        <input
          placeholder="e.g. Monthly electricity bill"
          disabled={isPending}
          style={INPUT_STYLE}
          {...register('name')}
        />
      </Field>

      {/* Amount + Date */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <Field label="Amount" required error={errors.amount?.message}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', fontWeight: 700, color: 'var(--app-text-soft)' }}>₱</span>
            <input
              placeholder="0.00"
              inputMode="decimal"
              disabled={isPending}
              style={{ ...INPUT_STYLE, paddingLeft: '27px' }}
              {...register('amount', { setValueAs: numberSetValueAs })}
            />
          </div>
        </Field>
        <Field label="Date incurred" required error={errors.dateIncurred?.message}>
          <input
            type="date"
            disabled={isPending}
            style={INPUT_STYLE}
            {...register('dateIncurred')}
          />
        </Field>
      </div>

      {/* Category */}
      <Field label="Category" required error={errors.category?.message}>
        <div style={{ position: 'relative' }}>
          <select
            disabled={isPending}
            style={{ ...INPUT_STYLE, appearance: 'none', paddingRight: '38px', cursor: 'pointer' }}
            {...register('category')}
          >
            <option value="">Select a category…</option>
            {expenseCategories.map((c) => (
              <option key={c.value} value={c.value}>{c.name}</option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--app-text-soft)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
          </span>
        </div>
      </Field>

      {selectedCategory === 'other' && (
        <Field label="Category details" error={errors.categoryOther?.message}>
          <input disabled={isPending} style={INPUT_STYLE} {...register('categoryOther')} />
        </Field>
      )}

      {/* Payment method button grid */}
      <div>
        <label style={LABEL_STYLE}>Payment method <span style={{ color: '#dc2626' }}>*</span></label>
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field }) => (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '9px' }}>
              {paymentMethods.map((pm) => {
                const icons = getPaymentMeta(pm.value)
                const active = field.value === pm.value
                return (
                  <button
                    key={pm.value}
                    type="button"
                    disabled={isPending}
                    onClick={() => field.onChange(pm.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '7px',
                      padding: '10px 8px',
                      border: `1.5px solid ${active ? 'var(--app-brand-soft)' : 'var(--app-border-strong)'}`,
                      borderRadius: '11px',
                      background: active ? 'var(--app-chip-bg)' : 'var(--app-surface-2)',
                      color: active ? 'var(--app-brand)' : 'var(--app-text-muted)',
                      fontFamily: 'inherit',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ width: '20px', height: '20px', borderRadius: '6px', background: icons.bg, color: icons.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800 }}>
                      {icons.initial}
                    </span>
                    {pm.name}
                  </button>
                )
              })}
            </div>
          )}
        />
        {selectedPayment === 'other' && (
          <input
            placeholder="Type the payment method (e.g. Cheque, Credit line)"
            disabled={isPending}
            style={{ ...INPUT_STYLE, marginTop: '10px' }}
            {...register('paymentMethodOther')}
          />
        )}
        {errors.paymentMethod?.message && <FieldError message={errors.paymentMethod.message} />}
        {errors.paymentMethodOther?.message && <FieldError message={errors.paymentMethodOther.message} />}
      </div>

      {/* Description */}
      <Field label="Description" error={errors.description?.message}>
        <input placeholder="Optional notes" disabled={isPending} style={INPUT_STYLE} {...register('description')} />
      </Field>

      {/* Reference number */}
      <Field label="Reference number" error={errors.referencesNumber?.message}>
        <input placeholder="Optional receipt, transfer, or payment reference" disabled={isPending} style={INPUT_STYLE} {...register('referencesNumber')} />
      </Field>

      {errorMessage && (
        <p role="alert" style={{ borderRadius: '11px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)', padding: '10px 13px', fontSize: '13.5px', color: '#dc2626', margin: 0 }}>
          {errorMessage}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '4px' }}>
        {onCancel && (
          <button type="button" disabled={isPending} onClick={onCancel} style={{ padding: '11px 20px', borderRadius: '11px', border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)', color: 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 24px', borderRadius: '11px', border: 'none', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 10px 22px rgba(14,108,196,0.3)' }}
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL_STYLE}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
      {error && <FieldError message={error} />}
    </div>
  )
}

function FieldError({ message }: { message: string }) {
  return <p style={{ fontSize: '12.5px', color: '#dc2626', marginTop: '6px', marginBottom: 0 }}>{message}</p>
}
