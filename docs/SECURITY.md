# Security Rules

## Purpose

This file defines the security requirements for the project.

## Clerk

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` may be used on the frontend.
- `CLERK_SECRET_KEY` is server-only.
- Never expose secret keys in client components.
- Verify authentication before protected server actions and protected route access.
- Session handling must follow Clerk as the chosen auth provider.

## Clerk/Supabase Identity Contract

Organization-owned records must use:

- `org_id` from the current Clerk session `organization` claim
- `created_by` from the authenticated Clerk user id

Forms must not expose or submit `org_id` or `created_by`.

Supabase RLS must independently enforce organization isolation using the Clerk JWT claims forwarded to Supabase.

Owner/staff authorization must be based on trusted Clerk session claims and RLS policies, not user-editable request fields.

## Supabase

- RLS must be enabled on every public table.
- No public table should be accessible without policies.
- The service role key is server-only.
- Never use the service role key in browser code.
- Only use public anon/publishable keys on the client.
- Every policy must be documented in `docs/DATABASE.md`.
- Do not bypass RLS to make a query work.

## Input Validation

- Validate all forms using Zod.
- Validate server-side inputs.
- Never trust client-side validation only.
- Every mutation must validate its input before sending data to Supabase.

## Authentication

- All protected routes must require authentication.
- Do not expose private user data to unauthenticated users.
- Users who have not completed registration/onboarding must not access protected station workflows.

## Authorization

Users must only access data they are allowed to access.

Organization-owned data must be scoped by `org_id`, and cross-organization access must be blocked by RLS even if UI or service code is bypassed.

## Soft Delete

For tables with `deleted_at`, application delete actions should soft-delete by setting `deleted_at = now()`.

Hard `DELETE` policies should not be used by normal UI flows unless explicitly documented as an admin or maintenance operation.

Active lists must exclude soft-deleted rows.

## Environment Variables

Never hardcode secrets.

Allowed on frontend:

- Public Supabase anon/publishable key
- Public Supabase project URL
- Public Clerk publishable key

Never expose:

- Supabase service role key
- Database password
- Private API keys
- Webhook secrets

## Database Rules

- Schema changes must use migrations.
- Do not delete tables or columns without explicit approval.
- Do not weaken RLS policies without explanation.
- Keep `docs/DATABASE.md` synchronized with table and policy changes.

## Error Handling

- Do not expose internal errors to users.
- Log useful debugging information safely.
- Avoid leaking tokens, IDs, private data, policy details, or secrets in user-facing errors.
