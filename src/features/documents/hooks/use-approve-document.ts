'use client'

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'

import { documentKeys } from '../documents.keys'
import type { Document } from '../documents.types'
import { setDocumentApproval } from '../services/documents.service'
import { useClerkSupabase } from './use-clerk-supabase'

export function useApproveDocument(): UseMutationResult<
  Document,
  Error,
  { id: number; isApproved: boolean }
> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<Document, Error, { id: number; isApproved: boolean }>({
    mutationFn: ({ id, isApproved }) => setDocumentApproval(client, id, isApproved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
    },
  })
}
