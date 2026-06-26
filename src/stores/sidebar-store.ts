// Module-level sidebar state — no external dep needed
let isCollapsed = false
const listeners = new Set<(collapsed: boolean) => void>()

export function toggleSidebar(): void {
  isCollapsed = !isCollapsed
  listeners.forEach((fn) => fn(isCollapsed))
}

export function getIsCollapsed(): boolean {
  return isCollapsed
}

export function subscribeSidebar(fn: (collapsed: boolean) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
