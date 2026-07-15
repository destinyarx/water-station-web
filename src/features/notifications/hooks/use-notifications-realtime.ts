'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useQueryClient } from '@tanstack/react-query'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

import { NOTIFICATIONS_TABLE } from '../notifications.constants'
import { notificationKeys } from '../notifications.keys'
import { toNotification } from '../notifications.mapper'
import { notificationRowSchema } from '../notifications.schema'
import type { Notification } from '../notifications.types'

/**
 * The single realtime subscription. Mounted once (via NotificationsProvider) for
 * all authenticated routes; patches the shared TanStack Query cache so the bell
 * updates without a refetch.
 *
 * ponytail: the Clerk token reaches Realtime through the Supabase client's
 * `accessToken` option (supabase-js 2.108 refreshes it on the heartbeat), so no
 * manual `realtime.setAuth` is needed. RLS on `notifications` is the real
 * boundary; the `recipient_id=eq` filter is a bandwidth optimisation. If events
 * ever stop arriving after a token expires, add a periodic setAuth. See spec §5.
 */
export function useNotificationsRealtime(): void {
  const client = useClerkSupabase()
  const { userId } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return

    function apply(
      payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
      mode: 'insert' | 'update',
    ): void {
      const parsed = notificationRowSchema.safeParse(payload.new)
      if (!parsed.success) return
      const incoming = toNotification(parsed.data)

      queryClient.setQueryData<Notification[]>(
        notificationKeys.lists(),
        (prev) => {
          const list = prev ?? []
          if (mode === 'update') {
            return list.map((item) => (item.id === incoming.id ? incoming : item))
          }
          const withoutDupe = list.filter((item) => item.id !== incoming.id)
          return [incoming, ...withoutDupe]
        },
      )

      void queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      })

      if (mode === 'insert') toast.info(incoming.title)
    }

    const filter = `recipient_id=eq.${userId}`
    const channel = client
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: NOTIFICATIONS_TABLE, filter },
        (payload) => apply(payload, 'insert'),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: NOTIFICATIONS_TABLE, filter },
        (payload) => apply(payload, 'update'),
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [client, userId, queryClient])
}
