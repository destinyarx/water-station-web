'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'

import { dismissToast, getToasts, subscribeToasts } from '@/stores/toast-store'
import type { ToastItem, ToastType } from '@/stores/toast-store'

const TOAST_STYLE: Record<ToastType, { bg: string; text: string; icon: ReactNode }> = {
  success: {
    bg: 'var(--app-chip-green-bg)',
    text: 'var(--app-chip-green-text)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
    ),
  },
  error: {
    bg: 'var(--app-chip-red-bg)',
    text: 'var(--app-chip-red-text)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
    ),
  },
  warning: {
    bg: 'var(--app-chip-amber-bg)',
    text: 'var(--app-chip-amber-text)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5 21 19.5H3L12 4.5Z" /><path d="M12 10v4M12 17h.01" /></svg>
    ),
  },
  info: {
    bg: 'var(--app-chip-bg)',
    text: 'var(--app-brand)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.5h.01" /></svg>
    ),
  },
}

/** Mounted once near the app root. Renders the live toast stack, top-right. */
export function Toaster() {
  const items = useSyncExternalStore(subscribeToasts, getToasts, getToasts)

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 200, display: 'flex', flexDirection: 'column', gap: '10px', width: 'min(360px, calc(100vw - 40px))', pointerEvents: 'none' }}>
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
    setTimeout(() => dismissToast(toast.id), 180)
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
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '11px',
        padding: '14px 15px',
        borderRadius: '14px',
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        boxShadow: '0 18px 44px rgba(7,40,70,0.22)',
        animation: `${leaving ? 'toastSlideOut' : 'toastSlideIn'} .22s ease forwards`,
      }}
    >
      <div style={{ flex: 'none', width: '30px', height: '30px', borderRadius: '9px', background: style.bg, color: style.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {style.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0, fontSize: '13.5px', fontWeight: 500, color: 'var(--app-text)', lineHeight: 1.5, paddingTop: '4px' }}>
        {toast.message}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={close}
        style={{ flex: 'none', width: '22px', height: '22px', marginTop: '4px', border: 'none', background: 'transparent', color: 'var(--app-text-faint)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    </div>
  )
}
