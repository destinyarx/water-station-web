'use client'

import type { ReadyMadePrompt, Tone } from '../aquaflow-ai.types'

const TONE_BG: Record<Tone, string> = {
  green: 'var(--app-chip-green-bg)',
  amber: 'var(--app-chip-amber-bg)',
  red: 'var(--app-chip-red-bg)',
  brand: 'var(--app-chip-bg)',
}

const TONE_TEXT: Record<Tone, string> = {
  green: 'var(--app-chip-green-text)',
  amber: 'var(--app-chip-amber-text)',
  red: 'var(--app-chip-red-text)',
  brand: 'var(--app-brand)',
}

export function PromptCard({
  prompt,
  disabled,
  onSelect,
}: {
  prompt: ReadyMadePrompt
  disabled: boolean
  onSelect: (prompt: ReadyMadePrompt) => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(prompt)}
      className="flex items-center gap-3 rounded-[14px] border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 py-3 text-left transition-colors enabled:hover:border-[var(--app-brand-soft)] enabled:hover:bg-[var(--app-chip-bg)] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <span
        className="flex-none w-9 h-9 rounded-[10px] flex items-center justify-center"
        style={{ background: TONE_BG[prompt.tone], color: TONE_TEXT[prompt.tone] }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17l5-5 4 4 8-9" />
          <path d="M15 7h5v5" />
        </svg>
      </span>
      <span className="text-[14px] font-semibold text-[var(--app-text)]">{prompt.title}</span>
    </button>
  )
}
