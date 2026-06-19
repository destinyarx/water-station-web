# Slice 005 — Weekly recurring schedules + rolling materialization

**Type:** AFK · **Epic:** `001-foundation.md`

## Parent

`docs/specs/004-deliveries-module/001-foundation.md`
PRD: `docs/specs/004-deliveries-module/deliveries-prd.md`

## What to build

Add recurring (weekly) scheduling and the rolling materialization that turns a
recurrence rule into concrete delivery occurrences. In the create/edit dialog the
Schedule section gains a recurrence toggle; the weekly mode lets the user pick
weekdays and an interval (1 = weekly, 2 = bi-weekly), with the frequency displayed
*derived* from the selected weekdays (no separate count input). A "Schedules" tab
lists the recurrence rules alongside the existing "Deliveries" occurrence tab.

A client-triggered, idempotent top-up runs when the deliveries view loads: for
each `active` schedule it inserts any missing occurrences whose due date falls
within the next 14 days (inclusive of today), copying template items into snapshot
items. Idempotency relies on the unique `(schedule_id, delivery_date)` index, so
reloading never duplicates rows. The occurrence table gains date-range (Today /
Next 7 / Next 14), status, and customer filters.

The materialization date generation is a pure function so it can be tested without
a database.

## Acceptance criteria

- [ ] A weekly schedule (e.g. Mon + Thu) displays "2× per week: Mon, Thu" derived
      automatically; no frequency number is entered.
- [ ] A weekly schedule with `interval_weeks = 2` materializes the chosen weekday
      every other week from `start_date`.
- [ ] Loading `/deliveries` materializes all due occurrences within the next 14
      days for active schedules; reloading creates no duplicates.
- [ ] The "Schedules" tab lists recurrence rules; the occurrence table supports
      date-range/status/customer filters.
- [ ] Each materialized occurrence has snapshot `delivery_items` captured at
      generation.
- [ ] Tests: pure date-generation cases (weekly, bi-weekly from anchor, horizon
      boundary, idempotency/no-duplicate); service test that the top-up inserts
      only missing dates. Typecheck/lint/tests green.

## Blocked by

- `003-one-time-delivery-create-and-list.md`
