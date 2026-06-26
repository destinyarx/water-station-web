'use client'

import type { ExpenseFormValues } from '../expenses.types'
import { ExpenseForm } from './expense-form'

interface ExpenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  defaultValues?: ExpenseFormValues
  onSubmit: (values: ExpenseFormValues) => void
  isPending: boolean
  errorMessage?: string
  submitLabel: string
  pendingLabel: string
}

export function ExpenseFormDialog({
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
}: ExpenseFormDialogProps) {
  if (!open) return null

  return (
    <div
      onClick={() => onOpenChange(false)}
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--app-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '36px 18px', overflowY: 'auto' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '700px', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '20px', boxShadow: '0 40px 90px rgba(7,40,70,0.4)', overflow: 'hidden', animation: 'floatUp .26s ease' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', padding: '22px 26px 18px', borderBottom: '1px solid var(--app-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
            <div style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: '13px', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(14,108,196,0.28)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /></svg>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--app-text)' }}>{title}</div>
              <div style={{ fontSize: '13.5px', color: 'var(--app-text-soft)', marginTop: '2px' }}>{description}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            style={{ flexShrink: 0, width: '34px', height: '34px', borderRadius: '10px', border: '1px solid var(--app-border)', background: 'var(--app-surface-2)', color: 'var(--app-text-soft)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 26px' }}>
          <ExpenseForm
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isPending={isPending}
            errorMessage={errorMessage}
            submitLabel={submitLabel}
            pendingLabel={pendingLabel}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </div>
    </div>
  )
}
