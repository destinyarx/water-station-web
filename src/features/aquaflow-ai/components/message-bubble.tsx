'use client'

import type { FlagCard, InsightCard, Message, RankedItem, Tone } from '../aquaflow-ai.types'

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

function InsightCards({ items }: { items: InsightCard[] }) {
  return (
    <div className="grid gap-2.5 mt-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
      {items.map((it, i) => (
        <div
          key={i}
          className="rounded-[13px] border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 py-3"
        >
          <p className="text-[10.5px] font-bold tracking-[0.06em] uppercase text-[var(--app-text-faint)]">
            {it.label}
          </p>
          <p className="text-[20px] font-extrabold tracking-[-0.02em] text-[var(--app-text)] mt-1 leading-none">
            {it.value}
          </p>
          <p className="text-[12px] font-semibold mt-1.5" style={{ color: TONE_TEXT[it.trendTone] }}>
            {it.trend}
          </p>
        </div>
      ))}
    </div>
  )
}

function FlagCards({ items }: { items: FlagCard[] }) {
  return (
    <div className="flex flex-col gap-2 mt-3">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-[13px] border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-[var(--app-text)] truncate">{it.title}</p>
            <p className="text-[12px] text-[var(--app-text-soft)] truncate">{it.subtitle}</p>
          </div>
          <span
            className="flex-none inline-flex items-center px-2.5 py-1 rounded-[7px] text-[11.5px] font-semibold"
            style={{ background: TONE_BG[it.badgeTone], color: TONE_TEXT[it.badgeTone] }}
          >
            {it.badge}
          </span>
        </div>
      ))}
    </div>
  )
}

function RankedList({ items }: { items: RankedItem[] }) {
  return (
    <div className="flex flex-col gap-2 mt-3">
      {items.map((it) => (
        <div key={it.rank} className="flex items-center gap-3">
          <span className="flex-none w-6 h-6 rounded-[8px] bg-[var(--app-chip-bg)] text-[var(--app-brand)] text-[12px] font-bold flex items-center justify-center">
            {it.rank}
          </span>
          <span className="flex-none w-28 text-[13px] font-semibold text-[var(--app-text)] truncate">{it.name}</span>
          <div className="flex-1 h-[6px] rounded-full bg-[var(--app-border)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--app-brand)]" style={{ width: it.pct }} />
          </div>
          <span className="flex-none text-[13px] font-semibold text-[var(--app-text)] tabular-nums">{it.value}</span>
        </div>
      ))}
    </div>
  )
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const text = message.displayText ?? message.content

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[78%] rounded-[16px] rounded-br-[4px] px-4 py-2.5 text-[14px] leading-[1.5] text-white"
          style={{ background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)' }}
        >
          {text}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2.5">
      <div className="flex-none w-8 h-8 rounded-[10px] flex items-center justify-center text-white" style={{ background: 'linear-gradient(150deg,#5cc6f7,#0a6cc4)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" fill="#fff" />
        </svg>
      </div>
      <div className="max-w-[82%] rounded-[16px] rounded-tl-[4px] border border-[var(--app-border)] bg-[var(--app-surface-2)] px-4 py-3">
        <p className="text-[14px] leading-[1.55] text-[var(--app-text)] whitespace-pre-wrap">{message.content}</p>
        {message.card?.type === 'insight' && <InsightCards items={message.card.items} />}
        {message.card?.type === 'flag' && <FlagCards items={message.card.items} />}
        {message.card?.type === 'ranked' && <RankedList items={message.card.items} />}
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="flex-none w-8 h-8 rounded-[10px] flex items-center justify-center text-white" style={{ background: 'linear-gradient(150deg,#5cc6f7,#0a6cc4)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" fill="#fff" />
        </svg>
      </div>
      <div className="rounded-[16px] rounded-tl-[4px] border border-[var(--app-border)] bg-[var(--app-surface-2)] px-4 py-3.5">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-[var(--app-text-faint)] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
