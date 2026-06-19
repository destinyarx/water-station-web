# Issue 001 — Deliveries Foundation

Tracer-bullet vertical slice that proves the data model and the core create →
materialize → list → status flow end to end. Later issues layer recurrence edge
cases, schedule management UX, and polish.

## Scope

A user can create a one-time delivery and a simple weekly schedule, see
materialized occurrences in the deliveries table, and move an occurrence through
its status lifecycle including a failed-with-remarks path. Schedules tab supports
create + pause + (owner) archive.

## Prerequisite (blocking)

- [ ] Run `docs/specs/004-deliveries-module/004-deliveries-schema.md` in the
      Supabase dashboard. Verify tables, enums, constraints, indexes, and RLS
      policies exist. **No app testing until this is done.**

## Tasks

### Data layer (`src/features/deliveries/`)

- [ ] `deliveries.constants.ts` — status/recurrence enum value arrays, weekday
      labels, horizon constant (`MATERIALIZATION_HORIZON_DAYS = 14`).
- [ ] `deliveries.schema.ts` — Zod row schemas for the four tables; form schemas
      for the create/edit dialog (customer-xor-guest refine; recurrence-shape
      refine matching the DB CHECK; failure-remarks-required-on-failed refine).
- [ ] `deliveries.types.ts` — `*Row`, display models, `*Insert`/`*Update`,
      `DeliveryOwner { orgId, createdBy }`.
- [ ] `deliveries.mapper.ts` — row→display, form→insert mappers; line-item and
      total computation helpers.
- [ ] `deliveries.keys.ts` — array query-key factory (schedules, deliveries,
      filters).
- [ ] `deliveries.guards.ts` — legal status-transition helper
      (`canTransition(from, to)`), terminal-status check.
- [ ] `services/deliveries.service.ts` — Supabase SDK queries: list occurrences
      (filtered), list schedules, create schedule (+ template items), update
      schedule, pause, owner archive, update occurrence status (stamp
      `delivered_by`), edit occurrence items, soft-delete occurrence. Handle all
      `error` returns.
- [ ] `services/materialization.ts` — pure date-generation (weekly/monthly/
      one-time within horizon, clamp month end, respect `end_date`/`start_date`
      anchor) + an idempotent "ensure occurrences" service that inserts only
      missing `(schedule_id, delivery_date)` and snapshots template items.

### Hooks

- [ ] `use-clerk-supabase.ts`, `use-delivery-owner.ts` (mirror products/expenses).
- [ ] `use-deliveries.ts` / `use-schedules.ts` (queries) — the deliveries query
      triggers the top-up before/alongside fetching.
- [ ] `use-create-delivery.ts`, `use-update-schedule.ts`,
      `use-update-delivery-status.ts`, `use-soft-delete-schedule.ts`
      (mutations; invalidate affected keys).

### UI (`components/`)

- [ ] `deliveries-page.tsx` — two tabs (Deliveries / Schedules).
- [ ] `deliveries-table.tsx` + `delivery-row-actions.tsx` — status-aware menu;
      filters (Today / Next 7 / Next 14, status, customer).
- [ ] `schedules-table.tsx` + row actions (edit, pause/resume, archive[owner]).
- [ ] `delivery-form.tsx` (sectioned: Customer → Schedule → Products → Notes;
      `useFieldArray` line items with running total) + `delivery-form-dialog.tsx`
      + `create-delivery-dialog.tsx` + `edit-delivery-dialog.tsx`.
- [ ] `mark-failed-dialog.tsx` — required remarks.
- [ ] Customer searchable select (existing-customer picker).
- [ ] Loading / error / empty / populated states on every view; Ocean Vitality /
      `docs/DESIGN.md` styling; responsive table.

### Route

- [ ] `/deliveries` route wired to `deliveries-page.tsx`.

### Docs

- [ ] Update `docs/DATABASE.md` with the four tables + policies (mirror the
      customers/products sections).

## Tests

- [ ] Schema refinements (customer-xor-guest, recurrence shape, failed-remarks).
- [ ] Mappers (row↔display, form→insert, total computation).
- [ ] Materialization date generation: weekly, bi-weekly, monthly clamp,
      end_date boundary, horizon boundary, idempotency (no duplicate dates).
- [ ] Status-transition guard (legal/terminal).
- [ ] Service tests with a mocked Supabase client (error handling, top-up
      inserts only missing dates).

## Done when

- [ ] All acceptance scenarios in `ACCEPTANCE.md` pass.
- [ ] Typecheck, lint, tests green; no `any` / `@ts-ignore` / exposed secrets;
      array query keys; mutations invalidate caches.
