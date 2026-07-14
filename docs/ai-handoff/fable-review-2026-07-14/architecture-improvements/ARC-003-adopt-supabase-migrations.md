# ARC-003 — Adopt versioned Supabase migrations (schema/RLS currently applied by hand, unverifiable from the repo)

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P1 | Module: database / devops | Effort: Medium (one-time baseline) + Low (ongoing)
> Related proposed ADR: `docs/adr/0012-versioned-supabase-schema-changes.md`

## Problem

No `supabase/` folder exists. Every schema/RLS change is run manually in the dashboard; the only paper trail is `docs/DATABASE.md` plus per-spec SQL snippets — some already known stale (the `org_id` contradiction, ISS-001). There is **no way to prove** the documented RLS matches what's deployed, and RLS is this app's entire tenant-isolation boundary. (`docs/ai-handoff/10-security-and-risks.md` migrations row)

## Constraints

- **No direct database changes.** Baselining is read-only (`db pull` introspects; it does not modify). Any drift found becomes its own migration ticket.
- Human with Supabase project access must run the CLI steps; record outputs in this ticket.

## Steps

1. Install the Supabase CLI as a dev dependency (or use `npx supabase`); `supabase init` to create `supabase/config.toml`.
2. `supabase link --project-ref <ref>` (owner supplies the ref; never commit the DB password).
3. `supabase db pull` — generates a baseline migration under `supabase/migrations/` from the **live** schema, including RLS policies. Commit it. This baseline is the first-ever verifiable snapshot of production schema.
4. Diff the baseline against `docs/DATABASE.md` — this mechanically answers ISS-001 (org_id type), ISS-009 (expenses/documents/`delivery_schedule_dates`), and any other drift. File follow-up tickets per discrepancy; do not fix live schema here.
5. Adopt the rule going forward (see proposed ADR 0012): every schema/RLS change ships as a committed migration file **plus** the matching `docs/DATABASE.md` update in the same PR. Manual dashboard edits are no longer allowed.
6. Optional follow-up: a CI job running `supabase db diff --linked` on a schedule to detect out-of-band drift (needs an access-token secret; separate ticket).

## Acceptance criteria

- `supabase/migrations/` shall exist in the repo containing a baseline that reproduces the live schema.
- The baseline-vs-`docs/DATABASE.md` diff shall be recorded, with one follow-up ticket per discrepancy found.
- The workflow rule shall be recorded as an accepted ADR and referenced from `docs/DATABASE.md`.

## Breakage check

`db pull` is read-only against the remote; zero runtime risk. The risk is process, not code: if the team keeps making dashboard edits after baselining, the migrations folder becomes a second stale source of truth — the ADR rule (step 5) is what prevents that, so don't merge the baseline without it.
