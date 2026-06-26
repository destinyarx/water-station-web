# Deliveries Module — Handoff

Context map for the next agent. Read this before adding a feature or chasing a
bug in deliveries. Authoritative source is the code under
`src/features/deliveries/`; the ADRs in this folder explain *why*.

Related docs:

- `adr-0003-delivery-status-stock-and-revert.md` — status lifecycle, stock, revert.
- `docs/adr/0002-deliveries-two-entity-rolling-materialization.md` — the two-entity model.
- `migration-005-completed-at-and-current-queue-view.md` — the SQL for `completed_at` + the view.
- `prd.md`, `issues/` — the 005 slices (002–008) that built the current state.

---

## 1. The core model: schedules vs deliveries (two entities)

A **schedule** is the *plan*. A **delivery** is a *dated occurrence* of that plan.

| Concept | Table | Holds |
|---|---|---|
| Plan / recurrence + who it's for | `delivery_schedules` | target (customer or guest), recurrence rule, status |
| Template line items | `delivery_schedule_items` | product, qty, optional `unit_price` override |
| Dated occurrence | `deliveries` | one delivery on one date, its lifecycle status |
| Snapshot line items | `delivery_items` | product **name + price snapshotted** at materialization |

Key idea: **occurrence rows do not carry target data.** Customer/guest lives on
the schedule. The view (below) joins it back in. This is why the occurrence edit
form is *occurrence-only* (date/notes/items) — there's no customer section to edit.

Even a **one-time** delivery is a schedule (`recurrence_type = 'one_time'`) with
exactly one occurrence. Everything is a schedule under the hood.

### Enums

- `delivery_status`: `pending` · `for_delivery` · `completed` · `failed`
- `delivery_schedule_status`: `active` · `paused` · `ended`
- `delivery_recurrence_type`: `one_time` · `weekly` · `monthly` *(monthly not wired yet)*

---

## 2. `v_current_deliveries` — what you asked about

**Purpose:** it's the "current delivery queue" — the single, boring read path
the main datatable paginates through. Instead of every caller re-deriving "what
should staff see today", the selection lives in one SQL view.

Defined in `migration-005-...md`, consumed by
`services/delivery-queue.service.ts` (`getCurrentDeliveries`), surfaced via
`hooks/use-current-deliveries.ts`.

**Selection rule (model B)** — a row is in the queue if it's an active,
non-deleted `pending`/`for_delivery` occurrence **and** either:

1. it's **overdue or due today** (`delivery_date <= current_date`), **or**
2. it's its schedule's **single nearest upcoming** occurrence (`delivery_date > current_date`).

