# Note: Validate first as my docs can be misleading
## Source of truth is the main migrations: `C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\water-station-supabase\supabase\migrations`
## If you need to make any migration make sure to create one in the `docs\ai-handoff\fable-review-2026-07-14\migrations` folder.

# ISS-009 — Database docs: expenses RLS is a placeholder, documents table undocumented, one table uses a different identity model

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P2 | Module: database / documentation | Type: security-documentation gap | Effort: Low–Medium (mostly transcription from the live dashboard)

## Goal

Bring `docs/DATABASE.md` back to its own standard — every tenant-owned table fully documented (columns, org/identity resolution, policies, manual verification steps) — for the three known gaps.

## Context

`docs/SECURITY.md` requires every RLS policy to be documented in `docs/DATABASE.md`. Three gaps found:

1. **`public.expenses`** — the section is a placeholder checklist ("must include…") instead of actual columns/policies. (`docs/ai-handoff/11-quality-and-improvements.md` Q15)
2. **`public.documents`** — no section exists at all; its schema lives only in the feature 009 spec's migration SQL. (`docs/ai-handoff/04-feature-map.md` Documents row)
3. **`public.delivery_schedule_dates`** — its documented RLS uses `auth.uid()` (native Supabase auth) instead of the `auth.jwt()->>'sub'` Clerk-claim pattern used by every other table. With Clerk as the identity provider, `auth.uid()` behavior depends on the JWT's `sub` mapping — this is either a bug (policy never matches → inserts fail or, worse, a permissive fallback) or an undocumented intentional exception. (`docs/ai-handoff/03-specification-status.md`, `07-data-architecture.md`)

## Constraints

- Read-only against the live database. Any policy **change** that falls out of item 3 gets its own migration ticket — do not fix policies in this ticket.

## Steps

1. From the Supabase dashboard (or `select * from pg_policies where tablename in ('expenses','documents','delivery_schedule_dates')` + `information_schema.columns`), transcribe the **live** columns and policies for the three tables.
2. Write/replace the `expenses` and add the `documents` sections in `docs/DATABASE.md`, matching the structure used by `customers`/`notifications` (columns table, identity/org resolution, policies, manual verification checklist). Mark each new section "documented from live schema, fable 2026-07-14".
3. For `delivery_schedule_dates`: record the literal live policy. If it genuinely uses `auth.uid()`, test whether Clerk-authenticated requests satisfy it (attempt a read/write as a normal user in staging). If it's broken or inconsistent, open a follow-up migration ticket to align it with the `auth.jwt()->>'sub'` pattern; if intentional, document why.

## Acceptance criteria

- `docs/DATABASE.md` shall contain real column/policy documentation for `expenses` and `documents` matching the live database.
- The `delivery_schedule_dates` identity-model question shall be answered in writing (documented exception or follow-up migration ticket) — not left implicit.

## Files

- `docs/DATABASE.md`
- Live Supabase project (read-only)

## Breakage check

Documentation-only; zero runtime risk. The only action item with risk (policy change) is explicitly deferred to a separate migration ticket.
