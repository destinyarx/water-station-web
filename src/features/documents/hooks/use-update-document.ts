'use client'

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'

import { documentKeys } from '../documents.keys'
import type { Document, DocumentFormValues } from '../documents.types'
import { updateDocument } from '../services/documents.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

export function useUpdateDocument(): UseMutationResult<
  Document,
  Error,
  { id: number; values: DocumentFormValues }
> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<Document, Error, { id: number; values: DocumentFormValues }>({
    mutationFn: ({ id, values }) => updateDocument(client, id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all })
      toast.success('Document updated.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
