'use client'

import { useEffect } from 'react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  body: React.ReactNode
  confirmLabel: string
  pendingLabel: string
  onConfirm: () => void
  isPending: boolean
  errorMessage?: string
}

/**
 * Centered confirm modal matching the AquaFlow design (destructive variant).
 * App-themed via `--app-*` tokens so it follows the dark-mode toggle. Shared by
 * the customers (archive) and products (delete) flows.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  pendingLabel,
  onConfirm,
  isPending,
  errorMessage,
}: ConfirmDialogProps) {
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
      style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'var(--app-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        style={{ width: '100%', maxWidth: '430px', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '20px', boxShadow: '0 40px 90px rgba(7,40,70,0.4)', padding: '28px', textAlign: 'center', animation: 'floatUp .24s ease' }}
      >
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: '#dc2626' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
        </div>
        <div style={{ fontSize: '19px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '8px' }}>{title}</div>
        <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', lineHeight: 1.6, margin: '0 0 22px' }}>{body}</p>

        {errorMessage ? (
          <p role="alert" style={{ borderRadius: '11px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)', padding: '9px 12px', fontSize: '13px', color: '#dc2626', margin: '0 0 16px' }}>
            {errorMessage}
          </p>
        ) : null}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" disabled={isPending} onClick={() => onOpenChange(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)', color: 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="button" disabled={isPending} onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#dc2626', color: '#fff', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 10px 22px rgba(220,38,38,0.28)' }}>
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
