/** Array query-key factory for the notifications feature. */
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  counts: () => [...notificationKeys.all, 'count'] as const,
  unreadCount: () => [...notificationKeys.counts(), 'unread'] as const,
}
