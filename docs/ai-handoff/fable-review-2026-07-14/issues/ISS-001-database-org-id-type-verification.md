# ISS-001 — Verify live `org_id` column type on `customers`/`products` and reconcile `docs/DATABASE.md`

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: **P0** | Module: database / customers / products | Type: data-integrity + documentation | Effort: Low (verification) + Low (doc fix) or Medium (migration, only if integer)

## Goal

Determine whether the live Supabase `customers.org_id` and `products.org_id` columns are `integer` or `uuid`, then make `docs/DATABASE.md` match reality. If (and only if) they are still `integer`, plan a migration to `uuid` — via a ticketed manual migration, never a direct change.

## Context

`docs/DATABASE.md` contradicts itself about the single most security-critical column in the schema:

- Its `public.customers` and `public.products` sections say `org_id integer (fk) -> organizations(organization_code)`.
- Its `public.notifications` / `public.ai_conversations` sections say `org_id uuid (fk) -> organizations(id)`, citing ADR 0009.
- `docs/adr/0009-org-id-is-organizations-uuid.md` states every tenant-owned table was migrated to `org_id uuid references organizations(id)`, and that `Number(...)` coercion was removed from the `use-*-owner` hooks.
- The Zod schemas and `use-*-owner` hooks in code pass the Clerk `organization` claim through as a **string uuid**.

If the live columns are still `integer`, every customer/product insert would hard-fail (string into integer column). Since the app appears to work, the docs are **probably** stale — but this must be confirmed, not assumed. Full evidence trail: `docs/ai-handoff/03-specification-status.md` row 8, `docs/ai-handoff/07-data-architecture.md` §5.1, `docs/ai-handoff/10-security-and-risks.md`.

## Constraints

- **Do not run any migration directly.** This ticket authorizes verification (read-only) and documentation edits only.
- Requires live Supabase dashboard/SQL access — a human or an agent with that access must run the check.

## Steps

1. In the Supabase SQL editor, run (read-only):
   ```sql
   select table_name, column_name, data_type
   from information_schema.columns
   where table_schema = 'public'
     and table_name in ('customers', 'products')
     and column_name = 'org_id';
   ```
2. **If both are `uuid`** (expected): edit `docs/DATABASE.md`'s `public.customers` and `public.products` sections to `org_id uuid (fk) -> organizations(id)`, matching the notifications section's wording, and note "reconciled per ADR 0009 (fable review 2026-07-14)". Close this ticket.
3. **If either is `integer`** (unexpected — the app would be failing inserts): open a follow-up migration ticket containing:
   - `alter table public.<table> alter column org_id type uuid using ...` plan, including how to map existing integer `organization_code` values to `organizations.id` uuids,
   - RLS policy re-verification steps for the table,
   - a full regression pass of create/edit flows for that module.
   Do not execute it in this ticket.

## Acceptance criteria

- When the verification query has been run, the ticket shall record its literal output.
- When `docs/DATABASE.md` is edited, both the `customers` and `products` sections shall state the same `org_id` type and FK target as the live database, with a "fable 2026-07-14" reconciliation note.
- If a migration is needed, the system state shall be unchanged and a separate migration ticket shall exist instead.

## Files

- `docs/DATABASE.md` (edit)
- Live Supabase project (read-only query)

## Breakage check

Documentation-only change; zero runtime risk. The migration branch (step 3) is explicitly deferred to its own ticket.
