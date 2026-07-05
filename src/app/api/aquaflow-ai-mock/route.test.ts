import { describe, expect, it } from 'vitest'

import { craftReply } from './route'
import { assistantReplySchema } from '@/features/aquaflow-ai/aquaflow-ai.schema'

describe('craftReply', () => {
  it('returns an insight card for revenue/sales questions', () => {
    const reply = craftReply("How's revenue trending?")
    expect(reply.cardType).toBe('insight')
    expect(reply.cardData?.length).toBeGreaterThan(0)
  })

  it('returns a flag card for stock questions', () => {
    expect(craftReply('what is low on stock?').cardType).toBe('flag')
  })

  it('returns an insight card for deliveries', () => {
    expect(craftReply('deliveries today').cardType).toBe('insight')
  })

  it('returns a flag card for maintenance', () => {
    expect(craftReply('equipment maintenance status').cardType).toBe('flag')
  })

  it('returns a ranked card for expenses', () => {
    expect(craftReply('biggest expenses this month').cardType).toBe('ranked')
  })

  it('returns a flag card for customers', () => {
    expect(craftReply('which customers went quiet').cardType).toBe('flag')
  })

  it('falls back to plain text for unmatched input', () => {
    const reply = craftReply('hello there')
    expect(reply.cardType).toBeUndefined()
    expect(reply.cardData).toBeUndefined()
    expect(reply.content.length).toBeGreaterThan(0)
  })

  it('always returns a payload that satisfies the shared reply contract', () => {
    for (const q of ['revenue', 'stock', 'deliver', 'maintenance', 'expense', 'customer', 'anything else']) {
      expect(assistantReplySchema.safeParse(craftReply(q)).success).toBe(true)
    }
  })
})
