'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { aiKeys } from '../aquaflow-ai.keys'
import type { Conversation } from '../aquaflow-ai.types'
import { getConversations } from '../services/aquaflow-ai.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

export function useAiConversations(
  enabled: boolean,
): UseQueryResult<Conversation[], Error> {
  const client = useClerkSupabase()

  return useQuery<Conversation[], Error>({
    queryKey: aiKeys.conversations(),
    queryFn: () => getConversations(client),
    enabled,
    staleTime: 30_000,
  })
}
