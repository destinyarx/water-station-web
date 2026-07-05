import { z } from 'zod'

const toneSchema = z.enum(['green', 'amber', 'red', 'brand'])

export const insightCardSchema = z.object({
  label: z.string(),
  value: z.string(),
  trend: z.string(),
  trendTone: toneSchema,
})

export const flagCardSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  badge: z.string(),
  badgeTone: toneSchema,
})

export const rankedItemSchema = z.object({
  rank: z.number().int(),
  name: z.string(),
  value: z.string(),
  pct: z.string(),
})

export const conversationRowSchema = z.object({
  id: z.number(),
  org_id: z.number().int(),
  created_by: z.string(),
  title: z.string(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
})

export const messageRowSchema = z.object({
  id: z.number(),
  conversation_id: z.number(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  display_text: z.string().nullable(),
  card_type: z.enum(['insight', 'flag', 'ranked']).nullable(),
  card_data: z.array(z.unknown()).nullable(),
  created_at: z.string(),
})

/**
 * The mock endpoint's response — same shape the real Gemini-backed edge
 * function will return, so swapping the URL needs no frontend change.
 * `cardData` must be present iff `cardType` is set.
 */
export const assistantReplySchema = z
  .object({
    content: z.string().min(1),
    displayText: z.string().nullish(),
    cardType: z.enum(['insight', 'flag', 'ranked']).nullish(),
    cardData: z.array(z.unknown()).nullish(),
  })
  .superRefine((val, ctx) => {
    const hasType = val.cardType != null
    const hasData = val.cardData != null && val.cardData.length > 0
    if (hasType && !hasData) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cardData is required when cardType is set.', path: ['cardData'] })
    }
    if (!hasType && hasData) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'cardType is required when cardData is present.', path: ['cardType'] })
    }
  })

/** Input for sending a message (free-text composer or a ready-made prompt). */
export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty.').max(4000),
  displayText: z.string().trim().max(200).optional(),
})

/** Request body posted to the assistant endpoint. */
export const assistantRequestSchema = z.object({
  conversationId: z.number().nullable(),
  message: z.string().min(1),
  history: z.array(
    z.object({ role: z.enum(['user', 'assistant']), content: z.string() }),
  ),
})
