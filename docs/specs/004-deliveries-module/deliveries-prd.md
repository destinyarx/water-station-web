# PRD — Deliveries Module (004)

> Formal PRD synthesized from the grilling session. Companion documents in this
> folder: `prd.md` (narrative), `REQUIREMENTS.md` (EARS), `ACCEPTANCE.md`,
> `research.md`, `004-deliveries-schema.md` (migration), `issues/001-foundation.md`.
> Architecture rationale: `docs/adr/0002-deliveries-two-entity-rolling-materialization.md`.
> Domain terms: `CONTEXT.md` → "Deliveries Domain".

Labels: `ready-for-agent`

## Problem Statement

A water refilling station owner and their staff need to plan and carry out
customer deliveries, but the deliveries they handle come in two very different
shapes: ad-hoc one-time drop-offs, and recurring refills that predictable
customers (households, offices, stores) expect on fixed days — daily, weekly,
every two weeks, or monthly. Today there is no system for this. Staff rely on
memory or paper, which means upcoming refills get forgotten, failed delivery
attempts leave no record, and there is no reliable history tying a delivery to
the customer, the exact products delivered, and the price charged at that time.
Because the business is multi-tenant, each station must only ever see its own
deliveries.

## Solution

A Deliveries module where a user defines a **Delivery Schedule** — who is served
(an existing customer or a guest label), what products/services are included, and
when (a single date, or a recurring rule). From each schedule the system produces
**Deliveries**: individual dated runs that staff actually prepare and complete.

Recurring runs appear automatically for the next two weeks, so staff always have a
concrete, actionable list of what to deliver and to whom — without anyone
generating endless future records. Each run moves through a clear status
lifecycle (pending → for delivery → completed or failed); a failed run forces the
staffer to record why. Every run keeps a snapshot of the products and prices used,
so later price changes never rewrite history. Owners oversee everything and are
the only ones who can remove a whole schedule; any staff member can work the
shared delivery queue day to day.

## User Stories

1. As a station owner, I want to create a one-time delivery for a specific future
   date, so that I can serve a customer who ordered only this once.
2. As a station owner, I want to create a recurring delivery schedule, so that I
   don't have to re-enter a regular customer's order every time.
3. As a staff member, I want to attach a delivery to an existing customer, so that
   the customer's name and address are pulled in automatically and stay current.
4. As a staff member, I want to create a delivery for a walk-in or one-off
   recipient using just a name, so that I can serve people who aren't saved
   customers.
5. As a staff member, I want to add optional contact number and address to a guest
   delivery, so that the driver can find and reach them.
6. As a station owner, I want a recurring schedule to repeat on the specific
   weekdays I pick (e.g. Mon and Thu), so that it matches the customer's real
   routine.
7. As a station owner, I want the system to show me the frequency derived from the
   weekdays I picked (e.g. "2× per week"), so that I don't have to enter a count
   that could contradict my day selection.
8. As a station owner, I want to schedule a delivery every two weeks, so that I can
   serve customers on a bi-weekly cadence.
9. As a station owner, I want to schedule a delivery once a month on a chosen day,
   so that I can serve monthly customers.
10. As a station owner, I want monthly schedules set to day 31 to fall on the last
    day of shorter months, so that February deliveries still happen.
11. As a station owner, I want to set a start date for a recurring schedule, so
    that the recurrence is anchored correctly for interval calculations.
12. As a station owner, I want to set an optional end date on a recurring schedule,
    so that it stops producing deliveries after a known point.
13. As a staff member, I want upcoming recurring deliveries to appear
    automatically for the next two weeks, so that I have a ready work list without
    generating anything manually.
14. As a staff member, I want reloading the deliveries page not to create
    duplicate runs, so that my list stays clean.
15. As a staff member, I want each delivery to list its products with quantities
    and prices, so that I know exactly what to prepare.
16. As a staff member, I want to override the price on a line item, so that I can
    apply a discount or special price for a delivery.
17. As a station owner, I want past deliveries to keep the product name and price
    as they were at delivery time, so that changing a product later doesn't distort
    my records.
18. As a staff member, I want to mark a delivery as "for delivery", so that I can
    show it's out with the driver.
19. As a staff member, I want the system to record me as the one who took the
    delivery out, so that we know who handled it without assigning it manually.
20. As a staff member, I want to mark a delivery as completed, so that we know it
    was successfully delivered.
21. As a staff member, I want to mark a delivery as failed and be required to enter
    remarks, so that there is always a reason recorded for a failed attempt.
22. As a station owner, I want a failed delivery not to stop the customer's
    recurring schedule, so that the next scheduled delivery still happens.
23. As a staff member, I want to add general notes to any delivery, so that I can
    record timing hints or special instructions.
