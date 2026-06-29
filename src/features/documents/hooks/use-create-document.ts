'use client'

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'

import { documentKeys } from '../documents.keys'
import type { Document, DocumentFormValues, DocumentOwner } from '../documents.types'
import { createDocument } from '../services/documents.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

export function useCreateDocument(
  owner: DocumentOwner | null,
): UseMutationResult<Document, Error, DocumentFormValues> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<Document, Error, DocumentFormValues>({
    mutationFn: (values) => {
      if (!owner) throw new Error('Not authenticated.')
      return createDocument(client, values, owner)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
    },
  })
}
