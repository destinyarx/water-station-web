# ADR 0015 — Operational rows are org-shared; ownership guards the record, not the work

- **Status:** Accepted
- **Date:** 2026-07-15
- **Feature:** `docs/tasks/013-bugs-and-improvement.md`
- **Migration:** `supabase/migrations/20260715000000_shared_operational_queue_rls.sql`
- **Supersedes:** `docs/ai-handoff/fable-review-2026-07-14/migrations/[skip] 004-shared-operational-queue-rls.sql` (never applied; kept as history, **must not be run** — see below)

## Context

Migration 004 was written by the 2026-07-14 review, renamed to `[skip] 004-…`,
and never applied. Nobody recorded why. Three bugs reported in
`docs/tasks/013` — maintenance "complete" doing nothing, schedule "set inactive"
doing nothing, product delete doing nothing — all traced back to that skip.

The pre-004 policies allow an update only if the caller is an org admin **or**
personally created the row (`"Admins/org_owners or creator can update …"`).
A staff member acting on a row the owner created fails the `USING` check.
Postgres does not raise on an RLS `USING` miss — it matches **zero rows**, and
PostgREST returns `error: null`. Every service checked only `error`, so the
mutation reported success, the toast fired, and `invalidateQueries` refetched
the unchanged row. The three "bugs" were one permission model surfacing as a lie.

That model contradicts the domain. `CONTEXT.md` line 38 lists **maintenance
tasks** under what staff can manage; the **Maintenance Task** entry defines one
as "a single dated upkeep job **staff actually perform**"; the **Assignee** entry
defines it as "the org staff member responsible for a task". Under the old
policies a task assigned to a staff member could not be completed by that staff
member. The assignee field pointed at a person the database forbade from acting.

**Why 004 itself could not be applied.** Its `WITH CHECK` clauses on `products`,
`deliveries`, and `maintenance_tasks` read
`with check (private.is_org_member(org_id) and deleted_at is null)`. `WITH CHECK`
is evaluated against the **new** row, so any update setting `deleted_at` fails it.
That makes soft-delete impossible for *everyone*, owners included: it breaks
`softDeleteProduct`, and `pauseSchedule`, which archives future pending
`deliveries` rows. 004 contradicts itself — `guard_shared_queue_archive` fires on
`old.deleted_at is null and new.deleted_at is not null`, and
`guard_product_member_update` lists `deleted_at` among its protected columns.
Both triggers exist to police an operation the policies forbid outright. The two
tables that got it right (`maintenance_schedules`, `delivery_schedules`) omit
`deleted_at` from `WITH CHECK`. This is the most likely reason someone typed
`[skip]`: applying it broke product delete and schedule pause on contact.

## Decision

Ship a new migration carrying 004's intent with that bug fixed. **Operational
rows belong to the organization, not to whoever typed them in.** Any org member
may act on the work; ownership still guards the record's identity and its removal.

`WITH CHECK` omits `deleted_at` on every table; `USING` keeps `deleted_at is
null`, which is what actually matters — an archived row still cannot be updated
or un-archived. Per table:

- **`maintenance_tasks`, `maintenance_schedules`, `deliveries`,
  `delivery_schedules`** — any `is_org_member(org_id)` may update. Staff complete
  the work they are assigned. Archiving a *schedule* stays owner-only via
  `private.guard_shared_queue_archive`, which raises rather than silently
  filtering. Members pause a schedule; only an owner archives it. `deliveries`
  gets no archive guard: `pauseSchedule` archives future pending occurrences and
  that is a legitimate member action.
- **`products`** — the update policy widens to any org member, but
  `private.guard_product_member_update` raises if a non-admin, non-creator
  changes `product_name`, `price`, `is_stock_tracked`, `descriptions`,
  `is_active`, `org_id`, `created_by`, or `deleted_at`. `stock` is deliberately
  absent from that list. So staff may **adjust stock on any product** — the
  person physically moving containers records what moved — while name, price,
  discontinuation and deletion remain owner-or-creator. This preserves
  `CONTEXT.md` lines 42–44 exactly, and turns the silent failure into a
  catchable error.

### Write guards

Independently of RLS, **a write that changes nothing must not report success.**
Mutating services append `.select('id')` and throw a `NOT_PERMITTED` message when
the result is empty. This is deliberately **not** applied everywhere:

- **Archive paths are exempt.** The SELECT policy filters `deleted_at is null`
  (`docs/DATABASE.md`), so an `UPDATE … RETURNING` that sets `deleted_at` cannot
  see its own row — a `.select()` guard there would fail on *success*. Archive
  refusals surface via the two raising triggers instead.
- **Bulk writes are exempt** (`markAllNotificationsRead`, the occurrence archive
  in `pauseSchedule`): zero rows is a legitimate outcome.
- **`.select(…).single()` paths were already guarded** — `single()` errors on
  zero rows. `updateProduct`, `updateCustomer`, `updateDocument`,
  `setDocumentApproval`, `updateExpense` and `markNotificationRead` needed no
  change. Expenses and notifications needed no change at all.

Guards must run **before** any dependent write. A refused `completeTask` that
still rolled the schedule forward would leave two pending occurrences and break
ADR 0006's invariant; a refused `pauseSchedule`/`resumeSchedule` that still
archived or materialized occurrences would corrupt the delivery queue.

## Alternatives considered

**Keep the strict pre-004 policies.** This was the initial instinct, and it is
correct for products — staff genuinely should not delete another user's product.
It is incoherent for maintenance and deliveries: it makes the assignee field
decorative and leaves the module operable only by the owner, contradicting
`CONTEXT.md` and the delivery specs ("As a staff member, I want to mark a
delivery as completed" — `docs/specs/004-deliveries-module/deliveries-prd.md`).
Keeping it would have required rewriting the domain docs to match the accident.

**Fix 004's three `WITH CHECK` lines in place and apply it.** Rejected: 004 was
already rejected once and renaming a `[skip]` file back into service hides that
history. A new migration under `supabase/migrations/` also starts the versioned
sequence ADR 0012 asks for.

**Restrict task completion to the assignee.** Rejected: stronger on paper, but a
station is a small shared floor. Staff cover each other's shifts, and a task
nobody can close because its assignee called in sick is worse than a task anyone
on shift can close. The `completed_by` stamp already records who actually did it.

**Guard archive paths with a follow-up SELECT.** Rejected: costs a round-trip per
delete to re-derive what the triggers already report.

## Consequences

- Staff can silently pause a recurring schedule, stopping future upkeep from
  generating. Accepted: pausing is reversible and visible in the Inactive filter,
  unlike archiving, which stays owner-only.
- `CONTEXT.md` lines 42–44 gain a stock carve-out (staff adjust stock on any org
  product). Recorded here and in the glossary's **Stock adjustment** entry.
- Deleting a product you did not create now returns an explicit error where it
  previously appeared to succeed. This is a visible behaviour change, and the
  intended one.
- Archive refusals on `customers`, `expenses` and `documents` remain silent — no
  raising trigger covers them, and no client guard can. Not closed here; it is
  the same latent bug class and wants its own migration.
- Per project rule (ADR 0012), the migration is written but not applied by an
  agent. A human runs it.
