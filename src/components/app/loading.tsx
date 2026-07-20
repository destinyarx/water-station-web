import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

/** Ocean-sheen shimmer shared by skeleton blocks (light + dark aware). */
const shimmerStyle: CSSProperties = {
  background:
    'linear-gradient(100deg, var(--app-surface-2) 30%, var(--app-chip-bg) 50%, var(--app-surface-2) 70%)',
  backgroundSize: '220% 100%',
  animation: 'aqua-shimmer 1.6s ease-in-out infinite',
}

interface AquaSkeletonProps {
  className?: string
  style?: CSSProperties
}

/** A single shimmering placeholder block. Size it with `className`/`style`. */
export function AquaSkeleton({ className, style }: AquaSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('rounded-lg', className)}
      style={{ ...shimmerStyle, ...style }}
    />
  )
}

/**
 * Thin indeterminate progress rail — an ocean-blue segment gliding across the
 * top of a datatable while it refetches or a row action is processing.
 */
export function AquaProgressBar({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('relative h-0.5 w-full overflow-hidden bg-(--app-border)', className)}
    >
      <div
        className="absolute inset-y-0 w-1/4 rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--app-brand), transparent)',
          animation: 'aqua-progress 1.1s ease-in-out infinite',
        }}
      />
    </div>
  )
}