24. As a staff member, I want to edit the items, notes, or date of a single
    delivery run without affecting the schedule or other runs, so that I can handle
    a one-off change for just that day.
25. As a station owner, I want to pause a recurring schedule, so that I can stop
    new deliveries while keeping the existing ones and the history.
26. As a station owner, I want editing a schedule's recurrence or products to apply
    only to future deliveries, so that runs my staff already prepared aren't
    silently changed.
27. As a station owner, I want dropping a weekday from a recurrence to leave
    already-created runs in place, so that nothing staff prepped disappears
    unexpectedly.
28. As a staff member, I want to filter deliveries by date range (today, next 7,
    next 14), status, and customer, so that I can focus on the work that matters
    now.
29. As a staff member, I want a row menu that only offers valid next statuses, so
    that I can't accidentally move a delivery into an impossible state.
30. As a station owner, I want only owners to be able to remove an entire schedule,
    so that staff can't wipe a regular customer's whole arrangement.
31. As a staff member, I want to work any delivery in our station's queue
    regardless of who created it, so that the team can share day-to-day operations.
32. As any user, I want to see only my own station's deliveries, so that another
    station's data is never exposed to me.
33. As a station owner, I want archiving a schedule to remove its future pending
    runs from the active list while keeping completed and failed history, so that
    my records stay intact.
34. As a staff member, I want clear loading, empty, and error states on every
    view, so that I always understand what the system is doing.
35. As a staff member, I want a friendly message when something fails to save, so
    that I know to retry instead of losing work silently.
36. As a staff member, I want the submit button disabled while a save is in
    progress, so that I don't double-submit a delivery.
37. As a staff member, I want the lists to refresh after I save, so that I see my
    change without reloading the page.

## Implementation Decisions

**Architecture (see ADR 0002).** Two-entity model: `delivery_schedules` (the plan
/ recurrence rule, with a materialization-controlling `status` of
`active`/`paused`/`ended`) is separate from `deliveries` (individual dated
occurrences carrying the operational status). Product lines exist twice:
`delivery_schedule_items` (template) and `delivery_items` (per-occurrence
snapshot capturing `product_name` and `unit_price`).

**Recurrence model.** `recurrence_type` enum: `one_time` | `weekly` | `monthly`.
Frequency is never entered as a separate number — it is derived from the selected
weekdays, removing the mismatch risk. Shape per type (also enforced by a DB CHECK):

- `one_time` → `delivery_date`.
- `weekly` → `weekdays smallint[]` (ISO 1–7) + `interval_weeks` (1 = weekly, 2 =
  bi-weekly), anchored on `start_date`.
- `monthly` → `day_of_month` (1–31, clamped to month end) + `interval_months`,
  anchored on `start_date`.
- Optional `end_date` for recurring schedules.

