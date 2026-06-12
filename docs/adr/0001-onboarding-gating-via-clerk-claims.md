# ADR 0001 — Onboarding gating via Clerk session claims

- **Status:** Accepted
- **Date:** 2026-06-06
- **Feature:** `docs/specs/000-auth_workflow`

## Context

After signing up with Clerk, a user is authenticated but has not yet told us whether they
are a station **owner** or **staff**, nor which **water station** (organization) they belong
to. They must complete a `/complete-registration` form that POSTs to the Supabase
`update-clerk-session-tokens` edge function. The app must block access to every feature until
that step is done, and must keep blocking on every subsequent request until the data exists.

We need a single source of truth for "is this user onboarded?" that:

- is readable in **middleware** (edge runtime, no DB call) on every request, and
- is readable on the **client** (the form hook) to react after submission.

## Decision

Gate on **Clerk session-token custom claims**. A user is considered **registered** iff:

```ts
sessionClaims.organization != null && sessionClaims.is_owner != null
```

- The predicate lives in one place: `isRegistered()` in
  `src/features/registration/registration.guards.ts`, reused by both middleware and hooks.
- The claims shape is declared globally in `src/types/globals.d.ts`
  (`CustomJwtSessionClaims`), so no `any`/casts are needed.
- `src/proxy.ts` (`clerkMiddleware` callback): public routes (`/`, `/sign-in*`, `/sign-up*`)
  pass through; unauthenticated users go to `/sign-in`; authenticated-but-unregistered users
  are forced to `/complete-registration`; registered users sitting on
  `/complete-registration` are sent on to `/dashboard`.

### Required edge-function guarantee

The client sends `organization: null` for owners (they have no invite code; they are
*creating* the station). Because the gate requires a **non-null** `organization`, the edge
function MUST, for owners, create the station and write a non-null `organization` claim
server-side. If it does not, owners would pass the form but fail the gate and loop back to
`/complete-registration` forever.

### Stale-claim refresh

The edge function updates the session token, but the client's cached token is now stale.
After a successful submit the form hook calls `getToken({ skipCache: true })` and then
hard-navigates (`window.location.assign('/dashboard')`) so middleware re-reads fresh claims.

## Consequences

- **Pro:** No database round-trip in middleware; the check is a cheap claim read on every
  request. One predicate, reused everywhere.
- **Pro:** Works offline of our own DB — Clerk is the only dependency for the gate.
- **Con:** Correctness depends on the edge function populating claims correctly (especially
  the owner `organization` guarantee above). This coupling is documented and must hold.
- **Con:** Claim propagation is eventually consistent; the explicit `skipCache` refresh +
  hard navigation is required to avoid a redirect loop right after onboarding.

## Alternatives considered

- **DB lookup in middleware** — rejected: adds latency and a Supabase dependency to every
  request, and middleware runs on the edge runtime.
- **Client-only guard** — rejected: trivially bypassable by navigating directly to a route;
  middleware enforcement is required.