So a weekly schedule materialized 14 days ahead shows its overdue/today rows
plus exactly **one** future row — not the whole horizon. Completed/failed rows
drop out (they're not in the queue; see history dialog for those).

**Why a view, not app code:**

- `security_invoker = on` → base-table RLS (`deliveries`, `delivery_schedules`,
  `customers`) applies to the *caller*. The view does **not** bypass tenancy;
  org A never sees org B.
- It joins `delivery_schedules` + `customers` so the row already carries
  `customer_id`, `guest_name`, `recurrence_type`, `customer_name`.
- It exposes every delivery column **except `deleted_at`** (the view filters
  soft-deleted rows itself — see `CURRENT_DELIVERY_COLUMNS`; the service passes
  `deleted_at: null` when mapping).

**Gotcha — timezone:** the view uses `current_date`, evaluated in the DB session
timezone. The station runs PH time (UTC+8). If the DB tz ≠ PH, the "today"
boundary is off by the offset. Date math in app code is done in **UTC on
`YYYY-MM-DD` strings** to dodge drift; the view is the one place that depends on
DB tz. Suspect this first for any "wrong day" bug.

---

## 3. Status lifecycle, stock & revert (ADR 0003)

Single source of truth: `deliveries.transitions.ts` (`resolveStatusTransition`,
`legalNextStatuses`). Applied by `services/delivery-status.service.ts`.

**Legal transitions** (forward + revert edges, one adjacency set):

```
pending      → for_delivery, failed
for_delivery → completed, failed, pending(revert)
completed    → pending(revert), for_delivery(revert)
failed       → pending(revert), for_delivery(revert)
```

**Stock** (`products.stock`, single int column, app is sole writer):

- Stock is **"out"** while status ∈ `{for_delivery, completed}`, **"in"** while
  ∈ `{pending, failed}`. Only `is_stock_tracked` products move; refills/fees never do.
- `in → out` deducts, `out → in` restores, same-class moves nothing. **Revert
  uses the exact same rule** — no special-casing.
- Deduction is atomic + bounded: `update products set stock = stock - qty where
  id = ? and stock >= qty`. Zero rows affected → insufficient stock → transition
  rejected. **Negative stock is structurally impossible.**

**Derived fields** on every transition:

- `completed_at` = `now()` iff new status is `completed`, else `null`.
- `failure_remarks` required iff new status is `failed`, else cleared.
- `delivered_by` stamped (from Clerk identity) when entering `for_delivery`.

**Editing is `pending`-only.** To edit a locked row, revert it to `pending`
first (restores stock / clears terminal fields), edit, re-dispatch. This is
deliberate so we never reconcile a partial edit against already-moved stock.

> `ponytail:` no `stock_movements` ledger — only current status records whether
> stock is out. Add one only if per-delivery audit history is ever required.

---

## 4. Recurrence + rolling materialization

`deliveries.recurrence.ts` → pure `dueDatesFor(rule, fromDate, horizon)`.

- Weekly only (monthly stubbed, returns `[]`). ISO weekdays **1=Mon … 7=Sun**.
- `interval_weeks` is **phase-anchored to `start_date`'s Monday** (not state-based) —
  every generation recomputes from the anchor, so resuming a paused schedule
  lands on the right weeks without tracking what was skipped.
- Bounded by `end_date` cutoff and the `horizon`.

**Materialization** (`services/delivery-materialize.service.ts`,
`materializeWeeklySchedule`): for each due date with no existing occurrence,
insert a `deliveries` row + copy `delivery_schedule_items` into `delivery_items`.

- `unit_price` = template `unit_price` override **?? live `products.price` ?? 0**.
- `product_name` is **resolved fresh from `products`** at materialization time and
  snapshotted. (Stale template names never leak through.)
- Horizon = `MATERIALIZE_HORIZON_DAYS` (14). Top-up is **idempotent** — enforced
  by a unique `(schedule_id, delivery_date) where deleted_at is null` constraint.

> `ponytail:` create/materialize aren't wrapped in a transaction. A mid-insert
> failure can leave a schedule without its items. Upgrade path: an RPC if it bites.

---

## 5. Stop / Resume (issue 007)

`services/delivery-schedule-admin.service.ts`:

- **Stop** (`pauseSchedule`): set schedule `status='paused'` + soft-delete
  (`deleted_at=now()`) **only** `pending` occurrences with `delivery_date >= today`.
  Overdue pending, `for_delivery`, and all terminal history are left untouched.
  The exact filter chain is pinned by a test — don't loosen it casually.
- **Resume** (`resumeSchedule`): set `status='active'` + re-run
  `materializeWeeklySchedule` **forward from today** on the original anchor. No
  backfill of the paused gap (the generator is anchor-based, not state-based).

---

## 6. Pagination

`deliveries.pagination.ts` → `applyLimitPlusOne(rows, pageSize)` → `{ rows, hasNext }`.

`pageSize + 1` probe via `.range(offset, offset + pageSize)`. **No count query.**
Used by the current queue, schedule list, and history. `keepPreviousData` on the
hooks for smooth prev/next.

---

## 7. Identity & tenancy (CLAUDE.md, non-negotiable)

- `org_id`, `created_by`, `delivered_by` come from the **authenticated Clerk
  session** (`hooks/use-delivery-owner.ts`), **never** from form input.
- All queries scoped by `org_id`; RLS enforced, never bypassed.
- Soft delete via `deleted_at = now()`; soft-deleted rows excluded from active lists.

---

## 8. File map

```
deliveries.constants.ts      table names, column lists, horizon, peso formatter, form defaults
deliveries.types.ts          row/insert interfaces, form input/output types
deliveries.schema.ts         zod row schemas + delivery & schedule form schemas
deliveries.mapper.ts         row→domain (toDelivery) + form→insert-row mappers
deliveries.transitions.ts    legal-transition map + stock/derived-field resolver  (ADR 0003)
deliveries.recurrence.ts     RecurrenceRule, toRecurrenceRule, dueDatesFor
deliveries.pagination.ts     applyLimitPlusOne, DELIVERIES_PAGE_SIZE
deliveries.schedule-view.ts  scheduleRecipient / recurrenceSummary / nextUpcomingDate
deliveries.keys.ts           TanStack query-key factory

services/
  deliveries.service.ts            list/create deliveries
  delivery-queue.service.ts        getCurrentDeliveries  (reads v_current_deliveries)
  delivery-status.service.ts       apply a status transition + stock
  delivery-edit.service.ts         edit a pending occurrence
  delivery-history.service.ts      terminal/past occurrences
  delivery-counts.service.ts       dashboard metrics (active/pending/completed-today)
  delivery-materialize.service.ts  materializeWeeklySchedule (template→occurrences)
  delivery-schedule.service.ts     createWeeklySchedule
  delivery-schedule-admin.service.ts  pause/resume
  delivery-schedule-list.service.ts   getSchedules (paginated)

hooks/                        one hook per query/mutation, all invalidate deliveryKeys.all
components/                   page, table, dialogs (create/edit/history/schedule list), forms, status menu
tests/                        one *.test.ts per logic file (vitest)
```

**Metrics note:** "Completed today" keys on `completed_at::date = today`;
"Active today" / "Pending backlog" key on `delivery_date`.

---

## 9. Verification

- Typecheck: `npx tsc --noEmit`
- Lint: `npm run lint` (5 pre-existing warnings outside deliveries; target 0 errors)
- Tests: `npm test` (vitest) · single file: `npm test -- <substring>`

Migration 005 is already applied in Supabase (`completed_at` column +
`v_current_deliveries` view). It's additive and safe to re-run.
