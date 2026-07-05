import type { z } from 'zod'

import type {
  assistantReplySchema,
  conversationRowSchema,
  flagCardSchema,
  insightCardSchema,
  messageRowSchema,
  rankedItemSchema,
  sendMessageSchema,
} from './aquaflow-ai.schema'

export type MessageRole = 'user' | 'assistant'
export type CardType = 'insight' | 'flag' | 'ranked'
export type Tone = 'green' | 'amber' | 'red' | 'brand'

export type InsightCard = z.infer<typeof insightCardSchema>
export type FlagCard = z.infer<typeof flagCardSchema>
export type RankedItem = z.infer<typeof rankedItemSchema>

/** Discriminated union so renderers narrow by `type` without casts. */
export type MessageCard =
  | { type: 'insight'; items: InsightCard[] }
  | { type: 'flag'; items: FlagCard[] }
  | { type: 'ranked'; items: RankedItem[] }

export type ConversationRow = z.infer<typeof conversationRowSchema>
export type MessageRow = z.infer<typeof messageRowSchema>
export type AssistantReply = z.infer<typeof assistantReplySchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>

export interface Conversation {
  id: number
  orgId: number
  createdBy: string
  title: string
  createdAt: string
  updatedAt: string | null
}

export interface Message {
  id: number
  conversationId: number
  role: MessageRole
  content: string
  displayText: string | null
  card: MessageCard | null
  createdAt: string
}

/** Owner identity resolved from the Clerk session, never from client input. */
export interface AiOwner {
  orgId: number
  createdBy: string
}

/** A pre-written, business-tailored question: short title, long LLM prompt body. */
export interface ReadyMadePrompt {
  key: string
  title: string
  prompt: string
  tone: Tone
}
