# All Supabase schema/RLS changes ship as versioned migrations

Status: proposed (fable review, 2026-07-14) — becomes accepted when the baseline in ARC-003 lands.

## Context

The database schema and every RLS policy — this app's entire tenant-isolation boundary — are applied manually in the Supabase dashboard. The repo has no `supabase/migrations/` folder; the only paper trail is `docs/DATABASE.md` plus per-spec SQL snippets, which are already provably stale in places (the `customers`/`products` `org_id` type contradiction — see ISS-001 and ADR 0009). There is currently no way to verify from the repo that documented policy matches deployed policy.

## Decision

1. Adopt the Supabase CLI. A one-time `supabase db pull` baseline of the live schema is committed under `supabase/migrations/` (execution details: `docs/ai-handoff/fable-review-2026-07-14/architecture-improvements/ARC-003-adopt-supabase-migrations.md`).
2. From then on, **every** schema/RLS/trigger/function change is a committed migration file, applied via the CLI — manual dashboard edits are no longer permitted.
3. Each migration PR also updates the matching `docs/DATABASE.md` section in the same PR. `docs/DATABASE.md` stays the human-readable policy reference; the migrations folder becomes the machine-verifiable source of truth.

## Consequences

- Schema changes become reviewable diffs; drift between docs and reality becomes detectable (`supabase db diff --linked`).
- Slightly more ceremony per schema change (CLI instead of dashboard), which is the point.
- Existing project rule unchanged: agents never run migrations directly — they write the migration file and a ticket; a human with project access applies it.
