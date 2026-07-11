'use client'

import type { ReactNode } from 'react'

import { useNotificationsRealtime } from '../hooks/use-notifications-realtime'

/**
 * Owns the single realtime notifications subscription for authenticated routes.
 * Renders children unchanged — the subscription side effect is its only job, so
 * it stays alive independent of whether the bell UI is mounted.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  useNotificationsRealtime()
  return <>{children}</>
}
