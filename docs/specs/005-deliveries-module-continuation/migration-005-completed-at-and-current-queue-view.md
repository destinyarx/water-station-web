# Migration 005 — `completed_at` column + `v_current_deliveries` view

Run this in the **Supabase SQL editor** (dashboard) before implementing/testing
the 005 slices. It is additive and safe to re-run (`add column if not exists`,
`create or replace view`).

Prereqs already in the database from `004-deliveries-module`
(`004-deliveries-schema.md`): the `deliveries`, `delivery_schedules`,
`delivery_items`, `delivery_schedule_items` tables, enums, and RLS policies.

Column names this migration depends on (verified against the codebase):
`customers.name`, `products.stock`, `products.is_stock_tracked`.

---

## 1. `completed_at` on `deliveries`

Records the real datetime a delivery was completed, which may differ from the
planned `delivery_date`. Stamped by the app on entering `completed`, cleared on
leaving it. See ADR 0003.

```sql
alter table public.deliveries
  add column if not exists completed_at timestamp;
```

---

## 2. `v_current_deliveries` view (the current delivery queue, model B)

Encapsulates the "current queue" selection so every datatable paginates through
one boring path. `security_invoker = on` makes base-table RLS (`deliveries`,
`delivery_schedules`, `customers`) apply to the caller — the view does not
bypass tenancy.

Selection rule (model B): active, non-deleted `pending`/`for_delivery`
occurrences that are **overdue or due today** (`delivery_date <= current_date`)
**or** are each schedule's **single nearest upcoming** occurrence
(`delivery_date > current_date`).

```sql
create or replace view public.v_current_deliveries
with (security_invoker = on) as
select
  d.id,
  d.schedule_id,
  d.delivery_date,
  d.status,
  d.failure_remarks,
  d.notes,
  d.delivered_by,
  d.completed_at,
  d.org_id,
  d.created_by,
  d.created_at,
  d.updated_at,
  s.customer_id,
  s.guest_name,
  s.recurrence_type,
  c.name as customer_name
from public.deliveries d
join public.delivery_schedules s on s.id = d.schedule_id
left join public.customers c on c.id = s.customer_id
where d.deleted_at is null
  and d.status in ('pending', 'for_delivery')
  and (
    d.delivery_date <= current_date
    or d.delivery_date = (
      select min(d2.delivery_date)
      from public.deliveries d2
      where d2.schedule_id = d.schedule_id
        and d2.deleted_at is null
        and d2.status in ('pending', 'for_delivery')
        and d2.delivery_date > current_date
    )
  );
```

> Note on `current_date`: the database evaluates this in its session timezone.
> The station operates at PH time (UTC+8). Confirm the project/database timezone
> matches, or the "today" boundary will be off by the UTC offset.

---

## 3. Manual verification

1. **Overdue + today + next-upcoming:** for a weekly Tue/Thu schedule with
   materialized rows in the past, today, and the future, the view returns the
   overdue/today rows and exactly **one** future row (the nearest), not the
   whole horizon.
2. **Paused/stopped schedule:** after a Stop soft-deletes future pending, the
   view shows none of that schedule's future rows (only any kept overdue ones).
3. **Org scope:** signed in as org A, selecting from `v_current_deliveries`
   returns zero org B rows.
4. **`completed_at`:** completing a delivery in the app sets `completed_at`;
   reverting clears it.
