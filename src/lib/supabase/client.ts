import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/** Async getter that resolves the caller's Clerk session token, or null. */
export type ClerkTokenGetter = () => Promise<string | null>

/**
 * Builds a Supabase browser client authenticated with the caller's Clerk token.
 * Supabase reads the forwarded JWT as `auth.jwt()`, which is what the customer
 * RLS policies use to scope rows by `org_id` and `created_by`. Without this the
 * client would be anonymous and every tenant-scoped query/mutation would fail.
 */
export function createClerkSupabaseClient(
  getToken: ClerkTokenGetter,
): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment configuration.')
  }

  return createClient(supabaseUrl, supabaseKey, {
    accessToken: async () => {
      // Next.js can pre-render client components on the server. Clerk's
      // getToken() is browser-only, so skip it until a browser runtime exists.
      if (typeof window === 'undefined') {
        return null
      }

      return (await getToken()) ?? null
    },
  })
}
