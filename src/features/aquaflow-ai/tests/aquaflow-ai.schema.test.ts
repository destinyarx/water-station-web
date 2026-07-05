import { describe, expect, it } from 'vitest'

import { assistantReplySchema, sendMessageSchema } from '../aquaflow-ai.schema'

describe('sendMessageSchema', () => {
  it('accepts a trimmed non-empty message', () => {
    const parsed = sendMessageSchema.parse({ content: '  How is revenue?  ' })
    expect(parsed.content).toBe('How is revenue?')
  })

  it('accepts an optional display text (ready-made prompt title)', () => {
    const parsed = sendMessageSchema.parse({ content: 'long prompt body', displayText: 'Analyze my sales' })
    expect(parsed.displayText).toBe('Analyze my sales')
  })

  it('rejects an empty message', () => {
    expect(sendMessageSchema.safeParse({ content: '   ' }).success).toBe(false)
  })
})

describe('assistantReplySchema', () => {
  it('accepts plain text with no card', () => {
    expect(assistantReplySchema.safeParse({ content: 'Hello' }).success).toBe(true)
  })

  it('accepts a card type paired with card data', () => {
    const result = assistantReplySchema.safeParse({
      content: 'Revenue up',
      cardType: 'insight',
      cardData: [{ label: 'This month', value: '₱71,400', trend: '▲ 8%', trendTone: 'green' }],
    })
    expect(result.success).toBe(true)
  })

  it('rejects a card type with no card data', () => {
    const result = assistantReplySchema.safeParse({ content: 'x', cardType: 'flag' })
    expect(result.success).toBe(false)
  })

  it('rejects card data with no card type', () => {
    const result = assistantReplySchema.safeParse({ content: 'x', cardData: [{ any: 1 }] })
    expect(result.success).toBe(false)
  })

  it('rejects an empty content string', () => {
    expect(assistantReplySchema.safeParse({ content: '' }).success).toBe(false)
  })
})
