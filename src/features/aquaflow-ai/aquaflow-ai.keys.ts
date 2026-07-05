export const aiKeys = {
  all: ['aquaflow-ai'] as const,
  conversations: () => [...aiKeys.all, 'conversations'] as const,
  messages: (conversationId: number) =>
    [...aiKeys.all, 'messages', conversationId] as const,
}
