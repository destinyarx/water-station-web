import { cn } from '@/lib/utils'

interface SpinnerProps {
  /** Diameter in pixels. Defaults to 16. */
  size?: number
  /** Extra classes (e.g. text color for `currentColor` the ring inherits). */
  className?: string
}

/**
 * Water-themed loading spinner: a rotating ring that fades like a droplet
 * trail. Inherits `currentColor`, so it matches whatever text color it sits in
 * (white on gradient buttons, brand blue on surfaces) and works in both themes.
 */
export function Spinner({ size = 16, className }: SpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
      className={cn('animate-spin', className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.6" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
