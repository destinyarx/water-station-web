import { describe, expect, it } from 'vitest'

import { assistantReplyToInsert, toConversation, toMessage } from '../aquaflow-ai.mapper'
import type { MessageRow } from '../aquaflow-ai.types'

const baseRow: MessageRow = {
  id: 1,
  conversation_id: 10,
  role: 'assistant',
  content: 'plain reply',
  display_text: null,
  card_type: null,
  card_data: null,
  created_at: '2026-07-05T00:00:00.000Z',
}

describe('toConversation', () => {
  it('maps snake_case row to the domain model', () => {
    const c = toConversation({
      id: 3,
      org_id: '00000000-0000-4000-8000-000000000007',
      created_by: 'user_1',
      title: 'Sales chat',
      created_at: '2026-07-01T00:00:00.000Z',
      updated_at: null,
    })
    expect(c).toEqual({
      id: 3,
      orgId: '00000000-0000-4000-8000-000000000007',
      createdBy: 'user_1',
      title: 'Sales chat',
      createdAt: '2026-07-01T00:00:00.000Z',
      updatedAt: null,
    })
  })
})

describe('toMessage', () => {
  it('falls back to content when display_text is null, and keeps the override otherwise', () => {
    expect(toMessage(baseRow).displayText).toBeNull()
    expect(toMessage({ ...baseRow, display_text: 'Analyze my sales' }).displayText).toBe('Analyze my sales')
  })

  it('leaves card null for plain-text messages', () => {
    expect(toMessage(baseRow).card).toBeNull()
  })

  it('parses an insight card', () => {
    const m = toMessage({
      ...baseRow,
      card_type: 'insight',
      card_data: [{ label: 'This month', value: '₱71,400', trend: '▲ 8%', trendTone: 'green' }],
    })
    expect(m.card).toEqual({
      type: 'insight',
      items: [{ label: 'This month', value: '₱71,400', trend: '▲ 8%', trendTone: 'green' }],
    })
  })

  it('parses a flag card', () => {
    const m = toMessage({
      ...baseRow,
      card_type: 'flag',
      card_data: [{ title: 'Caps', subtitle: '42 left', badge: 'Low', badgeTone: 'red' }],
    })
    expect(m.card?.type).toBe('flag')
  })

  it('parses a ranked card', () => {
    const m = toMessage({
      ...baseRow,
      card_type: 'ranked',
      card_data: [{ rank: 1, name: 'Electricity', value: '₱8,450', pct: '100%' }],
    })
    expect(m.card?.type).toBe('ranked')
  })
})

describe('assistantReplyToInsert', () => {
  it('builds an assistant insert row with nullable card fields', () => {
    const row = assistantReplyToInsert(10, { content: 'hi' })
    expect(row).toMatchObject({
      conversation_id: 10,
      role: 'assistant',
      content: 'hi',
      display_text: null,
      card_type: null,
      card_data: null,
    })
  })
})
