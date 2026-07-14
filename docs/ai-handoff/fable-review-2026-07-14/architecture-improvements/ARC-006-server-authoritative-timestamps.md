# ARC-006 — Stop stamping `updated_at`/`deleted_at` from the browser clock

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P2 | Modules: database + every feature service | Effort: Low (DB) + Low (code, mechanical)

## Problem

Services send `new Date().toISOString()` from the client for audit-relevant fields — confirmed in `documents.service.ts` (`setDocumentApproval`, `softDeleteDocument`) and flagged as a repo-wide pattern. A skewed or deliberately-set client clock writes wrong audit facts for approvals/archives. (`docs/ai-handoff/11-quality-and-improvements.md` Q07)

## Constraints

- **DB changes go through a manual migration ticket** — the SQL below is instructions for the DB owner (or a `supabase/migrations` file once ARC-003 lands), not something to execute directly from this ticket.

## Migration instructions (manual, for the DB owner)

1. One shared trigger function:
   ```sql
   create or replace function public.set_updated_at()
   returns trigger language plpgsql as $$
   begin
     new.updated_at := now();
     return new;
   end $$;
   ```
2. Per tenant-owned table with `updated_at`:
   ```sql
   create trigger trg_<table>_updated_at
   before update on public.<table>
   for each row execute function public.set_updated_at();
   ```
3. Confirm `updated_at`/`created_at` columns have `default now()`.
4. `deleted_at` cannot be a blanket trigger (it's intentional, set-once). Keep it explicit in the UPDATE, but replace the client-generated ISO string with a server-evaluated value: after triggers exist, the simplest compliant pattern is to keep sending the field but treat the trigger-maintained `updated_at` as the audit truth; for strict server truth on `deleted_at` too, use a small RPC or `default`-based approach — decide during implementation and document the choice.
5. Document triggers in `docs/DATABASE.md` (fable 2026-07-14 note).

## Code steps (after migration)

1. Grep `src/features` for `new Date().toISOString()`; remove every `updated_at` field from update payloads (trigger owns it now).
2. Update mappers/types if `updated_at` was in Insert/Update shapes.
3. Update affected service tests.

## Acceptance criteria

- When any row is updated, `updated_at` shall reflect the database server clock regardless of the client clock.
- No service shall send a client-generated `updated_at`.
- `npm run test` / lint / typecheck pass.

## Breakage check

Trigger + code change must land in the right order: **trigger first**, then remove client stamps (in between, both write — trigger wins, harmless). Removing client stamps before the trigger exists would freeze `updated_at`. Verify one update per module in staging after the code change.
