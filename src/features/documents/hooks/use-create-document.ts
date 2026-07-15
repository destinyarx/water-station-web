'use client'

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'

import { documentKeys } from '../documents.keys'
import type { CreateDocumentInput, Document, DocumentOwner } from '../documents.types'
import { createDocument } from '../services/documents.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

export function useCreateDocument(
  owner: DocumentOwner | null,
): UseMutationResult<Document, Error, CreateDocumentInput> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<Document, Error, CreateDocumentInput>({
    mutationFn: (input) => {
      if (!owner) throw new Error('Not authenticated.')
      return createDocument(client, input, owner)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all })
      toast.success('Document added.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
