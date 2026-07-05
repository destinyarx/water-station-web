'use client'

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'

import { aiKeys } from '../aquaflow-ai.keys'
import { deleteConversation } from '../services/aquaflow-ai.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

export function useDeleteAiConversation(): UseMutationResult<void, Error, number> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (conversationId) => deleteConversation(client, conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.conversations() })
      toast.success('Conversation deleted.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
