# Slice 006 — Weekly recurrence + rolling materialization

**Type:** AFK · **Feature:** `005-deliveries-module-continuation`

## Parent

PRD: `docs/specs/005-deliveries-module-continuation/prd.md`
ADR: `docs/specs/005-deliveries-module-continuation/adr-0003-delivery-status-stock-and-revert.md`
Recurrence model: `docs/adr/0002-deliveries-two-entity-rolling-materialization.md`

Stories: 15, 16.

## What to build

Let a customer's standing order generate its own dated deliveries on a **weekly**
rhythm, materialized within a rolling horizon.

End-to-end behavior:

- Creating a recurring schedule lets staff pick **weekdays** (ISO 1=Mon..7=Sun)
  plus `interval_weeks`; the weekly **frequency is derived from the selected
  weekdays** — there is no separate count field to contradict them. (Monthly mode
  and `start_date`/`end_date` already exist in the schema; this slice wires the
  weekly path. Keep the date math in one generator so monthly can join later.)
- A pure generator `dueDatesFor(schedule, fromDate, horizon)` turns a recurrence
  rule into concrete due dates: weekday selection, `interval_weeks` skipping,
  `start_date` phase anchoring, and `end_date` cutoff, bounded by `horizon`.
- A **client-triggered, idempotent top-up** materializes missing occurrences
  within the rolling horizon. Idempotency is enforced by the unique
  `(schedule_id, delivery_date) where deleted_at is null` constraint — re-running
  the top-up creates no duplicates.
- New occurrences are created as `pending`, org-scoped, with `created_by` from
  the Clerk session.

## Acceptance criteria

- [ ] Staff can create a weekly schedule by selecting weekdays + `interval_weeks`;
      no separate frequency/count input exists.
- [ ] `dueDatesFor` is a pure, table-tested function covering: weekday selection,
      `interval_weeks` skipping, `start_date` phase consistency, `end_date`
      cutoff, and horizon bound.
- [ ] The materialization top-up creates only the missing dated occurrences and
      is idempotent (re-running produces no duplicates, per the unique index).
- [ ] Generated occurrences are `pending`, org-scoped, with `created_by` from the
      session (never form input).
- [ ] Supabase errors surface as friendly messages.
- [ ] Typecheck, lint, and tests pass; no `any`, no `@ts-ignore`.

## Blocked by

- `001-schema-migration-completed-at-and-current-queue-view.md` (schedules and
  the current-queue view must exist for generated rows to surface).
