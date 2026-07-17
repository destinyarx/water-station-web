'use client'

import { useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'

type ConfirmDialogVariant = 'primary' | 'destructive'
type ConfirmDialogSize = 'sm' | 'md'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  body?: ReactNode
  confirmLabel: string
  pendingLabel: string
  onConfirm: () => void
  isPending: boolean
  errorMessage?: string
  variant?: ConfirmDialogVariant
  icon?: ReactNode
  iconColor?: string
  iconBackground?: string
  size?: ConfirmDialogSize
  cancelLabel?: string
  confirmButtonStyle?: CSSProperties
  actions?: ReactNode
}

const sizeMaxWidth: Record<ConfirmDialogSize, CSSProperties['maxWidth']> = {
  sm: '430px',
  md: '480px',
}

const primaryIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" />
  </svg>
)

const destructiveIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
)

/**
 * Centered confirmation modal matching the AquaFlow app design. Defaults to the
 * primary action treatment; destructive flows opt into the red variant.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  body,
  confirmLabel,
  pendingLabel,
  onConfirm,
  isPending,
  errorMessage,
  variant = 'primary',
  icon,
  iconColor,
  iconBackground,
  size = 'sm',
  cancelLabel = 'Cancel',
  confirmButtonStyle,
  actions,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return

    function onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') onOpenChange(false)
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  if (!open) return null

  const isDestructive = variant === 'destructive'
  const resolvedIcon = icon ?? (isDestructive ? destructiveIcon : primaryIcon)
  const resolvedIconColor = iconColor ?? (isDestructive ? '#dc2626' : 'var(--app-brand)')
  const resolvedIconBackground = iconBackground ?? (isDestructive ? 'rgba(220,38,38,0.1)' : 'var(--app-chip-bg)')
  const confirmStyle: CSSProperties = {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    background: isDestructive ? '#dc2626' : 'linear-gradient(150deg,#3fb0f0,#0a6cc4)',
    color: '#fff',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: isDestructive ? '0 10px 22px rgba(220,38,38,0.28)' : '0 10px 22px rgba(14,108,196,0.3)',
    ...confirmButtonStyle,
  }

  return (
    <div
      onClick={() => onOpenChange(false)}
      style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'var(--app-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        style={{ width: '100%', maxWidth: sizeMaxWidth[size], background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '20px', boxShadow: '0 40px 90px rgba(7,40,70,0.4)', padding: '28px', textAlign: 'center', animation: 'floatUp .24s ease' }}
      >
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: resolvedIconBackground, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: resolvedIconColor }}>
          {resolvedIcon}
        </div>
        <div style={{ fontSize: '19px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '8px' }}>{title}</div>
        {description ? (
          <div style={{ fontSize: '14px', color: 'var(--app-text-muted)', lineHeight: 1.6, margin: body ? '0 0 16px' : '0 0 22px' }}>{description}</div>
        ) : null}
        {body ? (
          <div style={{ margin: '0 0 22px' }}>{body}</div>
        ) : null}

        {errorMessage ? (
          <p role="alert" style={{ borderRadius: '11px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)', padding: '9px 12px', fontSize: '13px', color: '#dc2626', margin: '0 0 16px' }}>
            {errorMessage}
          </p>
        ) : null}

        {actions ?? (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" disabled={isPending} onClick={() => onOpenChange(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)', color: 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              {cancelLabel}
            </button>
            <button type="button" disabled={isPending} onClick={onConfirm} style={confirmStyle}>
              {isPending ? pendingLabel : confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
