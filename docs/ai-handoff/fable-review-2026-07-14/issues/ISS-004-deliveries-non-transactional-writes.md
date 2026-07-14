# ISS-004 — Deliveries: multi-step status/edit writes are not transactional (partial-write risk)

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P2 | Module: deliveries / database | Type: reliability bug (latent) | Effort: Medium–High

## Goal

Make the multi-step delivery write paths atomic (or explicitly optimistic-locked), so a mid-sequence failure cannot leave a delivery half-updated (e.g. stock deducted but status not advanced, or items deleted but replacements not inserted).

## Context

Both risk points are already self-documented in code with `ponytail:` comments:

- `src/features/deliveries/services/delivery-status.service.ts` (~line 52): "optimistic compare-and-set, not a DB transaction. Multi-item…" — status change + stock deduction are separate statements.
- `src/features/deliveries/services/delivery-edit.service.ts` (~line 27): "not a transaction — a delete that succeeds then a failed insert…" — edit is delete-then-insert of delivery items.

The Supabase JS SDK cannot open a client-side transaction; atomicity requires a Postgres function (RPC) executed server-side. Evidence: `docs/ai-handoff/11-quality-and-improvements.md` Q12.

## Constraints

- **Do not change the database directly.** The Postgres function + grants below are a migration to be executed manually via a migration ticket (this file doubles as that ticket — the SQL must be reviewed and run by someone with dashboard access, then recorded in `docs/DATABASE.md`).
- The RPC must run as the calling user (`security invoker`) so RLS still applies — do **not** use `security definer` here; that would bypass the tenant-isolation boundary.
- Keep the service-layer error contract: catch the RPC error and throw the existing friendly constant strings, never raw Postgres text.

## Migration instructions (manual, for the DB owner)

1. Create one Postgres function per write path, e.g. `public.set_delivery_status(delivery_id uuid, expected_status text, new_status text)` and `public.replace_delivery_items(delivery_id uuid, items jsonb)`, each doing all steps in one function body (single implicit transaction), re-checking `expected_status` (compare-and-set) inside.
2. `grant execute on function ... to authenticated;` and confirm `security invoker` (the default) so RLS on `deliveries`/`delivery_items`/`products` still governs every statement.
3. Test in the dashboard with a staff-role JWT before wiring the client.
4. Document both functions (signature, behavior, RLS reliance) in `docs/DATABASE.md` with a "fable 2026-07-14" note.

## Implementation steps (code, after migration exists)

1. Replace the multi-statement sequences in `delivery-status.service.ts` / `delivery-edit.service.ts` with `supabase.rpc('...', {...})`, mapping RPC errors to the existing error constants.
2. Update the service unit tests (mock `rpc` instead of the chained builder calls).
3. Remove the two `ponytail:` partial-write comments (the ceiling they name is gone).

## Acceptance criteria

- If any step of a status change or item edit fails, then the database shall contain either the fully-old or fully-new state, never a mixture.
- While RLS is enabled, when a user from another org calls the RPC with a foreign delivery id, the system shall return zero rows / an error, not perform the write.
- `npm run test` / lint / typecheck pass; deliveries manual QA (status advance with stock deduction, edit items) passes.

## Files

- `src/features/deliveries/services/delivery-status.service.ts`
- `src/features/deliveries/services/delivery-edit.service.ts`
- `src/features/deliveries/tests/*`
- `docs/DATABASE.md` (document the new functions)

## Breakage check

Error surface changes from per-statement Supabase errors to a single RPC error — check every caller/hook that branches on the thrown message. Do the two paths as separate PRs (status first, edit second) to keep regressions isolatable. Urgency note from the review: actual concurrent-edit frequency is unknown; if this proves rare in practice, a version-column optimistic lock is an acceptable cheaper alternative — decide before building both.
