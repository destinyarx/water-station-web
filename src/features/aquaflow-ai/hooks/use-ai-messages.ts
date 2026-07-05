'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { aiKeys } from '../aquaflow-ai.keys'
import type { Message } from '../aquaflow-ai.types'
import { getMessages } from '../services/aquaflow-ai.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

export function useAiMessages(
  conversationId: number | null,
): UseQueryResult<Message[], Error> {
  const client = useClerkSupabase()

  return useQuery<Message[], Error>({
    queryKey: aiKeys.messages(conversationId ?? 0),
    queryFn: () => getMessages(client, conversationId as number),
    enabled: conversationId != null,
    staleTime: 10_000,
  })
}
