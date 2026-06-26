// Module-level theme state shared across the app (no external dep needed)
let isDark = false
const listeners = new Set<(dark: boolean) => void>()

function applyTheme(dark: boolean): void {
  if (typeof document === 'undefined') return
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function initTheme(): void {
  if (typeof localStorage === 'undefined') return
  let saved: string | null = null
  try {
    saved = localStorage.getItem('aqua-theme')
  } catch {}
  const dark = saved === 'dark'
  isDark = dark
  applyTheme(dark)
  listeners.forEach((fn) => fn(dark))
}

export function toggleTheme(): void {
  isDark = !isDark
  try {
    localStorage.setItem('aqua-theme', isDark ? 'dark' : 'light')
  } catch {}
  applyTheme(isDark)
  listeners.forEach((fn) => fn(isDark))
}

export function getIsDark(): boolean {
  return isDark
}

export function subscribeTheme(fn: (dark: boolean) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
