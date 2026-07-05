'use client'

import { useState } from 'react'

/**
 * Holds form values pending a confirm dialog between the form's Save click and
 * the actual mutation. `request` stashes the submitted values (opening the
 * confirm), `reset` clears them (closing it). Shared by every create/update
 * wrapper that confirms before saving.
 */
export function useSubmitConfirm<T>() {
  const [pending, setPending] = useState<T | null>(null)

  return {
    pending,
    isOpen: pending !== null,
    request: (values: T) => setPending(values),
    reset: () => setPending(null),
  }
}
