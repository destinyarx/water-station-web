'use client'

import { useState } from 'react'

import type { Conversation, Message, ReadyMadePrompt } from '../aquaflow-ai.types'
import { useAiConversations } from '../hooks/use-ai-conversations'
import { useAiMessages } from '../hooks/use-ai-messages'
import { useAquaflowAiAccess } from '../hooks/use-aquaflow-ai-access'
import { useDeleteAiConversation } from '../hooks/use-delete-ai-conversation'
import { useSendAiMessage } from '../hooks/use-send-ai-message'
import { ConversationSidebar } from './conversation-sidebar'
import { MessageComposer } from './message-composer'
import { MessageList } from './message-list'

export function AquaflowAiPage() {
  const { owner } = useAquaflowAiAccess()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [pending, setPending] = useState<{ content: string; displayText: string | null } | null>(null)

  const conversationsQuery = useAiConversations(owner != null)
  const messagesQuery = useAiMessages(selectedId)
  const sendMutation = useSendAiMessage(owner)
  const deleteMutation = useDeleteAiConversation()

  const isSending = sendMutation.isPending

  function send(content: string, displayText: string | null) {
    if (isSending) return
    setPending({ content, displayText })
    sendMutation.mutate(
      { conversationId: selectedId, content, displayText: displayText ?? undefined },
      {
        onSuccess: ({ conversationId }) => setSelectedId(conversationId),
        onSettled: () => setPending(null),
      },
    )
  }

  function handleDelete(conversation: Conversation) {
    // ponytail: native confirm for a destructive one-off; a dialog if this grows.
    if (!window.confirm(`Delete "${conversation.title}"? This cannot be undone.`)) return
    deleteMutation.mutate(conversation.id, {
      onSuccess: () => {
        if (conversation.id === selectedId) setSelectedId(null)
      },
    })
  }

  function handleSelectPrompt(prompt: ReadyMadePrompt) {
    send(prompt.prompt, prompt.title)
  }

  const messages: Message[] = messagesQuery.data ?? []
  const displayed: Message[] = pending
    ? [
        ...messages,
        {
          id: -1,
          conversationId: selectedId ?? -1,
          role: 'user',
          content: pending.content,
          displayText: pending.displayText,
          card: null,
          createdAt: new Date().toISOString(),
        },
      ]
    : messages

  return (
    <div className="flex h-full min-h-0 bg-[var(--app-page-bg)]">
      <ConversationSidebar
        conversations={conversationsQuery.data ?? []}
        isLoading={conversationsQuery.isLoading}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNewChat={() => setSelectedId(null)}
        onDelete={handleDelete}
        onSelectPrompt={handleSelectPrompt}
        promptsDisabled={isSending}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <MessageList
          messages={displayed}
          isLoading={selectedId != null && messagesQuery.isLoading}
          isTyping={isSending}
          disabled={isSending}
          onSelectPrompt={handleSelectPrompt}
        />
        <MessageComposer disabled={isSending} onSend={(text) => send(text, null)} />
      </div>
    </div>
  )
}
