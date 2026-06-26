'use client'

import { useSyncExternalStore } from 'react'
import { getIsDark, subscribeTheme } from './theme-store'

export function useTheme(): boolean {
  return useSyncExternalStore(subscribeTheme, getIsDark, () => false)
}
