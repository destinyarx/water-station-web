'use client'

import { useState } from 'react'

export function MessageComposer({
  disabled,
  onSend,
}: {
  disabled: boolean
  onSend: (text: string) => void
}) {
  const [text, setText] = useState('')

  function submit() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  return (
    <div className="border-t border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3">
      <div className="mx-auto max-w-[760px] flex items-end gap-2.5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          rows={1}
          placeholder="Ask about sales, stock, deliveries, maintenance, or expenses…"
          className="flex-1 resize-none max-h-40 rounded-[14px] border border-[var(--app-border-strong)] bg-[var(--app-surface-2)] px-4 py-3 text-[14px] text-[var(--app-text)] outline-none focus:border-[var(--app-brand-soft)] placeholder:text-[var(--app-text-faint)]"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || text.trim().length === 0}
          aria-label="Send message"
          className="flex-none w-11 h-11 rounded-[13px] flex items-center justify-center text-white transition-opacity disabled:opacity-45 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)' }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
