export {}

declare global {
  /**
   * Custom claims AquaFlow's onboarding edge functions write into the Clerk
   * user's `public_metadata`, flattened to top-level claims by the JWT template.
   * Read by middleware and the guards to gate access to the app.
   *
   * `organization` is the caller's `organizations.id` **uuid** (the tenant key
   * written as `org_id` on every row). `name`/`email` mirror the Clerk profile
   * and are forwarded to the onboarding edge functions.
   */
  interface CustomJwtSessionClaims {
    organization?: string | null
    is_owner?: boolean | null
    name?: string | null
    email?: string | null
    /** Human-readable station name for display (JWT template maps
     * `public_metadata.organization_name`); `organization` stays the uuid. */
    organization_name?: string | null
    /** Optional role label; falls back to `is_owner` → Owner/Staff. */
    organization_role?: string | null
  }
}
