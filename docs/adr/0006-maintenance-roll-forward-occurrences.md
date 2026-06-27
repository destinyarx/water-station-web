# ADR 0006 — Maintenance uses roll-forward occurrences, not rolling materialization

- **Status:** Accepted
- **Date:** 2026-06-27
- **Feature:** `docs/specs/008-build-maintenance-module`

## Context

The maintenance module needs a parent **schedule** plus the individual dated
**occurrences** staff actually perform (the user asked for "a parent maintenance
schedule then the actual schedules"). Deliveries (ADR 0002) already models this
split, but with a **rolling materialization** engine: a client-triggered,
idempotent job pre-creates every occurrence within a 14-day horizon and a cron
extends it. That engine exists because deliveries are high-frequency, span many
customers, and must show a populated near-future queue at all times.

Maintenance is different: low frequency (filters monthly, membranes rarely),
one task per piece of equipment, and the recurrence set is small —
`one_time` (one or more hand-picked dates), `everyday`, and `weekly` (1–3 chosen
weekdays). The user also asked to keep it "clean and not too overcomplicated."

## Decision

Maintenance keeps **at most one `pending` occurrence per recurring schedule** and
**rolls it forward on completion**:

- **one_time** — insert one `maintenance_tasks` row per chosen date up front. The
  schedule is *completed* once it has no `pending` occurrences left.
- **everyday / weekly** — insert a single `pending` occurrence at the start date.
  Completing it stamps `completed_at` and inserts the next occurrence at the next
  due date (`everyday` = +1 day; `weekly` = next selected weekday). There is
  always exactly one open occurrence, so a recurring schedule is never
  "completed" — only *active* or *inactive*.

No horizon, no cron, no background materialization. The unique index
`(schedule_id, due_date) where deleted_at is null` keeps roll-forward idempotent.

## Alternatives considered

**Reuse the deliveries rolling-materialization engine.** Rejected: it adds a
horizon, a materialize service, and a cron for a module that shows one task per
schedule. The cost (more code, another scheduled job) buys nothing the
roll-forward model lacks here. If maintenance ever needs a multi-week look-ahead
calendar, this is the upgrade path.

**Single denormalized table (the design mockup's literal shape).** Rejected: the
user explicitly wants a visible parent plan to toggle inactive, and the
recurrence rule belongs in one place, not copied onto every occurrence.

## Consequences

- "Completed" status is meaningful only for `one_time` schedules. The UI derives
  a recurring schedule's status from `is_active` alone.
- Roll-forward happens inside the complete-task mutation (app code), not the DB.
  If two clients complete the same occurrence concurrently, the unique index
  rejects the duplicate next-occurrence insert — the loser simply refetches.
- Catch-up after a missed window is intentionally *not* back-filled: completing a
  long-overdue everyday task advances to the next future date, it does not create
  one row per skipped day. (Matches the design mockup's `advance()` guard.)
