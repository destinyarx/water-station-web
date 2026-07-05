import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  AI_CONVERSATION_COLUMNS,
  AI_CONVERSATION_DELETE_ERROR,
  AI_CONVERSATION_SAVE_ERROR,
  AI_CONVERSATIONS_LOAD_ERROR,
  AI_CONVERSATIONS_TABLE,
  AI_ENDPOINT_URL,
  AI_MESSAGE_COLUMNS,
  AI_MESSAGE_SAVE_ERROR,
  AI_MESSAGES_LOAD_ERROR,
  AI_MESSAGES_TABLE,
  AI_REPLY_ERROR,
  DEFAULT_CONVERSATION_TITLE,
} from '../aquaflow-ai.constants'
import { assistantReplyToInsert, toConversation, toMessage } from '../aquaflow-ai.mapper'
import {
  assistantReplySchema,
  conversationRowSchema,
  messageRowSchema,
} from '../aquaflow-ai.schema'
import type {
  AiOwner,
  AssistantReply,
  Conversation,
  Message,
} from '../aquaflow-ai.types'

const conversationRowsSchema = z.array(conversationRowSchema)
const messageRowsSchema = z.array(messageRowSchema)

export async function getConversations(client: SupabaseClient): Promise<Conversation[]> {
  const { data, error } = await client
    .from(AI_CONVERSATIONS_TABLE)
    .select(AI_CONVERSATION_COLUMNS)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(AI_CONVERSATIONS_LOAD_ERROR)

  return conversationRowsSchema.parse(data ?? []).map(toConversation)
}

export async function getMessages(
  client: SupabaseClient,
  conversationId: number,
): Promise<Message[]> {
  const { data, error } = await client
    .from(AI_MESSAGES_TABLE)
    .select(AI_MESSAGE_COLUMNS)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(AI_MESSAGES_LOAD_ERROR)

  return messageRowsSchema.parse(data ?? []).map(toMessage)
}

/**
 * The most recent `limit` messages, oldest-first — the bounded context sent to
 * the assistant so requests don't balloon. Full history stays in getMessages.
 */
export async function getRecentMessages(
  client: SupabaseClient,
  conversationId: number,
  limit: number,
): Promise<Message[]> {
  const { data, error } = await client
    .from(AI_MESSAGES_TABLE)
    .select(AI_MESSAGE_COLUMNS)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(AI_MESSAGES_LOAD_ERROR)

  return messageRowsSchema.parse(data ?? []).map(toMessage).reverse()
}

export async function createConversation(
  client: SupabaseClient,
  owner: AiOwner,
  title: string,
): Promise<Conversation> {
  const { data, error } = await client
    .from(AI_CONVERSATIONS_TABLE)
    .insert({
      org_id: owner.orgId,
      created_by: owner.createdBy,
      title: title.trim().slice(0, 200) || DEFAULT_CONVERSATION_TITLE,
    })
    .select(AI_CONVERSATION_COLUMNS)
    .single()

  if (error) throw new Error(AI_CONVERSATION_SAVE_ERROR)

  return toConversation(conversationRowSchema.parse(data))
}

export async function touchConversation(
  client: SupabaseClient,
  conversationId: number,
): Promise<void> {
  const { error } = await client
    .from(AI_CONVERSATIONS_TABLE)
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  if (error) throw new Error(AI_CONVERSATION_SAVE_ERROR)
}

export async function insertUserMessage(
  client: SupabaseClient,
  conversationId: number,
  content: string,
  displayText: string | null,
): Promise<Message> {
  const { data, error } = await client
    .from(AI_MESSAGES_TABLE)
    .insert({
      conversation_id: conversationId,
      role: 'user',
      content,
      display_text: displayText,
    })
    .select(AI_MESSAGE_COLUMNS)
    .single()

  if (error) throw new Error(AI_MESSAGE_SAVE_ERROR)

  return toMessage(messageRowSchema.parse(data))
}

export async function insertAssistantMessage(
  client: SupabaseClient,
  conversationId: number,
  reply: AssistantReply,
): Promise<Message> {
  const { data, error } = await client
    .from(AI_MESSAGES_TABLE)
    .insert(assistantReplyToInsert(conversationId, reply))
    .select(AI_MESSAGE_COLUMNS)
    .single()

  if (error) throw new Error(AI_MESSAGE_SAVE_ERROR)

  return toMessage(messageRowSchema.parse(data))
}

export async function deleteConversation(
  client: SupabaseClient,
  conversationId: number,
): Promise<void> {
  const { error } = await client
    .from(AI_CONVERSATIONS_TABLE)
    .delete()
    .eq('id', conversationId)

  if (error) throw new Error(AI_CONVERSATION_DELETE_ERROR)
}

/**
 * Post to the assistant endpoint (mock today, real edge function later) and
 * validate the reply against the shared contract. Same request/response shape
 * either way, so swapping the URL needs no change here.
 */
export async function requestAssistantReply(input: {
  conversationId: number | null
  message: string
  history: { role: 'user' | 'assistant'; content: string }[]
}): Promise<AssistantReply> {
  let json: unknown
  try {
    const res = await fetch(AI_ENDPOINT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error(AI_REPLY_ERROR)
    json = await res.json()
  } catch {
    throw new Error(AI_REPLY_ERROR)
  }

  const parsed = assistantReplySchema.safeParse(json)
  if (!parsed.success) throw new Error(AI_REPLY_ERROR)
  return parsed.data
}
