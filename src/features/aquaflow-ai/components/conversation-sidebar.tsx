'use client'

import { cn } from '@/lib/utils'
import { READY_MADE_PROMPTS } from '../aquaflow-ai.constants'
import type { Conversation, ReadyMadePrompt, Tone } from '../aquaflow-ai.types'

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

function relativeTime(iso: string | null): string {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  const mins = Math.round((Date.now() - then) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

export function ConversationSidebar({
  conversations,
  isLoading,
  selectedId,
  onSelect,
  onNewChat,
  onDelete,
  onSelectPrompt,
  promptsDisabled,
}: {
  conversations: Conversation[]
  isLoading: boolean
  selectedId: number | null
  onSelect: (id: number) => void
  onNewChat: () => void
  onDelete: (conversation: Conversation) => void
  onSelectPrompt: (prompt: ReadyMadePrompt) => void
  promptsDisabled: boolean
}) {
  return (
    <div className="flex-none w-[264px] border-r border-[var(--app-border)] bg-[var(--app-surface)] flex flex-col h-full">
      <div className="p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 rounded-[12px] px-4 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-95"
          style={{ background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', boxShadow: '0 8px 18px rgba(14,108,196,0.28)' }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New chat
        </button>
      </div>

      <div className="px-4 pt-1 pb-2 text-[10.5px] font-bold tracking-[0.12em] uppercase text-[var(--app-text-faint)]">
        Conversations
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3 flex flex-col gap-0.5">
        {isLoading && (
          <div className="px-2 flex flex-col gap-2 mt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-11 rounded-[11px] bg-[var(--app-border)] animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && conversations.length === 0 && (
          <p className="px-3 py-4 text-[13px] text-[var(--app-text-soft)]">
            No conversations yet. Start a new chat to ask about your business.
          </p>
        )}

        {!isLoading &&
          conversations.map((c) => {
            const active = c.id === selectedId
            return (
              <div
                key={c.id}
                className={cn(
                  'group flex items-center gap-2 rounded-[11px] px-3 py-2 cursor-pointer transition-colors',
                  active ? 'bg-[var(--app-sidebar-active-bg)]' : 'hover:bg-[var(--app-surface-2)]',
                )}
                onClick={() => onSelect(c.id)}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-[13.5px] font-semibold truncate',
                      active ? 'text-[var(--app-sidebar-active-text)]' : 'text-[var(--app-text)]',
                    )}
                  >
                    {c.title}
                  </p>
                  <p className="text-[11px] text-[var(--app-text-faint)]">{relativeTime(c.updatedAt ?? c.createdAt)}</p>
                </div>
                <button
                  type="button"
                  aria-label="Delete conversation"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(c)
                  }}
                  className="flex-none opacity-0 group-hover:opacity-100 transition-opacity text-[var(--app-text-faint)] hover:text-[var(--app-chip-red-text)]"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            )
          })}
      </div>

      <div className="flex-none border-t border-[var(--app-border)] px-2 pt-3 pb-3">
        <div className="px-3 pb-2 text-[10.5px] font-bold tracking-[0.12em] uppercase text-[var(--app-text-faint)]">
          Try asking
        </div>
        <div className="flex flex-col gap-0.5">
          {READY_MADE_PROMPTS.map((p) => (
            <button
              key={p.key}
              type="button"
              disabled={promptsDisabled}
              onClick={() => onSelectPrompt(p)}
              title={p.prompt}
              className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-left transition-colors enabled:hover:bg-[var(--app-surface-2)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span
                className="flex-none w-[26px] h-[26px] rounded-[8px] flex items-center justify-center"
                style={{ background: TONE_BG[p.tone], color: TONE_TEXT[p.tone] }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 17l5-5 4 4 8-9" />
                  <path d="M15 7h5v5" />
                </svg>
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--app-text)]">{p.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
