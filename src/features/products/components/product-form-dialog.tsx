'use client'

import { useEffect } from 'react'

import type { ProductFormValues } from '../products.types'
import { ProductForm } from './product-form'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  defaultValues?: ProductFormValues
  onSubmit: (values: ProductFormValues) => void
  isPending: boolean
  errorMessage?: string
  submitLabel: string
  pendingLabel: string
}

/** Custom modal shell around `ProductForm`, matching the AquaFlow design. */
export function ProductFormDialog({
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
}: ProductFormDialogProps) {
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
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--app-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '36px 18px', overflowY: 'auto' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        style={{ width: '100%', maxWidth: '600px', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '20px', boxShadow: '0 40px 90px rgba(7,40,70,0.4)', overflow: 'hidden', animation: 'floatUp .26s ease' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', padding: '22px 24px 18px', borderBottom: '1px solid var(--app-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
            <div style={{ flex: 'none', width: '44px', height: '44px', borderRadius: '13px', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(14,108,196,0.28)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M12 3c3.5 4.5 5.5 7 5.5 9.8a5.5 5.5 0 1 1-11 0C6.5 10 8.5 7.5 12 3Z" /></svg>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--app-text)' }}>{title}</div>
              <div style={{ fontSize: '13.5px', color: 'var(--app-text-soft)', marginTop: '2px' }}>{description}</div>
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={() => onOpenChange(false)} style={{ flex: 'none', width: '34px', height: '34px', borderRadius: '10px', border: '1px solid var(--app-border)', background: 'var(--app-surface-2)', color: 'var(--app-text-soft)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <div style={{ padding: '22px 24px' }}>
          <ProductForm
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
