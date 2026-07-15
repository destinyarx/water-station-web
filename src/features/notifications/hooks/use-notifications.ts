'use client'

import { useMemo } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

import { notificationKeys } from '../notifications.keys'
import type { Notification } from '../notifications.types'
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notifications.service'

export interface UseNotifications {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: number) => void
  markAllAsRead: () => void
  loading: boolean
}

/**
 * The bell's data + actions. Server state lives in the TanStack Query cache
 * (shared with the realtime subscription, which patches the same key). Marking
 * read is optimistic; realtime echoes the persisted change back.
 */
export function useNotifications(): UseNotifications {
  const client = useClerkSupabase()
  const { userId } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: () => getNotifications(client),
    staleTime: 60_000,
  })

  const unreadQuery = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => getUnreadNotificationCount(client),
    staleTime: 60_000,
  })

  const notifications = useMemo(() => query.data ?? [], [query.data])

  const unreadCount = unreadQuery.data ?? 0

  function setUnreadCount(update: (current: number) => number): void {
    queryClient.setQueryData<number>(
      notificationKeys.unreadCount(),
      (current) => Math.max(0, update(current ?? 0)),
    )
  }

  function patchRead(match: (item: Notification) => boolean): void {
    queryClient.setQueryData<Notification[]>(notificationKeys.lists(), (prev) =>
      (prev ?? []).map((item) =>
        match(item) ? { ...item, isRead: true } : item,
      ),
    )
  }

  const markOne = useMutation<void, Error, number>({
    mutationFn: (id) => markNotificationRead(client, id),
    onMutate: (id) => {
      const wasUnread = (query.data ?? []).some(
        (item) => item.id === id && !item.isRead,
      )
      patchRead((item) => item.id === id)
      if (wasUnread) setUnreadCount((current) => current - 1)
    },
    onError: (error) => {
      toast.error(error.message)
      void query.refetch()
      void unreadQuery.refetch()
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      })
    },
  })

  const markAll = useMutation<void, Error, void>({
    mutationFn: () => {
      if (!userId) {
        throw new Error('Your session is missing. Please sign in again.')
      }
      return markAllNotificationsRead(client, userId)
    },
    onMutate: () => {
      patchRead(() => true)
      queryClient.setQueryData(notificationKeys.unreadCount(), 0)
    },
    onError: (error) => {
      toast.error(error.message)
      void query.refetch()
      void unreadQuery.refetch()
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      })
    },
  })

  return {
    notifications,
    unreadCount,
    markAsRead: (id) => markOne.mutate(id),
    markAllAsRead: () => markAll.mutate(),
    loading: query.isLoading || unreadQuery.isLoading,
  }
}
