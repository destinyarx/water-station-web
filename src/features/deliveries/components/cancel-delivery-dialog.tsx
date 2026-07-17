'use client'

import { useState } from 'react'

import { ConfirmDialog } from '@/components/app/confirm-dialog'

interface CancelDeliveryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  errorMessage?: string
  onConfirm: (remarks: string) => void
}

const TEXTAREA_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  border: '1px solid var(--app-border-strong)',
  borderRadius: '11px',
  background: 'var(--app-surface-2)',
  color: 'var(--app-text)',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  resize: 'vertical',
  boxSizing: 'border-box',
}

export function CancelDeliveryDialog({
  open,
  onOpenChange,
  isPending,
  errorMessage,
  onConfirm,
}: CancelDeliveryDialogProps) {
  const [remarks, setRemarks] = useState('')
  const trimmed = remarks.trim()

  function handleOpenChange(next: boolean) {
    if (!next) setRemarks('')
    onOpenChange(next)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      variant="destructive"
      title="Cancel delivery"
      description="Record why this delivery is cancelled. If it was already for delivery, deducted stock is restored."
      body={
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="cancellation-remarks" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '6px' }}>
            Reason
          </label>
          <textarea
            id="cancellation-remarks"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            rows={3}
            maxLength={500}
            required
            placeholder="e.g. Customer cancelled the order."
            style={TEXTAREA_STYLE}
          />
        </div>
      }
      confirmLabel="Cancel delivery"
      pendingLabel="Saving..."
      cancelLabel="Keep delivery"
      onConfirm={() => onConfirm(trimmed)}
      isPending={isPending}
      errorMessage={errorMessage}
      actions={
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleOpenChange(false)}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)', color: 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Keep delivery
          </button>
          <button
            type="button"
            disabled={isPending || trimmed === ''}
            onClick={() => onConfirm(trimmed)}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: isPending || trimmed === '' ? 'var(--app-text-faint)' : '#dc2626', color: '#fff', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: isPending || trimmed === '' ? 'default' : 'pointer', boxShadow: isPending || trimmed === '' ? 'none' : '0 10px 22px rgba(220,38,38,0.28)' }}
          >
            {isPending ? 'Saving...' : 'Cancel delivery'}
          </button>
        </div>
      }
    />
  )
}
