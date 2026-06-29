'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { documentKeys } from '../documents.keys'
import type { Document } from '../documents.types'
import { getActiveDocuments } from '../services/documents.service'
import { useClerkSupabase } from './use-clerk-supabase'

export function useDocuments(): UseQueryResult<Document[], Error> {
  const client = useClerkSupabase()

  return useQuery<Document[], Error>({
    queryKey: documentKeys.list({ active: true }),
    queryFn: () => getActiveDocuments(client),
    staleTime: 30_000,
  })
}
