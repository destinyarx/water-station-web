export {}

declare global {
  /**
   * Custom claims AquaFlow's Supabase edge function writes into the Clerk
   * session token after onboarding. Read by middleware and the registration
   * guard to gate access to the app.
   */
  interface CustomJwtSessionClaims {
    organization?: string | null
    is_owner?: boolean | null
  }
}
