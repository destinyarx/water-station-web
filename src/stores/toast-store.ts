// Module-level toast state shared across the app (no external dep needed).
// Plain functions so toasts can be fired from anywhere — components, hooks,
// mutation callbacks, or plain async functions — not just from inside React.

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  /** Milliseconds before the toast auto-dismisses. Default 4000. */
  duration?: number
  /** Set false to keep the toast open until the user closes it. Default true. */
  autoClose?: boolean
}

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration: number
  autoClose: boolean
}

let toasts: ToastItem[] = []
const listeners = new Set<(toasts: ToastItem[]) => void>()

function emit(): void {
  listeners.forEach((fn) => fn(toasts))
}

function pushToast(type: ToastType, message: string, opts?: ToastOptions): string {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  toasts = [...toasts, { id, type, message, duration: opts?.duration ?? 4000, autoClose: opts?.autoClose ?? true }]
  emit()
  return id
}

export function dismissToast(id: string): void {
  toasts = toasts.filter((item) => item.id !== id)
  emit()
}

export function subscribeToasts(fn: (toasts: ToastItem[]) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getToasts(): ToastItem[] {
  return toasts
}

/** Fire-and-forget toast API usable from any condition, sync or async. */
export const toast = {
  success: (message: string, opts?: ToastOptions) => pushToast('success', message, opts),
  error: (message: string, opts?: ToastOptions) => pushToast('error', message, opts),
  warning: (message: string, opts?: ToastOptions) => pushToast('warning', message, opts),
  info: (message: string, opts?: ToastOptions) => pushToast('info', message, opts),
}
