# Slice 007 — Recurring schedule list modal + Stop/Resume

**Type:** AFK · **Feature:** `005-deliveries-module-continuation`

## Parent

PRD: `docs/specs/005-deliveries-module-continuation/prd.md`
ADR: `docs/specs/005-deliveries-module-continuation/adr-0003-delivery-status-stock-and-revert.md`

Stories: 17, 18, 19, 20.

## What to build

A **Recurring schedule list** modal over the parent `delivery_schedules`, whose
only action is **Stop/Resume**.

End-to-end behavior:

- A modal lists each schedule's recipient (customer or `guest_name`), recurrence
  summary, status, and a **derived next-upcoming date** (the nearest future
  occurrence). Read-only except Stop/Resume.
- **Stop** (on an `active` schedule): set `status = 'paused'` **and** soft-delete
  (`deleted_at = now()`) its `pending` occurrences dated **`>= today`**. Keep
  `for_delivery` runs, all terminal history, and overdue (`< today`) pending.
- **Resume** (on a `paused` schedule): set `status = 'active'`. Materialization
  continues **forward from today on the original `start_date` anchor**; the
  paused gap is **not** back-filled (reuses `dueDatesFor` from slice 006 — the
  generator is anchored, so resuming just tops up the horizon from today).
- A status change here writes only `delivery_schedules` (and the soft-delete of
  its own pending occurrences); it does not touch terminal/in-flight rows.
  Invalidate the schedules + current-queue query keys after success.
- **Server-side prev/next pagination** via `applyLimitPlusOne`. Org-scoped under
  RLS; soft-deleted schedules excluded. Loading/error/empty states handled.

## Acceptance criteria

- [ ] The modal lists schedules with recipient, recurrence summary, status, and a
      correct derived next-upcoming date.
- [ ] Stop sets `paused` and soft-deletes **only** `pending` occurrences dated
      `>= today`; `for_delivery`, history, and overdue (`< today`) pending are
      untouched (assert the exact `>= today` + `status = 'pending'` filter).
- [ ] Resume sets `active` and continues materialization forward from today on
      the original anchor, with **no** back-fill of the paused gap.
- [ ] Stop/Resume invalidates the schedules + current-queue query keys; the main
      queue reflects the change immediately.
- [ ] The modal paginates prev/next via `applyLimitPlusOne`; reads are
      org-scoped; loading/error/empty states exist.
- [ ] Typecheck, lint, and tests pass; no `any`, no `@ts-ignore`.

## Blocked by

- `006-weekly-recurrence-and-rolling-materialization.md` (`dueDatesFor` + the
  anchored materialization Resume re-triggers).
- `004-current-queue-today-cards-and-pagination.md` (`applyLimitPlusOne`).
