# Security Rules

## Purpose

This file defines the security requirements for the project.

## Clerk

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` may be used on the frontend.
- `CLERK_SECRET_KEY` is server-only.
- Never expose secret keys in client components.
- Verify authentication before protected server actions.

## Supabase

- RLS must be enabled on every public table.
- No public table should be accessible without policies.
- The service role key is server-only.
- Never use service role key in browser code.
- Every policy must be documented in `docs/DATABASE.md`.

## Input Validation

- All form inputs must be validated with Zod.
- Never trust client-side validation only.

## Authentication

- All protected routes must require authentication.
- Do not expose private user data to unauthenticated users.
- Session handling must follow the chosen auth provider.

## Authorization

Users must only access data they are allowed to access.

## Supabase Security

- Use Row Level Security where applicable.
- Never expose service role keys to the frontend.
- Only use public anon keys on the client.
- Sensitive operations should be done through secure server-side logic.

## Environment Variables

Never hardcode secrets.

Allowed on frontend:
- Public Supabase anon key
- Public project URL
- Public Clerk publishable key, if using Clerk

Never expose:
- Supabase service role key
- Database password
- Private API keys
- Webhook secrets

## Input Validation

- Validate all forms using Zod.
- Validate server-side inputs.
- Do not trust client-side validation alone.

## Database Rules

- Schema changes must use migrations.
- Do not delete tables or columns without explicit approval.
- Do not weaken RLS policies without explanation.

## Error Handling

- Do not expose internal errors to users.
- Log useful debugging information safely.
- Avoid leaking tokens, IDs, or private data in errors.