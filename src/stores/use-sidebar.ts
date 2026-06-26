'use client'

import { useSyncExternalStore } from 'react'
import { getIsCollapsed, subscribeSidebar } from './sidebar-store'

export function useIsCollapsed(): boolean {
  return useSyncExternalStore(subscribeSidebar, getIsCollapsed, () => false)
}
