'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { notificationTypeMeta } from '../notifications.constants'
import type { Notification } from '../notifications.types'
import { useNotifications } from '../hooks/use-notifications'

function timeAgo(iso: string): string {
  const hasTz = /[zZ]|[+-]\d\d:?\d\d$/.test(iso)
  const ms = Date.now() - new Date(hasTz ? iso : `${iso}Z`).getTime()
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// ponytail: hand-rolled popover with a click-outside listener to match the
// header's bespoke inline-style buttons; a shadcn DropdownMenu here would fight
// the "mark all read" action wanting to keep the panel open.
export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } =
    useNotifications()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  function handleOpenNotification(item: Notification) {
    if (!item.isRead) markAsRead(item.id)
    const { route } = notificationTypeMeta(item.type)
    setOpen(false)
    if (route) router.push(route)
  }

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((value) => !value)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '12px',
          border: '1px solid var(--app-border-strong)',
          background: 'var(--app-surface)',
          color: 'var(--app-brand)',
          cursor: 'pointer',
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8.5a6 6 0 1 0-12 0c0 6.5-2.5 8-2.5 8h17S18 15 18 8.5Z" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '17px',
              height: '17px',
              padding: '0 4px',
              borderRadius: '9px',
              background: 'var(--app-chip-red-text, #dc2626)',
              color: '#fff',
              fontSize: '10.5px',
              fontWeight: 700,
              lineHeight: '17px',
              textAlign: 'center',
              boxShadow: '0 0 0 2px var(--app-surface)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 'min(360px, calc(100vw - 40px))',
            maxHeight: '440px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '14px',
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
            boxShadow: '0 18px 44px rgba(7,40,70,0.22)',
            zIndex: 210,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '13px 15px',
              borderBottom: '1px solid var(--app-border)',
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--app-text)' }}>
              Notifications
            </span>
            <button
              type="button"
              onClick={() => markAllAsRead()}
              disabled={unreadCount === 0}
              style={{
                border: 'none',
                background: 'transparent',
                color: unreadCount === 0 ? 'var(--app-text-faint)' : 'var(--app-brand)',
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: unreadCount === 0 ? 'default' : 'pointer',
              }}
            >
              Mark all read
            </button>
          </div>

          <div style={{ overflowY: 'auto' }}>
            {loading ? (
              <p style={emptyStyle}>Loading…</p>
            ) : notifications.length === 0 ? (
              <p style={emptyStyle}>You&apos;re all caught up.</p>
            ) : (
              notifications.map((item) => {
                const { accent } = notificationTypeMeta(item.type)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleOpenNotification(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      width: '100%',
                      padding: '12px 15px',
                      border: 'none',
                      borderBottom: '1px solid var(--app-border)',
                      background: item.isRead ? 'transparent' : 'var(--app-chip-bg)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        flex: 'none',
                        width: '8px',
                        height: '8px',
                        marginTop: '5px',
                        borderRadius: '50%',
                        background: item.isRead ? 'transparent' : accent,
                      }}
                    />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--app-text)' }}>
                        {item.title}
                      </span>
                      <span style={{ display: 'block', fontSize: '12.5px', color: 'var(--app-text-soft)', lineHeight: 1.45, marginTop: '2px' }}>
                        {item.message}
                      </span>
                      <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--app-text-faint)', marginTop: '4px' }}>
                        {timeAgo(item.createdAt)}
                      </span>
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const emptyStyle = {
  padding: '28px 15px',
  textAlign: 'center' as const,
  fontSize: '13px',
  color: 'var(--app-text-soft)',
}
