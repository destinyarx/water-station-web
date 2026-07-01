'use client'

import { useMutation, type UseMutationResult } from '@tanstack/react-query'

import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { sendSmoothHandlerEmail } from '../services/playground.service'
import type { SendEmailFormValues } from '../playground.schema'

export function useSendSmoothHandlerEmail(): UseMutationResult<
  unknown,
  Error,
  SendEmailFormValues
> {
  const client = useClerkSupabase()

  return useMutation<unknown, Error, SendEmailFormValues>({
    mutationFn: (values) => sendSmoothHandlerEmail(client, values),
  })
}
