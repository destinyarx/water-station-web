'use client'

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'

import { documentKeys } from '../documents.keys'
import type { Document } from '../documents.types'
import { setDocumentApproval } from '../services/documents.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

export function useApproveDocument(): UseMutationResult<
  Document,
  Error,
  { id: number; isApproved: boolean }
> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<Document, Error, { id: number; isApproved: boolean }>({
    mutationFn: ({ id, isApproved }) => setDocumentApproval(client, id, isApproved),
    onSuccess: (_data, { isApproved }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all })
      toast.success(isApproved ? 'Document approved.' : 'Approval revoked.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
