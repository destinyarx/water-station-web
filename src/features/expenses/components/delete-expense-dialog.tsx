'use client'

import type { Expense } from '../expenses.types'
import { useSoftDeleteExpense } from '../hooks/use-soft-delete-expense'

interface DeleteExpenseDialogProps {
  expense: Expense
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteExpenseDialog({ expense, open, onOpenChange }: DeleteExpenseDialogProps) {
  const mutation = useSoftDeleteExpense()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) mutation.reset()
  }

  function handleConfirm() {
    mutation.mutate(expense.id, { onSuccess: () => handleOpenChange(false) })
  }

  if (!open) return null

  return (
    <div
      onClick={() => handleOpenChange(false)}
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--app-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '420px', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '20px', boxShadow: '0 40px 90px rgba(7,40,70,0.4)', padding: '28px', textAlign: 'center', animation: 'floatUp .24s ease' }}
      >
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: '#dc2626' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </div>
        <div style={{ fontSize: '19px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '8px' }}>Delete this expense?</div>
        <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', lineHeight: 1.6, margin: '0 0 22px' }}>
          &ldquo;{expense.name}&rdquo; will be removed from your records and reports.
        </p>
        {mutation.isError && (
          <p role="alert" style={{ fontSize: '13px', color: '#dc2626', marginBottom: '16px' }}>{mutation.error.message}</p>
        )}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => handleOpenChange(false)}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)', color: 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={handleConfirm}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#dc2626', color: '#fff', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 10px 22px rgba(220,38,38,0.28)' }}
          >
            {mutation.isPending ? 'Deleting...' : 'Yes, delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
