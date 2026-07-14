# Fable Review — 2026-07-14

Senior-engineer review of the AquaFlow codebase, executed per `docs/tasks/011-fable-review-app-overview.md`. Sources: the 16-file ai-handoff package (`docs/ai-handoff/`), spot-verified against current code on branch `development`.

**Nothing was fixed or migrated in this pass** (per the task's constraints). Every finding is a self-contained ticket written to be executable by a lower-level agent (Sonnet/Opus): goal, evidence with file paths, decision points already isolated, ordered steps, EARS-style acceptance criteria, and an explicit breakage check. Database changes are never to be applied directly — the relevant tickets contain the manual migration instructions instead.

## How to hand off a ticket

Give the agent: the one ticket file + `docs/ai-handoff/14-ai-agent-context.md` + `CLAUDE.md`. Tickets marked with a **Decision point** section need an owner answer *before* implementation — the options and a recommendation are already written in each.

## Issues (bugs, spec deviations, vulnerabilities) — `issues/`

| ID | Title | Module | Priority | Needs owner decision first? |
|---|---|---|---|---|
| ISS-001 | **DO NOT IMPLEMENT - SKIP THIS TICKET** I already verified `org_id` is uuid in all of the tables |
| ISS-002 | **DO NOT IMPLEMENT - SKIP THIS TICKET** | I already have a cancel delivery function no need for revert funcitonality |
| ISS-003 | Monthly recurrence: dead schema fields, `dueDatesFor()` weekly-only | deliveries | P3 | **Yes** (implement vs retire) |
| ISS-004 | Non-transactional status/edit writes (partial-write risk) — includes RPC migration instructions | deliveries / db | P2 | Partly (RPC vs optimistic lock) |
| ISS-005 | UI edit guard vs documented RLS UPDATE policy mismatch | customers | P2 | **Yes** (owner override or not) |
| ISS-006 | Upload dialog never persists a file — includes storage/column migration instructions | documents / db | P1 | **Yes** (size/type/retention) |
| ISS-007 | `/playground` lets any user trigger real outbound email | security | **P1** | Light (delete vs gate; delete recommended) |
| ISS-008 | Defense-in-depth `auth()` in `(protected)` layout + prod-gate middleware logging | security / auth | P1 | No |
| ISS-009 | `docs/DATABASE.md`: expenses placeholder, documents undocumented, `auth.uid()` outlier table | database docs | P2 | No (needs live DB read access) |
| ISS-010 | Notification unread undercount (>30) + unbounded toast queue | notifications / ui | P3 | No |

## Architecture improvements — `architecture-improvements/`

| ID | Title | Priority | Needs owner decision first? |
|---|---|---|---|
| ARC-001 | Server-side list filtering/search/pagination (customers first, then propagate) | P1 | No |
| ARC-002 | CI workflow (lint+typecheck+test) + `typecheck` script | P1 | No |
| ARC-003 |  (deleted) I already has a seperate repo for supabase migration for project security purposes.
| ARC-004 | Shared mutation-hook factory (`useEntityMutation`) | P2 | No |
| ARC-005 | Role-aware `guards.ts` predicates mirroring RLS | P2 | No (after ISS-005) |
| ARC-006 | Server-authoritative timestamps (`updated_at` trigger) — includes migration instructions | P2 | No |
| ARC-007 | Resolve Zustand and remove tanstack-table and react-table conflict in docs | P2 | **Yes** (two decisions) |
| ARC-008 | Testing gaps: backfill documents/notifications, move misplaced files; component-harness question | P2/P3 | Part 2 only |
| ARC-009 | Production error monitoring | P1 (decision) | **No - DO NOT IMPLEMENT SKIP THIS** (vendor/budget/PII) |
| ARC-010 | ADR renumbering (duplicate 0009, 3-digit 003) | P3 | No |

## ADRs added by this review (`docs/adr/`)

- `0011-middleware-lives-in-proxy-ts.md` — records that `src/proxy.ts` is confirmed-active middleware (proposed, retroactive).
- `0012-versioned-supabase-schema-changes.md` — migrations-required rule (proposed; accepted when ARC-003 lands).
- `0013-client-state-and-table-standards.md` — placeholder for the ARC-007 decisions (proposed).

## Supabase files
- I created the seperate supabase repo for security purposes. If you need to peek or validate a table schema use the `C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\water-station-supabase\supabase\migrations` folder as reference and check, since this is the source of truth for my tables as it contains the real migration files.
- My suggestion is read all of my migration before executing or implementing any issues or architecture suggestion.

## Migration
- If a issue or suggestion needs a table change, create a migration script in `docs\ai-handoff\fable-review-2026-07-14\migrations` with the proper name of the file. also do not bloat or create a big migration fiel that has many different tables in it.
- 
## Suggested execution order

1. **ISS-001** (P0 — everything DB-related keys off the verified `org_id` type), then **ARC-003** (the baseline mechanically answers ISS-009 too).
2. **ISS-007** and **ISS-008** (security, low effort, no dependencies).
3. **ARC-002** (CI — protects everything that follows).
4. Owner decision batch: ISS-002, ISS-003, ISS-005, ISS-006, ARC-007, ARC-009 (answers unblock the rest).
5. Remaining P2/P3 in any order; ARC-001 before/alongside any list-page work.

## What was NOT re-reviewed

Live Supabase schema/RLS (no project access — that's why ISS-001/ISS-009 exist), Edge Function sources (outside the repo), git history secret scan, dependency CVE audit (`npm audit` not run), and no penetration testing. See `docs/ai-handoff/10-security-and-risks.md` for the standing scope caveats. Strong areas deliberately left alone: RLS-first tenant isolation, the four-shape type model + mappers, service-layer error discipline, the confirm-dialog pattern (see `11-quality-and-improvements.md` "Areas already strong").



