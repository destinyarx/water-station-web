'use client'

import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query'

import { documentKeys, type DocumentFilters } from '../documents.keys'
import type { DocumentPage, DocumentStats } from '../documents.types'
import { getActiveDocuments, getDocumentStats } from '../services/documents.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

export function useDocuments(filters: DocumentFilters): UseQueryResult<DocumentPage, Error> {
  const client = useClerkSupabase()

  return useQuery<DocumentPage, Error>({
    queryKey: documentKeys.list(filters),
    queryFn: () => getActiveDocuments(client, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useDocumentStats(): UseQueryResult<DocumentStats, Error> {
  const client = useClerkSupabase()
  return useQuery({ queryKey: documentKeys.stats(), queryFn: () => getDocumentStats(client), staleTime: 30_000 })
}
