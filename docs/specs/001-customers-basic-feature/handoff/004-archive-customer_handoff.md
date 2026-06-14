# Handoff — Issue 004: Archive Customer

> **Blocked by Issue 001** (foundation + active list). Reuses the service layer,
> query keys, and tenant-scoped access. See
> `001-customer-foundation-and-active-list_handoff.md`.

## Current Feature Context

Tenant-scoped customer management (Clerk auth + Supabase RLS). This slice adds the
**archive (soft-delete)** flow. Archiving sets `deleted_at` instead of hard-deleting;
archived rows disappear from the default active list but remain in the DB for future
reporting/audit. Restoring archived customers is **out of scope**. Full PRD:
`docs/specs/001-customers-basic-feature/prd.md`. Feature code: `src/features/customers/`.

## Exact Issue to Implement

Source of truth: `docs/specs/001-customers-basic-feature/issues/004-archive-customer.md`
(covers user stories 5, 6, 11, 12).

A registered user archives a customer they own → sets the archive marker
(`deleted_at`) without hard-deleting. Archived customers vanish from the default
active list but stay queryable. Pending + error states shown; active list refreshes
/ invalidates after success; cross-tenant archive blocked.

Acceptance criteria — see the issue file. Summary: tenant owner can archive their
own customer; archive updates `deleted_at` (not a hard delete); archived rows hidden
from default active list; blocked for customers outside the current tenant; pending
+ error states; record remains in DB; active list refreshes/invalidates on success.

## Files to Read First

- `docs/CONSTITUTION.md`, `docs/ARCHITECTURE.md`, `docs/CODING_STANDARDS.md`, `docs/SECURITY.md`, root `AGENTS.md`
- `docs/specs/001-customers-basic-feature/prd.md` — Edge Cases + Out of Scope
  (archive is an update to `deleted_at`, NOT delete-and-reinsert; no restore flow).
- Output of Issue 001: `services/customers.service.ts` (active-list query already
  filters `deleted_at is null`), `customers.keys.ts`, `components/customers-columns.tsx`.
- Issue 002/003 mutation hooks (`use-create-customer.ts` / `use-update-customer.ts`)
  for the mutation + invalidation pattern to mirror.

## Files Likely to Modify / Create

```
src/features/customers/
  services/customers.service.ts      # add archiveCustomer(id) — UPDATE deleted_at = now()
  hooks/use-archive-customer.ts      # useMutation; invalidate customerKeys.lists() on success
  components/customers-columns.tsx    # add "Archive" row action (with pending/disabled state)
  components/archive-customer-dialog.tsx  # optional confirm dialog (shadcn dialog)
  index.ts
```
- Confirm the active-list query from Issue 001 excludes `deleted_at not null`
  (should already); no schema change expected.

## Commands to Run

```sh
bun run test
bun run lint
bunx tsc --noEmit
bun run build
```

## Tests Required

- Service: `archiveCustomer` issues an UPDATE that sets `deleted_at` (asserts it is
  **not** a delete); throws user-friendly error on failure.
- List behavior: archived rows excluded from the default active list; row remains
  retrievable when the archived set is requested.
- RLS: archiving a customer outside the current tenant fails (manual or integration
  test, TASKS.md Phase 5).

## Constraints (AGENTS.md / ARCHITECTURE.md / SECURITY.md)

- **Archive = soft-delete**: update `deleted_at`, never hard-delete the row (issue
  note + PRD). No delete-and-reinsert.
- All Supabase calls in `services/`; UI → validation → service → Supabase → RLS.
- TanStack: array query keys; mutation **invalidates** `customerKeys.lists()` (and
  detail if applicable) so the active list refreshes after success.
- Show pending + error states on the archive action (disable while pending).
- TS strict (no `any`/`@ts-ignore`/unsafe casts); explicit return types; single
  quotes TS / double quotes JSX props; kebab-case files.
- **Security**: RLS enforces tenant isolation — cross-tenant archive must fail even
  with a known ID; the archive (update) policy must restrict to the owning tenant;
  never weaken RLS; no raw DB errors to users. Archived data stays queryable for
  audit. `SECURITY.md`: don't delete rows without approval (soft-delete only here).

## Done Definition

- A registered user can archive a customer they own; `deleted_at` is set, the row
  remains in the DB, and it disappears from the active list (which invalidates on
  success). Pending + error states work.
- Cross-tenant archive fails safely; RLS archive/update policy verified + documented.
- `test`, `lint`, `tsc --noEmit`, `build` pass; no `any`; no secrets exposed.
- Report: files changed, summary, assumptions, commands run, results, manual steps.

## Suggested Skills

- A TDD / test-driven skill if available (service test asserting soft-delete, not
  hard delete; list-exclusion test first).
- `superpowers:brainstorming` only if the confirm-dialog UX is unclear; otherwise proceed.
