'use client'

import { useMutation, type UseMutationResult } from '@tanstack/react-query'

import { toast } from '@/stores/toast-store'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import type { Document } from '../documents.types'
import { createDocumentSignedUrl } from '../services/documents.service'

export function useOpenDocument(): UseMutationResult<string, Error, Document> {
  const client = useClerkSupabase()

  return useMutation({
    mutationFn: (doc) => createDocumentSignedUrl(client, doc),
    onSuccess: (url) => {
      window.open(url, '_blank', 'noopener,noreferrer')
    },
    onError: (error) => toast.error(error.message),
  })
}
