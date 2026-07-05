'use client'

import { useEffect, useRef } from 'react'

import { READY_MADE_PROMPTS } from '../aquaflow-ai.constants'
import type { Message, ReadyMadePrompt } from '../aquaflow-ai.types'
import { MessageBubble, TypingIndicator } from './message-bubble'
import { PromptCard } from './prompt-card'

function EmptyState({
  disabled,
  onSelectPrompt,
}: {
  disabled: boolean
  onSelectPrompt: (prompt: ReadyMadePrompt) => void
}) {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-10">
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-[16px] flex items-center justify-center text-white mb-4" style={{ background: 'linear-gradient(150deg,#5cc6f7,#0a6cc4)', boxShadow: '0 10px 22px rgba(14,108,196,0.3)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24">
            <path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" fill="#fff" />
          </svg>
        </div>
        <h2 className="text-[22px] font-bold text-[var(--app-text)]">How can I help with your station?</h2>
        <p className="text-[14px] text-[var(--app-text-soft)] mt-1.5 max-w-[440px]">
          Ask about sales, inventory, deliveries, maintenance, or expenses — or start with one of these.
        </p>
      </div>

      <div className="grid gap-2.5 mt-7" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {READY_MADE_PROMPTS.map((p) => (
          <PromptCard key={p.key} prompt={p} disabled={disabled} onSelect={onSelectPrompt} />
        ))}
      </div>
    </div>
  )
}

export function MessageList({
  messages,
  isLoading,
  isTyping,
  disabled,
  onSelectPrompt,
}: {
  messages: Message[]
  isLoading: boolean
  isTyping: boolean
  disabled: boolean
  onSelectPrompt: (prompt: ReadyMadePrompt) => void
}) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isTyping])

  const showEmpty = !isLoading && messages.length === 0 && !isTyping

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--app-page-bg)]">
      {isLoading && (
        <div className="mx-auto max-w-[760px] px-4 py-8 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-[16px] bg-[var(--app-border)] animate-pulse" />
          ))}
        </div>
      )}

      {showEmpty && <EmptyState disabled={disabled} onSelectPrompt={onSelectPrompt} />}

      {!isLoading && (messages.length > 0 || isTyping) && (
        <div className="mx-auto max-w-[760px] px-4 py-6 flex flex-col gap-4">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      )}

      <div ref={endRef} />
    </div>
  )
}
