# Slice 001 — Schema migration: `completed_at` + `v_current_deliveries` view

**Type:** HITL · **Feature:** `005-deliveries-module-continuation`

## Parent

PRD: `docs/specs/005-deliveries-module-continuation/prd.md`
ADR: `docs/specs/005-deliveries-module-continuation/adr-0003-delivery-status-stock-and-revert.md`

## What to build

This slice is **human-in-the-loop**: a person applies a SQL migration in the
Supabase dashboard. No application code ships here. The agent's job is to make
sure the migration script is correct and ready, then **stop and request the
human apply it** before any 005 implementation slice runs against the new
column/view.

The migration (already drafted in
`docs/specs/005-deliveries-module-continuation/migration-005-completed-at-and-current-queue-view.md`)
does exactly two additive things:

1. `alter table public.deliveries add column if not exists completed_at timestamp` —
   records the real completion datetime (may differ from `delivery_date`).
2. `create or replace view public.v_current_deliveries with (security_invoker = on)` —
   encodes the current-queue selection (model B: overdue + today + each
   schedule's single nearest upcoming `pending`/`for_delivery` occurrence), with
   base-table RLS still applied.

No new tables, no enum changes.

## Acceptance criteria

- [ ] The migration script runs cleanly in the Supabase SQL editor on the
      project database (re-runnable: `if not exists` / `create or replace`).
- [ ] `deliveries.completed_at` exists as a nullable `timestamp`.
- [ ] `v_current_deliveries` exists with `security_invoker = on` and returns,
      for a weekly schedule with past/today/future materialized rows, the
      overdue+today rows plus exactly one nearest-future row per schedule.
- [ ] Selecting from the view as an org A session returns zero org B rows
      (RLS verified — manual check 3 in the migration file).
- [ ] The human has confirmed the migration is applied; downstream slices may
      now reference `completed_at` and `v_current_deliveries`.
- [ ] Database/session timezone confirmed to match PH (UTC+8) so the
      `current_date` "today" boundary is correct.

## Blocked by

- None - can start immediately.
