'use client'

import { useEffect } from 'react'

import { CustomerForm } from './customer-form'
import type { CustomerFormValues } from '../customers.types'

interface CustomerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  defaultValues?: CustomerFormValues
  onSubmit: (values: CustomerFormValues) => void
  isPending: boolean
  errorMessage?: string
  submitLabel: string
  pendingLabel: string
}

/**
 * Custom modal shell around `CustomerForm`, matching the AquaFlow design. Pure
 * presentation: the create/edit wrappers own their mutations and pass results
 * in. A fresh `key` per open resets the form's internal state between opens.
 */
export function CustomerFormDialog({
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
}: CustomerFormDialogProps) {
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div
      onClick={() => onOpenChange(false)}
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--app-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 18px', overflowY: 'auto' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        style={{ width: '100%', maxWidth: '660px', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '20px', boxShadow: '0 40px 90px rgba(7,40,70,0.4)', overflow: 'hidden', animation: 'floatUp .26s ease' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', padding: '24px 26px 18px', borderBottom: '1px solid var(--app-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
            <div style={{ flex: 'none', width: '44px', height: '44px', borderRadius: '13px', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(14,108,196,0.3)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" /></svg>
            </div>
            <div>
              <div style={{ fontSize: '19px', fontWeight: 700, color: 'var(--app-text)' }}>{title}</div>
              <div style={{ fontSize: '13.5px', color: 'var(--app-text-soft)', marginTop: '2px' }}>{description}</div>
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={() => onOpenChange(false)} style={{ flex: 'none', width: '34px', height: '34px', borderRadius: '10px', border: '1px solid var(--app-border)', background: 'var(--app-surface-2)', color: 'var(--app-text-soft)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <div style={{ padding: '22px 26px' }}>
          <CustomerForm
            key={open ? 'open' : 'closed'}
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
