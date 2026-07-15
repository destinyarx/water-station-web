'use client'

import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type QueryKey,
  type UseMutationResult,
} from '@tanstack/react-query'
import type { SupabaseClient } from '@supabase/supabase-js'

import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

type InvalidateKeys<TResult, TInput> =
  | readonly QueryKey[]
  | ((result: TResult, input: TInput) => readonly QueryKey[])

interface EntityMutationOptions<TInput, TResult> {
  mutationFn: (
    client: SupabaseClient,
    input: TInput,
  ) => Promise<TResult>
  invalidateKeys: InvalidateKeys<TResult, TInput>
  successMessage: string | ((result: TResult, input: TInput) => string)
  onSuccessExtra?: (result: TResult, input: TInput) => void
}

/** Invalidates each declared cache scope after a successful entity mutation. */
export function invalidateEntityMutationKeys(
  queryClient: QueryClient,
  keys: readonly QueryKey[],
): void {
  keys.forEach((queryKey) => {
    void queryClient.invalidateQueries({ queryKey })
  })
}

/**
 * Shared mutation plumbing for ordinary Supabase entity writes. Feature hooks
 * retain their public signatures and supply their service function, exact
 * invalidation keys, and user-facing success message.
 */
export function useEntityMutation<TInput, TResult>(
  options: EntityMutationOptions<TInput, TResult>,
): UseMutationResult<TResult, Error, TInput> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<TResult, Error, TInput>({
    mutationFn: (input) => options.mutationFn(client, input),
    onSuccess: (result, input) => {
      const keys =
        typeof options.invalidateKeys === 'function'
          ? options.invalidateKeys(result, input)
          : options.invalidateKeys
      invalidateEntityMutationKeys(queryClient, keys)
      options.onSuccessExtra?.(result, input)
      toast.success(
        typeof options.successMessage === 'function'
          ? options.successMessage(result, input)
          : options.successMessage,
      )
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
