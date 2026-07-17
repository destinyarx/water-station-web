'use client'

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'

import { documentKeys } from '../documents.keys'
import { deleteDocument } from '../services/documents.service'
import type { Document } from '../documents.types'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

export function useDeleteDocument(): UseMutationResult<void, Error, Document> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<void, Error, Document>({
    mutationFn: (doc) => deleteDocument(client, doc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all })
      toast.success('Document and stored file deleted.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
