'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { CUSTOMER_FORM_DEFAULTS } from '../customers.constants'
import { customerFormSchema } from '../customers.schema'
import type { CustomerFormInput, CustomerFormValues } from '../customers.types'

interface CustomerFormProps {
  defaultValues?: CustomerFormValues
  onSubmit: (values: CustomerFormValues) => void
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

const SUB_INPUT_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  background: 'var(--app-surface-2)',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--app-text)',
  marginBottom: '6px',
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '11.5px',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: '14px',
}

export function CustomerForm({
  defaultValues,
  onSubmit,
  isPending,
  errorMessage,
  submitLabel,
  pendingLabel,
  onCancel,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormInput, unknown, CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: defaultValues ?? CUSTOMER_FORM_DEFAULTS,
  })

  const submit = handleSubmit((values) => onSubmit(values))

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} noValidate>
      {/* Identity */}
      <div style={{ background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: '14px', padding: '18px' }}>
        <div style={{ ...SECTION_LABEL, color: 'var(--app-brand)' }}>Identity</div>
        <label style={LABEL_STYLE}>
          Name <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          placeholder="e.g. Maria Santos or Sunrise Café"
          disabled={isPending}
          style={INPUT_STYLE}
          {...register('name')}
        />
        {errors.name?.message ? <FieldError message={errors.name.message} /> : null}
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', cursor: 'pointer', userSelect: 'none' }}>
          <input type="checkbox" disabled={isPending} style={{ width: '18px', height: '18px', accentColor: '#0a6cc4', cursor: 'pointer' }} {...register('isBusiness')} />
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--app-text)' }}>This is a business customer</span>
        </label>
      </div>

      {/* Contact */}
      <div>
        <div style={{ ...SECTION_LABEL, color: 'var(--app-text-faint)' }}>Contact</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Field label="Contact number" error={errors.contactNumber?.message}>
            <input placeholder="0917 555 0142" disabled={isPending} style={INPUT_STYLE} {...register('contactNumber')} />
          </Field>
          <Field label="Facebook link" error={errors.facebookUrl?.message}>
            <input placeholder="https://facebook.com/…" disabled={isPending} style={INPUT_STYLE} {...register('facebookUrl')} />
          </Field>
        </div>
      </div>

      {/* Delivery address */}
      <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '14px', padding: '18px' }}>
        <div style={{ ...SECTION_LABEL, color: 'var(--app-brand)' }}>Delivery address</div>
        <Field label="Street address" error={errors.streetAddress?.message}>
          <input placeholder="24 Mabini St." disabled={isPending} style={SUB_INPUT_STYLE} {...register('streetAddress')} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
          <Field label="Barangay" error={errors.barangay?.message}>
            <input placeholder="San Roque" disabled={isPending} style={SUB_INPUT_STYLE} {...register('barangay')} />
          </Field>
          <Field label="Municipality" error={errors.municipality?.message}>
            <input placeholder="Calamba" disabled={isPending} style={SUB_INPUT_STYLE} {...register('municipality')} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
          <Field label="Province" error={errors.province?.message}>
            <input placeholder="Laguna" disabled={isPending} style={SUB_INPUT_STYLE} {...register('province')} />
          </Field>
          <div />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
          <Field label="Latitude" error={errors.latitude?.message}>
            <input placeholder="14.2117" inputMode="decimal" disabled={isPending} style={SUB_INPUT_STYLE} {...register('latitude')} />
          </Field>
          <Field label="Longitude" error={errors.longitude?.message}>
            <input placeholder="121.1653" inputMode="decimal" disabled={isPending} style={SUB_INPUT_STYLE} {...register('longitude')} />
          </Field>
        </div>
      </div>

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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
      {error ? <FieldError message={error} /> : null}
    </div>
  )
}

function FieldError({ message }: { message: string }) {
  return <div style={{ fontSize: '12.5px', color: '#dc2626', marginTop: '6px' }}>{message}</div>
}
