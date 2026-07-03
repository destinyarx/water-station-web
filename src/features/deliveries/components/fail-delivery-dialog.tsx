'use client'

import { useState } from 'react'

import { ConfirmDialog } from '@/components/app/confirm-dialog'

interface FailDeliveryDialogProps {
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

export function FailDeliveryDialog({
  open,
  onOpenChange,
  isPending,
  errorMessage,
  onConfirm,
}: FailDeliveryDialogProps) {
  const [remarks, setRemarks] = useState('')
  const trimmed = remarks.trim()

  // Clear on any close path (overlay, escape, cancel) so reopening starts fresh.
  function handleOpenChange(next: boolean) {
    if (!next) setRemarks('')
    onOpenChange(next)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      variant="destructive"
      title="Mark delivery as failed"
      description="Record why this delivery did not go through. Any deducted stock is restored."
      body={
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="failure-remarks" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '6px' }}>
            Reason
          </label>
          <textarea
            id="failure-remarks"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            rows={3}
            placeholder="e.g. Customer not home, gate closed."
            style={TEXTAREA_STYLE}
          />
        </div>
      }
      confirmLabel="Mark failed"
      pendingLabel="Saving..."
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
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending || trimmed === ''}
            onClick={() => onConfirm(trimmed)}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: isPending || trimmed === '' ? 'var(--app-text-faint)' : '#dc2626', color: '#fff', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: isPending || trimmed === '' ? 'default' : 'pointer', boxShadow: isPending || trimmed === '' ? 'none' : '0 10px 22px rgba(220,38,38,0.28)' }}
          >
            {isPending ? 'Saving...' : 'Mark failed'}
          </button>
        </div>
      }
    />
  )
}
