'use client'

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'

import { AI_CONTEXT_MESSAGE_LIMIT } from '../aquaflow-ai.constants'
import { aiKeys } from '../aquaflow-ai.keys'
import { sendMessageSchema } from '../aquaflow-ai.schema'
import type { AiOwner, SendMessageInput } from '../aquaflow-ai.types'
import {
  createConversation,
  getRecentMessages,
  insertAssistantMessage,
  insertUserMessage,
  requestAssistantReply,
  touchConversation,
} from '../services/aquaflow-ai.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

export interface SendMessageVars extends SendMessageInput {
  /** Existing conversation, or null to lazily create one on first message. */
  conversationId: number | null
}

export interface SendMessageResult {
  conversationId: number
}

/**
 * Full send pipeline: (create conversation if new) → insert user message →
 * build bounded context → request assistant reply → insert assistant message.
 */
export function useSendAiMessage(
  owner: AiOwner | null,
): UseMutationResult<SendMessageResult, Error, SendMessageVars> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<SendMessageResult, Error, SendMessageVars>({
    mutationFn: async ({ conversationId, ...raw }) => {
      if (!owner) throw new Error('Not authenticated.')
      const { content, displayText } = sendMessageSchema.parse(raw)

      let id = conversationId
      if (id == null) {
        const conversation = await createConversation(client, owner, displayText ?? content)
        id = conversation.id
      }

      await insertUserMessage(client, id, content, displayText ?? null)

      const recent = await getRecentMessages(client, id, AI_CONTEXT_MESSAGE_LIMIT)
      const history = recent.map((m) => ({ role: m.role, content: m.content }))

      const reply = await requestAssistantReply({ conversationId: id, message: content, history })
      await insertAssistantMessage(client, id, reply)
      await touchConversation(client, id)

      return { conversationId: id }
    },
    onSuccess: ({ conversationId }) => {
      queryClient.invalidateQueries({ queryKey: aiKeys.conversations() })
      queryClient.invalidateQueries({ queryKey: aiKeys.messages(conversationId) })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
