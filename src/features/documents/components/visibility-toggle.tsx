'use client'

import { cn } from '@/lib/utils'

type Visibility = 'all' | 'only_me'

interface VisibilityToggleProps {
  value: Visibility
  onChange: (value: Visibility) => void
}

/** Two-option visibility switch. `all` keeps the blue brand accent; `only_me`
 * uses a warning-orange accent to signal the record is hidden from other staff. */
export function VisibilityToggle({ value, onChange }: VisibilityToggleProps) {
  return (
    <div className="flex gap-2.5">
      {(['all', 'only_me'] as const).map((v) => {
        const isSelected = value === v
        const isWarn = v === 'only_me'
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              'flex-1 flex items-center gap-2.5 px-3.5 py-3 rounded-[11px] border-2 text-left transition-colors',
              isSelected
                ? isWarn
                  ? 'border-[var(--warning)] bg-[var(--app-chip-amber-bg)]'
                  : 'border-[var(--app-brand)] bg-[var(--app-chip-bg)]'
                : 'border-[var(--app-border)] bg-[var(--app-surface)]',
            )}
          >
            <div
              className={cn(
                'flex-none w-8 h-8 rounded-[9px] flex items-center justify-center',
                isSelected
                  ? isWarn
                    ? 'bg-[var(--warning)] text-white'
                    : 'bg-[var(--app-brand)] text-white'
                  : 'bg-[var(--app-surface-2)] text-[var(--app-text-soft)]',
              )}
            >
              {v === 'all' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="8" r="3" />
                  <path d="M3.5 19c0-3 2.4-4.8 5.5-4.8s5.5 1.8 5.5 4.8" />
                  <path d="M15.5 5a3 3 0 0 1 0 5.6M17.2 19c0-2.1-.7-3.5-1.9-4.4" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              )}
            </div>
            <div>
              <p
                className={cn(
                  'text-[13.5px] font-semibold leading-tight',
                  isSelected
                    ? isWarn
                      ? 'text-[var(--warning)]'
                      : 'text-[var(--app-brand)]'
                    : 'text-[var(--app-text)]',
                )}
              >
                {v === 'all' ? 'All staff' : 'Just me'}
              </p>
              <p className="text-[11.5px] text-[var(--app-text-soft)] mt-0.5">
                {v === 'all' ? 'Everyone in this workspace can view' : 'Hidden from other staff members'}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
