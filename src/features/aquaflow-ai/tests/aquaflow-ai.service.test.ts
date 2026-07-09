import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import { AI_CONTEXT_MESSAGE_LIMIT } from '../aquaflow-ai.constants'
import {
  createConversation,
  deleteConversation,
  getConversations,
  getRecentMessages,
  requestAssistantReply,
} from '../services/aquaflow-ai.service'

interface QueryResult {
  data?: unknown
  error: { message: string } | null
}

const owner = { orgId: '00000000-0000-4000-8000-000000000007', createdBy: 'user_1' }

const conversationRow = {
  id: 3,
  org_id: '00000000-0000-4000-8000-000000000007',
  created_by: 'user_1',
  title: 'Sales chat',
  created_at: '2026-07-01T00:00:00.000Z',
  updated_at: null,
}

function messageRow(id: number, createdAt: string) {
  return {
    id,
    conversation_id: 3,
    role: 'user' as const,
    content: `msg ${id}`,
    display_text: null,
    card_type: null,
    card_data: null,
    created_at: createdAt,
  }
}

function createListClient(result: QueryResult) {
  const order2 = vi.fn(() => Promise.resolve(result))
  const order1 = vi.fn(() => ({ order: order2 }))
  const select = vi.fn(() => ({ order: order1 }))
  const from = vi.fn(() => ({ select }))
  return { client: { from } as unknown as SupabaseClient, order1 }
}

function createRecentClient(result: QueryResult) {
  const limit = vi.fn(() => Promise.resolve(result))
  const order = vi.fn(() => ({ limit }))
  const eq = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select }))
  return { client: { from } as unknown as SupabaseClient, eq, order, limit }
}

function createInsertClient(result: QueryResult) {
  const single = vi.fn(() => Promise.resolve(result))
  const select = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select }))
  const from = vi.fn(() => ({ insert }))
  return { client: { from } as unknown as SupabaseClient, insert }
}

function createDeleteClient(result: Pick<QueryResult, 'error'>) {
  const eq = vi.fn(() => Promise.resolve(result))
  const del = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ delete: del }))
  return { client: { from } as unknown as SupabaseClient, del, eq }
}

describe('getConversations', () => {
  it('maps rows and orders by most-recent activity', async () => {
    const { client, order1 } = createListClient({ data: [conversationRow], error: null })

    const list = await getConversations(client)

    expect(order1).toHaveBeenCalledWith('updated_at', { ascending: false, nullsFirst: false })
    expect(list[0]).toMatchObject({ id: 3, orgId: '00000000-0000-4000-8000-000000000007', createdBy: 'user_1', title: 'Sales chat' })
  })

  it('throws a friendly error when the query fails', async () => {
    const { client } = createListClient({ data: null, error: { message: 'denied' } })
    await expect(getConversations(client)).rejects.toThrow('Unable to load conversations. Please try again.')
  })
})

describe('getRecentMessages', () => {
  it('scopes to the conversation, applies the recent-N limit, and returns oldest-first', async () => {
    const rows = [messageRow(2, '2026-07-02'), messageRow(1, '2026-07-01')] // desc from DB
    const { client, eq, limit } = createRecentClient({ data: rows, error: null })

    const messages = await getRecentMessages(client, 3, AI_CONTEXT_MESSAGE_LIMIT)

    expect(eq).toHaveBeenCalledWith('conversation_id', 3)
    expect(limit).toHaveBeenCalledWith(AI_CONTEXT_MESSAGE_LIMIT)
    expect(messages.map((m) => m.id)).toEqual([1, 2]) // reversed to oldest-first
  })
})

describe('createConversation', () => {
  it('writes org_id/created_by from the trusted owner, not from the title argument', async () => {
    const { client, insert } = createInsertClient({ data: conversationRow, error: null })

    await createConversation(client, owner, 'Analyze my sales')

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ org_id: '00000000-0000-4000-8000-000000000007', created_by: 'user_1', title: 'Analyze my sales' }),
    )
  })

  it('surfaces a friendly error when the insert fails', async () => {
    const { client } = createInsertClient({ data: null, error: { message: 'denied' } })
    await expect(createConversation(client, owner, 'x')).rejects.toThrow('Unable to start a conversation. Please try again.')
  })
})

describe('deleteConversation', () => {
  it('hard-deletes by id', async () => {
    const { client, del, eq } = createDeleteClient({ error: null })
    await deleteConversation(client, 3)
    expect(del).toHaveBeenCalled()
    expect(eq).toHaveBeenCalledWith('id', 3)
  })
})

describe('requestAssistantReply', () => {
  afterEach(() => vi.restoreAllMocks())

  it('posts to the endpoint and returns the validated reply', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ content: 'Revenue up', cardType: 'insight', cardData: [{ label: 'M', value: '₱1', trend: '▲', trendTone: 'green' }] }),
        }),
      ),
    )

    const reply = await requestAssistantReply({ conversationId: 3, message: 'revenue?', history: [] })

    expect(reply.content).toBe('Revenue up')
    expect(reply.cardType).toBe('insight')
  })

  it('throws a friendly error on a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) })))
    await expect(requestAssistantReply({ conversationId: null, message: 'x', history: [] })).rejects.toThrow(
      'The assistant is unavailable right now. Please try again.',
    )
  })

  it('throws when the reply violates the contract', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ cardType: 'flag' }) })))
    await expect(requestAssistantReply({ conversationId: null, message: 'x', history: [] })).rejects.toThrow(
      'The assistant is unavailable right now. Please try again.',
    )
  })
})
