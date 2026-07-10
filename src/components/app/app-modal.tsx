'use client'

import { useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'

type AppModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

interface AppModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  iconColor?: string
  iconBackground?: string
  size?: AppModalSize
  maxWidth?: CSSProperties['maxWidth']
  children: ReactNode
  footer?: ReactNode
  bodyPadding?: CSSProperties['padding']
  zIndex?: number
  closeLabel?: string
}

const sizeMaxWidth: Record<AppModalSize, CSSProperties['maxWidth']> = {
  sm: '430px',
  md: '512px',
  lg: '580px',
  xl: '600px',
  '2xl': '660px',
  '3xl': '700px',
}

const defaultIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
    <path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" />
  </svg>
)

export function AppModal({
  open,
  onOpenChange,
  title,
  description,
  icon = defaultIcon,
  iconColor = '#fff',
  iconBackground = 'linear-gradient(150deg,#3fb0f0,#0a6cc4)',
  size = 'xl',
  maxWidth,
  children,
  footer,
  bodyPadding = '22px 26px',
  zIndex = 80,
  closeLabel = 'Close',
}: AppModalProps): ReactNode {
  useEffect(() => {
    if (!open) return

    function onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') onOpenChange(false)
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex, background: 'var(--app-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '36px 18px', overflowY: 'auto' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        style={{ width: '100%', maxWidth: maxWidth ?? sizeMaxWidth[size], background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '20px', boxShadow: '0 40px 90px rgba(7,40,70,0.4)', overflow: 'hidden', animation: 'floatUp .26s ease' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', padding: '22px 26px 18px', borderBottom: '1px solid var(--app-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '13px', minWidth: 0 }}>
            <div style={{ flex: 'none', width: '44px', height: '44px', borderRadius: '13px', background: iconBackground, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(14,108,196,0.28)' }}>
              {icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--app-text)' }}>{title}</div>
              {description ? (
                <div style={{ fontSize: '13.5px', color: 'var(--app-text-soft)', marginTop: '2px' }}>{description}</div>
              ) : null}
            </div>
          </div>
          <button type="button" aria-label={closeLabel} onClick={() => onOpenChange(false)} style={{ flex: 'none', width: '34px', height: '34px', borderRadius: '10px', border: '1px solid var(--app-border)', background: 'var(--app-surface-2)', color: 'var(--app-text-soft)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <div style={{ padding: bodyPadding }}>
          {children}
        </div>
        {footer ? (
          <div style={{ padding: '18px 26px', borderTop: '1px solid var(--app-border)', background: 'var(--app-surface-2)' }}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
