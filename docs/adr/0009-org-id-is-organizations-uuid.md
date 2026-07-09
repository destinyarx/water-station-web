# Tenant key is the `organizations.id` uuid, carried by the `organization` claim

Status: accepted (refines ADR 003 and ADR 0001)

## Context

The schema was migrated so every tenant-owned table scopes rows by
`org_id uuid references organizations(id)`. Previously tenancy was matched on a
`organization_code`-style value, and the Clerk session exposed a numeric
`organization` claim that the client coerced with `Number(sessionClaims.organization)`.
With the uuid FK in place, `Number(uuid)` yields `NaN`, which silently blocked
every create hook.

## Decision

The **`organizations.id` uuid** is the single tenant key. The Clerk
`organization` session claim (sourced from the user's `public_metadata`, flattened
to a top-level claim by the JWT template) now carries that uuid as a plain string.
Client write hooks use it directly as `org_id` — no numeric coercion. All
`orgId`/`org_id` TypeScript types change from `number` to `string`.

Onboarding is split into two Supabase edge functions that own writing this claim:
`create-aquaflow-organization` (owner) and `aquaflow-add-staff` (staff). Each must
write a non-null `organization` uuid plus `is_owner` into `public_metadata`.

## Consequences

- `Number(...)` is removed from the 7 `use-*-owner` hooks; each returns the claim
  string (or `null` when absent). The `NaN` guard is dropped.
- The old single edge function and `NEXT_PUBLIC_SUPABASE_EDGE_REGISTRATION_URL`
  are retired in favour of two URL env vars.
- **Trusted-but-verified, not a violation of ADR 003.** ADR 003 states `org_id` is
  never trusted from the JWT. The client still *supplies* `org_id` from the claim
  for convenience, but RLS remains authoritative: insert `with check` requires
  `private.is_org_member(org_id)`, so a forged claim cannot write into another org.
  The claim is an optimization over the authoritative membership check, not a
  replacement for it.
- The pre-existing DB-row types that declared `org_id: number` were already wrong
  at runtime (Postgres returns the uuid as a string); this change corrects them.
