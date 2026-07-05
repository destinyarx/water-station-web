# ADR 0008 — Owner-only route-level gating (first of its kind)

- **Status:** Accepted
- **Date:** 2026-07-04
- **Feature:** `docs/specs/011-aquaflow-ai-feature`

## Context

Every existing `is_owner` check in the codebase (`use-*-owner` hooks in
customers/products/expenses/deliveries/maintenance/documents) is a **per-record
ownership check inside a page every role can open** — e.g. "can this user edit
this specific product." `src/proxy.ts` only gates on registration status, never
on role. There is no precedent for hiding an entire nav item and blocking an
entire route based on `is_owner`.

AquaFlow AI's ready-made prompts and scope are entirely financial/business
insight framed (revenue, expenses), which `CONTEXT.md`'s role rules already
treat as owner-only territory. Staff should not reach this page at all.

## Decision

AquaFlow AI is the first **whole-page, role-gated route**:

- The nav item in `app-sidebar.tsx` only renders when `sessionClaims.is_owner`
  is true.
- The route itself independently checks `is_owner` (server-side, in the page's
  layout or a guard) and redirects non-owners — the nav hide is UX only, not
  the security boundary.
- `ai_conversations`/`ai_messages` RLS also requires the owner claim, so a
  staff session cannot read/write rows even via a direct Supabase call.

## Consequences

- Future owner-only *modules* (as opposed to owner-only actions within a shared
  module) should follow this same three-layer pattern (nav hide + route guard +
  RLS), rather than inventing a new approach each time.
- This does not change how per-record ownership works in existing shared
  modules — that pattern (any member sees the page, ownership only gates
  specific actions) is unaffected and still correct for those cases.
