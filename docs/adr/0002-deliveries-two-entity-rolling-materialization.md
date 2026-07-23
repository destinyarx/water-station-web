---
status: accepted
---

# Deliveries: two-entity model with rolling materialization

## Context

The Deliveries module (feature `004-deliveries-module`) must support both
one-time deliveries and recurring refill schedules (weekly by weekday,
bi-weekly, and monthly), while each individual delivery run carries its own
operational status (`pending` → `for_delivery` → `completed`/`failed`) and, when
failed, its own failure remarks.

## Decision

We model a **Delivery Schedule** (the recurrence rule / plan) as a separate
entity from a **Delivery** (a single dated occurrence that staff actually carry
out). A one-time schedule produces exactly one Delivery; a recurring schedule
produces many.

Recurring occurrences are **materialized on a rolling 14-day horizon**: the
recurrence rule lives on the schedule, and concrete `deliveries` rows are
generated only for the next 14 days. A **client-triggered, idempotent top-up**
(run when the deliveries view loads) inserts any missing occurrences within the
window. Idempotency is guaranteed by a unique constraint on
`(schedule_id, delivery_date)`.

Product line items exist twice: as a **template** on the schedule
(`delivery_schedule_items`) and as a **per-occurrence snapshot**
(`delivery_items`) that captures `product_name` and `unit_price` at
materialization time, so later product price/name changes never alter historical
delivery records.

## Considered options

- **Single `deliveries` table with a nullable recurrence rule.** Rejected:
  status and failure remarks belong to a single dated attempt, not to a rule;
  one row per recurring customer forces overloading columns and cannot hold
  per-occurrence history.
- **Eager full generation** (bulk-insert a year of rows on schedule create).
  Rejected: row explosion, painful rule edits (regeneration), and a polluted
  table.
- **Pure virtual occurrences** (compute dates at read time, never persist).
  Rejected: an occurrence needs its own mutable status/remarks, which a computed
  phantom cannot hold until promoted to a row anyway.

## Consequences

- There is no scheduled job in this module; materialization runs in app code on
  view load. If no one opens the deliveries view, occurrences past "today" are
  still topped up the next time it is opened (the horizon is relative to "now",
  not to last run). A future cron/edge job can replace the client trigger without
  schema changes.

> **Correction (2026-07-23).** The view-load top-up described above was never
> actually wired. `materializeRecurringSchedule` was reachable only from schedule
> creation and Resume, so a recurring route generated 14 days of occurrences and
> then went silent — indefinitely, for an open-ended route. Issue
> `018-modules-improvements` closed the gap: `topUpActiveSchedules` +
> `useScheduleTopUp` now run the top-up once per mount of the deliveries page,
> restoring the behaviour this ADR always claimed. Completed schedules are
> skipped (ADR 0017).
- Schedule edits affect **future** materialization only; already-generated
  occurrences are independent and individually editable. Dropping a weekday from
  a recurrence leaves existing pending rows in place.
- A failed occurrence never stops the schedule; only an explicit
  `active → paused` transition halts generation.
- Two item tables mean template lines and snapshot lines are maintained
  separately; the materializer is responsible for copying template → snapshot.
