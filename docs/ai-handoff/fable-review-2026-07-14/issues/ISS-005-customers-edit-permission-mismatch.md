# ISS-005 — Customers: UI edit guard doesn't match documented RLS UPDATE policy

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P2 | Module: customers | Type: spec mismatch / UX bug (latent) | Effort: Low

## Goal

Align the customers UI edit guard with the real (live) RLS UPDATE policy, so a user is never shown an Edit action that will fail at submit time.\
- Check this out and this will be the final goals as some context below might be misleading:
  - check if the live RLS policy is the same as in `C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\water-station-supabase\supabase\migrations\11.add_customers_table.sql`
  - I need the RLS and frontend guard to be 
    - only the creator or owner, owner can edit maanage all records in  his respective org_id rows.

## Context

- `src/features/customers/customers.guards.ts` — `canEditCustomer` only checks `deletedAt`; it does not check creator or role.
- `docs/DATABASE.md`'s documented UPDATE policy for `customers` requires `created_by = auth.jwt()->>'sub'` (creator-only), with **no owner override** — unlike products, where owners may edit any org record.
- If the documented policy is live: a staff member viewing a customer created by a colleague sees an enabled Edit button whose save fails with a generic error. If the live policy actually has an owner override (docs stale), the guard is fine for owners but the docs are wrong.

Evidence: `docs/ai-handoff/03-specification-status.md` row "Customer edit permission (owner override)"; `docs/ai-handoff/15-open-questions.md` business-rule table.

## Decision point (product owner)

Should customers match products (owner override + creator-only for staff), or stay creator-only for everyone? The products precedent suggests owner override is the intended model, but do not assume — this changes an RLS policy.

## Steps

1. **Verify the live policy first** (read-only, Supabase dashboard): inspect `pg_policies` for `public.customers` UPDATE. Record the literal policy text in this ticket.
2. If the intended rule differs from the live policy, open a separate migration ticket for the RLS change (per project rules: no direct DB changes). Suggested policy for owner-override parity with products: `USING (private.is_org_member(org_id) AND (created_by = auth.jwt()->>'sub' OR (auth.jwt()->>'is_owner')::boolean))` — adapt to the exact pattern used in the live products policy rather than inventing a new shape.
3. Update `canEditCustomer` in `customers.guards.ts` to encode the same rule client-side (pure function taking the record + `{ userId, isOwner }`), and wire it in `customer-row-actions.tsx`. The `use-customer-owner`-style hook already exposes the Clerk claims needed.
4. Add/extend unit tests in `src/features/customers/tests/customers.guards.test.ts` for each role/creator combination.
5. Reconcile `docs/DATABASE.md`'s customers UPDATE policy text with a "fable 2026-07-14" note.

## Acceptance criteria

- When a user cannot pass the customers RLS UPDATE policy for a record, the UI shall not offer an enabled Edit action for that record.
- When the guard and policy are finalized, `docs/DATABASE.md` shall state the same rule as the live policy.
- `npm run test` / lint / typecheck pass.

## Files

- `src/features/customers/customers.guards.ts`
- `src/features/customers/components/customer-row-actions.tsx`
- `src/features/customers/tests/customers.guards.test.ts`
- `docs/DATABASE.md`

## Breakage check

Guard change is UI-only (RLS remains the boundary) — tightening the guard cannot break writes, it can only hide buttons. The RLS change (if any) is the risky part; it goes through its own migration ticket with manual verification steps.
