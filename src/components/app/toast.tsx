'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { dismissToast, getToasts, subscribeToasts } from '@/stores/toast-store'
import type { ToastItem, ToastType } from '@/stores/toast-store'

interface ToastStyle {
  label: string
  disc: string
  accent: string
  ring: string
  icon: ReactNode
}

/** Stroke that draws itself in on mount. */
const drawStyle: CSSProperties = {
  strokeDasharray: 48,
  strokeDashoffset: 48,
  animation: 'toastIconDraw 0.5s 0.12s ease forwards',
}

const TOAST_STYLE: Record<ToastType, ToastStyle> = {
  success: {
    label: 'Success',
    disc: 'linear-gradient(135deg, #40d598 0%, #1f9d68 100%)',
    accent: '#1f9d68',
    ring: 'rgba(64, 213, 152, 0.55)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7" style={drawStyle} />
      </svg>
    ),
  },
  error: {
    label: 'Error',
    disc: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
    accent: '#e11d48',
    ring: 'rgba(251, 113, 133, 0.55)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <path d="M7 7l10 10" style={drawStyle} />
        <path d="M17 7 7 17" style={{ ...drawStyle, animationDelay: '0.24s' }} />
      </svg>
    ),
  },
  warning: {
    label: 'Warning',
    disc: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    accent: '#d97706',
    ring: 'rgba(251, 191, 36, 0.55)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4.5 21 19.5H3L12 4.5Z" style={drawStyle} />
        <path d="M12 10v4.5" style={{ ...drawStyle, animationDelay: '0.3s' }} />
        <path d="M12 17.3h.01" style={{ ...drawStyle, animationDelay: '0.42s' }} />
      </svg>
    ),
  },
  info: {
    label: 'Notification',
    disc: 'linear-gradient(135deg, #4fb5e8 0%, #00658a 100%)',
    accent: 'var(--app-brand)',
    ring: 'rgba(79, 181, 232, 0.55)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 11v5.5" style={drawStyle} />
        <path d="M12 7.6h.01" style={{ ...drawStyle, animationDelay: '0.28s' }} />
      </svg>
    ),
  },
}

/** Mounted once near the app root. Renders the live toast stack, top-right. */
export function Toaster() {
  const items = useSyncExternalStore(subscribeToasts, getToasts, getToasts)

  return (
    <div
      style={{
        position: 'fixed',
        top: '22px',
        right: '22px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '13px',
        width: 'min(420px, calc(100vw - 32px))',
        pointerEvents: 'none',
      }}
    >
      {items.map((item) => (
        <ToastCard key={item.id} toast={item} />
      ))}
    </div>
  )
}

function ToastCard({ toast }: { toast: ToastItem }) {
  const [hovered, setHovered] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const style = TOAST_STYLE[toast.type]

  function close() {
    setLeaving(true)
    setTimeout(() => dismissToast(toast.id), 200)
  }

  useEffect(() => {
    if (!toast.autoClose || hovered || leaving) return
    const timer = setTimeout(close, toast.duration)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered, leaving, toast.autoClose, toast.duration])

  return (
    <div
      role="status"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
        borderRadius: '17px',
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        boxShadow: '0 22px 50px rgba(7, 40, 70, 0.26)',
        animation: `${leaving ? 'toastSlideOut' : 'toastSlideInRight'} 0.24s ease forwards`,
      }}
    >
      {/* Colored accent rail */}
      <span aria-hidden="true" style={{ flex: 'none', width: '6px', background: style.disc }} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '17px 16px 18px 16px' }}>
        {/* Animated icon disc with a pulsing ring */}
        <div style={{ position: 'relative', flex: 'none', width: '46px', height: '46px' }}>
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '14px',
              background: style.ring,
              animation: 'toastRingPulse 1.6s ease-out 0.1s',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: style.disc,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 18px rgba(7, 40, 70, 0.20)',
              animation: 'toastIconPop 0.4s ease',
            }}
          >
            {style.icon}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, paddingTop: '1px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: style.accent,
              marginBottom: '3px',
            }}
          >
            {style.label}
          </div>
          <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--app-text)', lineHeight: 1.45, wordBreak: 'break-word' }}>
            {toast.message}
          </div>
        </div>

        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={close}
          style={{
            flex: 'none',
            width: '26px',
            height: '26px',
            marginTop: '-2px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--app-text-faint)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>

      {/* Countdown progress bar (pauses on hover) */}
      {toast.autoClose && !leaving && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: '3px',
            width: '100%',
            transformOrigin: 'left',
            background: style.disc,
            animation: `toastProgress ${toast.duration}ms linear forwards`,
            animationPlayState: hovered ? 'paused' : 'running',
          }}
        />
      )}
    </div>
  )
}