**Materialization.** Rolling 14-day horizon. A client-triggered, idempotent
"ensure upcoming deliveries" routine runs on deliveries-view load and inserts only
missing occurrences within the window; idempotency enforced by a unique index on
`(schedule_id, delivery_date)` for active rows. On materialization, template items
are copied into snapshot items (unit price = template override if present, else the
product's current price). No cron/edge job in v1; the trigger point is replaceable
later without schema change.

**Schedule vs. delivery independence.** Schedule edits affect future
materialization only; existing occurrences are immutable to schedule edits and
individually editable. A failed occurrence never alters its schedule. Only an
explicit `active → paused` transition halts generation.

**Status lifecycle.** `pending → for_delivery → completed | failed`. `completed`
and `failed` are terminal (no reopen; reschedule = a new run). Moving to
`for_delivery` auto-stamps `delivered_by` with the acting Clerk user. `failed`
requires non-empty `failure_remarks` (form validation + DB CHECK). General `notes`
is always optional and distinct from failure remarks.

**Customer vs. guest.** Nullable `customer_id` (FK → `customers`) XOR nullable
`guest_name` (+ optional `guest_contact`, `guest_address`), enforced by a DB
CHECK. A linked customer's name/address are read live, not copied.

**Tenancy & roles (RLS).** Every table scoped by `org_id`; `org_id`/`created_by`
written from Clerk identity, never form input. Shared org queue: any org member may
read/create/update schedules and occurrences. The only owner-restricted action is
soft-deleting (archiving) a `delivery_schedules` row — enforced by allowing a
non-null `deleted_at` in the UPDATE `with check` only when the `is_owner` claim is
true. Soft delete via `deleted_at`; active lists exclude soft-deleted rows.

**Column types.** Calendar fields (`delivery_date`, `start_date`, `end_date`) are
`date` (no timezone) to avoid PH/UTC drift; audit fields remain `timestamp`. Money
snapshots use `numeric(12,2)`. Totals are computed in app, never persisted (no
generated/total columns in v1).

**Schema delivery.** No `supabase/` migrations folder exists; the migration is a
runnable SQL document (`004-deliveries-schema.md`) executed by the user in the
Supabase dashboard before testing. The exact JWT claim path (`user_metadata` vs
top-level) must be confirmed against the live customers/products policies before
running.

**Frontend.** `/deliveries` route with two tabs: "Deliveries" (occurrence table,
default) and "Schedules" (rules list). Occurrence table has status chips, a
status-aware row menu (only legal transitions), and filters (Today / Next 7 / Next
14, status, customer). Create/edit uses a wider scrollable dialog sectioned
Customer → Schedule → Products (repeatable line items with running total) → Notes,
following the existing `*-form` / `*-form-dialog` / `create-*` / `edit-*`
convention. A dedicated "Mark as failed" dialog captures required remarks. Styling
follows the Ocean Vitality palette and `docs/DESIGN.md` (table-first operational
dashboard; loading/error/empty/populated states everywhere).

**Modules built** (mirroring `src/features/products` & `src/features/expenses`):
`src/features/deliveries/` with `deliveries.schema.ts`, `deliveries.types.ts`,
`deliveries.mapper.ts`, `deliveries.keys.ts`, `deliveries.constants.ts`,
`deliveries.guards.ts`, `services/deliveries.service.ts`,
`services/materialization.ts`, hooks, and components.

## Testing Decisions

**What makes a good test here:** assert external behavior at the highest
reasonable seam, not implementation details. Tests should pin down *what the
module guarantees* (a weekly schedule produces the right dates; a failed status
requires remarks; the top-up never duplicates) — not how a function is wired
internally. Prefer pure functions and mocked-client service tests over DOM
plumbing.

**Seams to test (highest preferred, existing prior art):**

- **Materialization date generation** — pure functions, no mocks. Cases: weekly,
  bi-weekly interval from anchor, monthly day-of-month with month-end clamp,
  `end_date` boundary, 14-day horizon boundary, and idempotency (the same window
  yields no duplicate dates). Highest-value, cheapest tests.
- **Service layer** (`deliveries.service.ts`, `materialization.ts` ensure-routine)
  — tested with a **mocked Supabase client**, prior art:
  `src/features/customers/services/customers.service.test.ts` and
  `src/features/products/tests/products.service.test.ts`. Assert: org/created_by
  stamped from identity (not input), Supabase `error` returns are handled, the
  top-up inserts only missing `(schedule_id, delivery_date)`, status update stamps
  `delivered_by`.
- **Zod schemas** — refinements for customer-XOR-guest, recurrence shape per type,
  and failure-remarks-required-on-failed. Prior art: `*.schema.test.ts` across
  features.
- **Status-transition guard** — legal transitions and terminal states. Prior art:
  `src/features/customers/tests/customers.guards.test.ts`.
- **Mappers** — row↔display and form→insert round-trips, line/total computation.
  Prior art: `customers.mapper.test.ts`, `products.mapper.test.ts`.

**RLS** is verified manually in Supabase (no automated DB harness exists in the
repo) using the checklist in `004-deliveries-schema.md` §7 and `ACCEPTANCE.md`
A-22…A-26.

## Out of Scope

- Staff/driver **assignment** (`assigned_to`) — deferred until a Team/Staff module
  exists. The schema stays forward-compatible. v1 is a shared queue.
- **Calendar** or **kanban** views — table-first per `docs/DESIGN.md`.
- **Structured time slots** — date-only; timing hints live in free-text notes.
- **Stored/generated total columns** and any **reporting/analytics** layer —
  totals computed in app.
- **Background/cron materialization** — replaced by client-triggered top-up in v1.
- **Reopening a failed occurrence** — failed is terminal; reschedule = a new run.
- **Auto-sweeping** occurrences when a weekday is dropped from a recurrence —
  existing pending rows are left for manual handling.
- Cascading schedule edits onto already-materialized occurrences.

## Further Notes

- **Blocking prerequisite:** `004-deliveries-schema.md` must be run in the Supabase
  dashboard before any app testing.
- **Claim-path caveat:** confirm the JWT org/owner claim path against the live
  customers/products policies before running the migration; the migration notes
  where to adjust.
- The implementation agent must read `AGENTS.md`/`CLAUDE.md` and the required
  project docs, follow the spec-driven workflow, and use TDD per `docs/TESTING.md`.
  Start from `issues/001-foundation.md` (a tracer-bullet vertical slice).
- `docs/DATABASE.md` has been updated with the four tables and policy summary; keep
  it synchronized with the live schema.
