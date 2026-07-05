import { flagCardSchema, insightCardSchema, rankedItemSchema } from './aquaflow-ai.schema'
import type {
  AssistantReply,
  Conversation,
  ConversationRow,
  Message,
  MessageCard,
  MessageRow,
} from './aquaflow-ai.types'

export function toConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    orgId: row.org_id,
    createdBy: row.created_by,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Parse a stored card_type + card_data pair into a typed, narrowable card. */
export function toCard(
  cardType: MessageRow['card_type'],
  cardData: MessageRow['card_data'],
): MessageCard | null {
  if (!cardType || cardData == null) return null
  switch (cardType) {
    case 'insight':
      return { type: 'insight', items: cardData.map((d) => insightCardSchema.parse(d)) }
    case 'flag':
      return { type: 'flag', items: cardData.map((d) => flagCardSchema.parse(d)) }
    case 'ranked':
      return { type: 'ranked', items: cardData.map((d) => rankedItemSchema.parse(d)) }
  }
}

export function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    displayText: row.display_text,
    card: toCard(row.card_type, row.card_data),
    createdAt: row.created_at,
  }
}

/** Build the row for inserting an assistant message from an endpoint reply. */
export function assistantReplyToInsert(
  conversationId: number,
  reply: AssistantReply,
): {
  conversation_id: number
  role: 'assistant'
  content: string
  display_text: string | null
  card_type: AssistantReply['cardType']
  card_data: AssistantReply['cardData']
} {
  return {
    conversation_id: conversationId,
    role: 'assistant',
    content: reply.content,
    display_text: reply.displayText ?? null,
    card_type: reply.cardType ?? null,
    card_data: reply.cardData ?? null,
  }
}
