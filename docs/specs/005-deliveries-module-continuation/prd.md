---
title: Deliveries Module Continuation (005)
status: ready-for-agent
feature: 005-deliveries-module-continuation
supersedes-partially: docs/adr/0002-deliveries-two-entity-rolling-materialization.md (terminal-status assumption)
related-adr: docs/specs/005-deliveries-module-continuation/adr-0003-delivery-status-stock-and-revert.md
---

# PRD — Deliveries Module Continuation (005)

> Tracker note: this repo has no configured issue tracker / triage label
> vocabulary, so this PRD is published as a markdown file in the feature folder
> (consistent with how `004-deliveries-module` was handled). The
> `ready-for-agent` status lives in the frontmatter above.

## Problem Statement

As a water station owner or staff member, the deliveries page only lets me
create a one-time delivery and see a flat list of every active delivery. I
cannot:

- tell at a glance what actually needs doing **today** versus what is just
  scheduled far ahead, or what is overdue from previous days;
- move a delivery through its real operating lifecycle (`pending` →
  `for_delivery` → `completed`/`failed`) from the table, or undo a status I set
  by mistake;
- keep my product **stock** correct when goods leave on a delivery run;
- run **recurring** schedules (e.g. "Juan, every Tue/Thu") and stop/resume them
  around holidays or slow periods;
- get finished and failed runs out of my working list while still being able to
  review them;
- work with more than a handful of rows — everything loads at once and the
  layout (cards, columns, icons) is cluttered and hard to scan.

## Solution

Reshape the deliveries page around the **current delivery queue** — what is
actionable now — and split everything else into focused, paginated views:

- A **main queue** datatable showing only `pending` and `for_delivery`
  occurrences that are overdue, due today, or each active schedule's nearest
  upcoming run. Row actions move a delivery through its lifecycle.
- A **History** modal (`completed` + `failed`), where terminal rows are
  read-only but can be reverted to re-open them.
- A **Recurring schedule list** modal (parent schedules) with a single
  Stop/Resume action.
- Three metric cards scoped to **today**: Active (today's pending), Pending
  (previous-days backlog), Completed (completed today).
- **Stock** is deducted when a stock-tracked delivery is dispatched
  (`for_delivery`) and restored if it comes back, with negative stock blocked.
- All three datatables use **server-side prev/next pagination**.

## User Stories

1. As staff, I want the main deliveries page to show only what is actionable now
   (overdue, due today, or the next upcoming run per schedule), so that I am not
   distracted by deliveries two weeks out.
2. As staff, I want a recurring schedule's far-future occurrences to stay out of
   the "current" queue until they become the nearest upcoming run, so that the
   queue stays short.
3. As staff, I want to see overdue `pending` deliveries from previous days in
   the queue, so that nothing silently falls through the cracks.
4. As staff, I want to change a delivery's status from a row action menu, so
   that I can run the day without opening each record.
5. As staff, I want the menu to offer only legal next statuses for the row's
   current status, so that I cannot make an invalid transition.
6. As staff, I want moving a delivery to `for_delivery` to auto-stamp who
   dispatched it, so that I do not have to pick a person manually.
7. As staff, I want marking a delivery `failed` to require failure remarks, so
   that the reason is always recorded.
8. As staff, I want to revert a `completed` or `failed` delivery back to
   `pending`/`for_delivery`, so that I can fix a status I set by mistake.
9. As staff, I want a reverted delivery that lands on `pending` to become
   editable again, so that I can correct its items before re-running it.
10. As an owner, I want stock-tracked products to be deducted from inventory
    when a delivery is dispatched, so that my stock count reflects goods that
    have physically left the station.
11. As an owner, I want a dispatch that would drive stock below zero to be
    blocked with a clear warning, so that I never record impossible inventory.
12. As an owner, I want stock restored when a dispatched delivery is marked
    `failed` or reverted, so that returned goods are counted back in.
13. As an owner, I want non-stock products (refills, fees) to never affect
    stock, so that services are not mistaken for physical inventory.
14. As staff, I want completion to record the real date/time it was completed
    (which may differ from the planned delivery date), so that reporting matches
    what actually happened.
15. As staff, I want a recurring (weekly) schedule so that a customer's
    standing order generates its own dated deliveries automatically.
16. As staff, I want the weekly frequency to be derived from the weekdays I pick
    (not a separate count), so that the schedule cannot contradict itself.
17. As staff, I want a "Stop" action on a recurring schedule that pauses it and
    clears its today-and-future pending runs, so that I can halt a customer's
    deliveries cleanly.
18. As staff, I want stopping a schedule to keep in-flight (`for_delivery`) runs
    and all history, so that I do not lose work already underway or done.
19. As staff, I want to resume a stopped schedule weeks later and have it
    continue on its original rhythm from the current date, without back-filling
    the paused gap, so that the customer's cadence is preserved.
20. As staff, I want a Recurring schedule list modal that shows each schedule's
    recipient, recurrence, and next upcoming date, so that I can review standing
    orders in one place.
21. As staff, I want a History modal with completed and failed deliveries, so
    that my main queue is not cluttered with finished work.
22. As staff, I want failed deliveries in history to show their failure remarks,
    so that I can see why each one failed.
23. As staff, I want completed and failed rows to be visually distinct, so that
    I can scan outcomes quickly.
24. As staff, I want every deliveries datatable to page forward and back without
    loading everything at once, so that large histories stay fast.
25. As staff, I want the date, status, and total columns sized to their content,
    so that the wider columns (recipient, items) get the space.
26. As staff, I want stock-tracked and non-stock products to show different
    icons, so that I can tell services from physical goods at a glance.
27. As staff, I want status and sort filters with clear icons, so that I can
    tell the filters apart quickly.
28. As an owner, I want the top cards (Active today / Pending backlog /
    Completed today) to be clean, balanced, and clearly labelled for "today",
    so that the day's status reads at a glance.
29. As a user in an organization, I want every delivery view scoped to my
    station, so that I never see another station's data.

## Implementation Decisions

### Domain model (unchanged from 004, extended here)

- Two entities remain: `delivery_schedules` (the plan/recurrence rule) and
  `deliveries` (dated occurrences). See `CONTEXT.md` glossary and ADR 0002.
- New glossary terms govern this work: **Current delivery queue**, **Delivery
  History**, **Recurring schedule list**, **Stop / Resume**, **Stock-out
  window** (all in `CONTEXT.md`).

### Three views / datatables

1. **Main current queue** — `pending` + `for_delivery` occurrences that are
   overdue (`delivery_date < today`), due today, **or** the single nearest
   upcoming occurrence per `active` schedule. Backed by a new read-only view
   `v_current_deliveries`.
2. **History modal** — `completed` + `failed` occurrences. Read-only except
   status revert. Sorted most-recent first.
3. **Recurring schedule list modal** — parent `delivery_schedules` rows with
   recurrence summary and derived next-upcoming date; the only action is
   Stop/Resume.

### Status lifecycle, stock, and revert (see ADR 0003 — authoritative)

- Stock is "out" iff status ∈ `{ for_delivery, completed }`, "in" iff ∈
  `{ pending, failed }`. Only `is_stock_tracked` products move stock.
- A transition compares old class vs new class: in→out **deducts**, out→in
  **restores**, same-class does nothing. Deduction is atomic and blocks
  negative stock (`update products set stock = stock - qty where id = ? and
  stock >= qty`; zero rows ⇒ reject with a warning).
- Derived field rules, applied uniformly to forward and revert transitions:
  - `completed_at` = `now()` iff new status is `completed`, else `null`.
  - `failure_remarks` required iff new status is `failed`, else cleared.
  - `delivered_by` stamped with the acting Clerk user on entering
    `for_delivery`.
- `completed`/`failed` are **reversible** (the only structural change from the
  old "terminal" design). The full legal-transition map is in ADR 0003.
- The transition decision is centralized in a **pure function**
  (`resolveStatusTransition(from, to, items)`) returning legality, stock deltas,
  and the derived field changes — so forward and revert share one
  implementation.
- A status change writes `deliveries` (+ `products.stock`) and then
  **invalidates** the deliveries / current-queue / schedules query keys. It
  **never** writes `delivery_schedules`.

### Editing

- A delivery occurrence is editable **only while `pending`** (items, notes,
  date). `for_delivery`, `completed`, `failed` are locked; the path to edit is
  revert → `pending`.

### Recurring schedules + materialization

- Weekly recurrence: pick weekdays (ISO 1=Mon..7=Sun) + `interval_weeks`;
  frequency is **derived** from the selected weekdays. (Monthly mode and
  `start_date`/`end_date` anchoring already exist in the schema; wiring them is
  staged per the issues but the math lives in one generator.)
- A pure generator `dueDatesFor(schedule, fromDate, horizon)` turns a recurrence
  rule into concrete due dates; a client-triggered, idempotent top-up
  materializes missing occurrences within the rolling horizon (unique
  `(schedule_id, delivery_date) where deleted_at is null`).
- **Stop** = set schedule `status = 'paused'` and soft-delete its `pending`
  occurrences with `delivery_date >= today`. Keep `for_delivery`, terminal
  history, and overdue (`< today`) pending. **Resume** = set `active`;
  materialization continues forward from today on the original `start_date`
  anchor; the paused gap is not back-filled.
- Schedule **editing** and owner-only **archive** remain out of scope for 005
  (deferred per the user).

### Server-side pagination

- Offset-based, **prev/next only** (no total count / no page numbers).
- Fetch `pageSize + 1` rows via `.range(offset, offset + pageSize)`; if
  `pageSize + 1` returned, there is a next page — drop the extra before render.
  Encapsulated in a pure `applyLimitPlusOne(rows, pageSize)` helper.
- Applied uniformly to all three datatables (main queue reads
  `v_current_deliveries`).

### Metric cards (all "today"-scoped; bounded counts)

- **Active (today):** `pending` AND `delivery_date = today`.
- **Pending (backlog):** `pending` AND `delivery_date` in `[today−7, today−1]`.
- **Completed (today):** `completed` AND `completed_at::date = today`.
- Each is a bounded `count: 'exact', head: true` query (cheap because scoped to
  a day/week — distinct from the unbounded count avoided in pagination).
- Replaces the old "Reference data" card; cards get balanced spacing and
  distinct icons.

### Schema changes (migration script in this folder, HITL)

Exactly two objects — no new tables, no enum changes:

1. `alter table public.deliveries add column completed_at timestamp;`
2. `create view public.v_current_deliveries with (security_invoker = on) as …`
   encoding the current-queue selection (overdue + today + nearest-upcoming
   per active schedule), so base-table RLS still applies.

The migration is delivered as a runnable SQL markdown file and applied manually
in the Supabase dashboard. Implementation/testing of the features above is
gated on that migration being applied (a separate issue, like 004's issue 002).

### Security / multi-tenancy (unchanged invariants)

- `org_id` and `created_by`/`delivered_by` come from the Clerk session, never
  form input.
- All reads stay org-scoped via RLS; the view uses `security_invoker` so it does
  not bypass RLS.
- Soft-deleted rows excluded from active lists.

## Testing Decisions

A good test here asserts **external behavior** through the highest seam, not
implementation details. Prior art: `src/features/deliveries/tests/` already has
pure `schema`/`mapper` tests and service tests using a hand-rolled
`SupabaseClient` mock (`deliveries.service.test.ts`). Follow those patterns; no
new test infrastructure.

Modules and seams to test:

1. **`resolveStatusTransition` (pure, highest seam)** — for every cell of the
   ADR-0003 transition map: legality (illegal edges rejected), stock deltas
   (deduct/restore/none by class), `completed_at` set/clear, `failure_remarks`
   require/clear, `delivered_by` stamping. This is the heart of the feature and
   needs the densest table-driven tests.
2. **`dueDatesFor` (pure)** — weekly weekdays, `interval_weeks` skipping,
   monthly `day_of_month` with month-end clamp, `end_date` cutoff, horizon
   bound, and start-anchor phase consistency.
3. **`applyLimitPlusOne` (pure)** — returns `hasNext = true` and drops the extra
   row when `pageSize + 1` rows are given; `hasNext = false` otherwise.
4. **Status-update service (hand-rolled Supabase mock)** — atomic stock guard
   rejects with a friendly error when the `.gte('stock', qty)` update affects
   zero rows; `delivered_by`/`completed_at` written on the right transitions;
   non-stock items skip the stock write; Supabase errors become friendly
   messages.
5. **Stop/Resume service (mock)** — Stop sets `paused` and issues the soft-delete
   for `pending` rows dated `>= today` only; Resume sets `active`. Assert the
   exact filter, not internal call counts.
6. **`v_current_deliveries`** — verified by the migration file's manual SQL
   checks (overdue + today + nearest-upcoming appears; far-future and paused
   schedules excluded; cross-org returns nothing), mirroring 004's manual RLS
   verification section. Not a unit test.

Do not test: TanStack Query invalidation wiring, component render details, or
exact mock call sequences — assert observable outcomes (rows written, errors
thrown, dates returned).

## Out of Scope

- Schedule **editing** (changing a recurring rule/template after creation).
- Owner-only **archive** (`ended` / soft delete of the schedule itself).
- A `stock_movements` ledger / inventory audit history (ADR 0003 chose direct
  mutation; ledger is the documented upgrade path).
- Editing a delivery while `for_delivery`/`completed`/`failed` (revert first).
- Total counts / numbered pagination.
- Any change to enums or to the two-entity model.
- Description items #3 and #4 (garbled placeholders — excluded until specified).

## Further Notes

- Current built state: only issue 003 (one-time create + flat list) exists;
  issues 004–008 from `004-deliveries-module` were specced but not implemented.
  005 absorbs and supersedes their intent with the decisions above (notably:
  terminal statuses are now reversible, and stock deducts at dispatch).
- Authoritative decision record: ADR 0003 in this folder. Glossary: `CONTEXT.md`.
- Migration is HITL — implementation issues must confirm it is applied before
  coding against the new column/view.
