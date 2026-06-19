# Deliveries Module — PostgreSQL Schema Migration

Run this in the **Supabase SQL editor** (dashboard) before testing the module.
It is written to be idempotent-ish for a fresh install; review before re-running
on an existing database.

Conventions match existing tables (`customers`, `products`):

- `id` is `serial` integer primary key.
- `org_id integer` references the organization tenant scope
  (`organizations(organization_code)`).
- `created_by varchar(255)` references the Clerk user id (`users(clerk_id)`).
- Calendar fields use `date` (no timezone). Audit fields use `timestamp`.
- Soft delete via `deleted_at`.
- RLS reads Clerk claims from the JWT:
  - org: `(auth.jwt() -> 'user_metadata' ->> 'organization')::integer`
  - user: `auth.jwt() ->> 'sub'`
  - owner: `(auth.jwt() -> 'user_metadata' ->> 'is_owner')::boolean`

> **Note:** confirm the exact claim path (`user_metadata` vs top-level) against
> your existing `customers`/`products` policies in the dashboard, and adjust the
> helper expressions below to match before running.

---

## 1. Enums

```sql
do $$
begin
  if not exists (select 1 from pg_type where typname = 'delivery_recurrence_type') then
    create type delivery_recurrence_type as enum ('one_time', 'weekly', 'monthly');
  end if;

  if not exists (select 1 from pg_type where typname = 'delivery_schedule_status') then
    create type delivery_schedule_status as enum ('active', 'paused', 'ended');
  end if;

  if not exists (select 1 from pg_type where typname = 'delivery_status') then
    create type delivery_status as enum ('pending', 'for_delivery', 'completed', 'failed');
  end if;
end$$;
```

---

## 2. `delivery_schedules`

The plan: who is served, what is included (via template items), and the
recurrence rule. Has no operational status of its own; `status` controls
materialization only.

```sql
create table if not exists public.delivery_schedules (
  id               serial primary key,

  -- Customer attachment OR guest/named delivery (exactly one).
  customer_id      integer     references public.customers(id),
  guest_name       varchar(100),
  guest_contact    varchar(15),
  guest_address    varchar(255),

  -- Recurrence rule.
  recurrence_type  delivery_recurrence_type not null,
  start_date       date,                 -- anchor for weekly/monthly intervals
  delivery_date    date,                 -- one_time only
  weekdays         smallint[],           -- weekly only; ISO 1=Mon .. 7=Sun
  interval_weeks   smallint,             -- weekly only; 1=every week, 2=every other
  day_of_month     smallint,             -- monthly only; 1..31 (clamped to month end)
  interval_months  smallint,             -- monthly only; 1=every month
  end_date         date,                 -- optional stop date for recurring

  status           delivery_schedule_status not null default 'active',
  notes            varchar(500),

  org_id           integer     not null references public.organizations(organization_code),
  created_by       varchar(255) not null references public.users(clerk_id),
  created_at       timestamp   not null default now(),
  updated_at       timestamp,
  deleted_at       timestamp,

  -- Exactly one of customer_id / guest_name.
  constraint delivery_schedules_customer_xor_guest check (
    (customer_id is not null and guest_name is null)
    or (customer_id is null and guest_name is not null)
  ),

  -- Recurrence fields must match the recurrence type.
  constraint delivery_schedules_recurrence_shape check (
    (recurrence_type = 'one_time'
      and delivery_date is not null
      and weekdays is null and interval_weeks is null
      and day_of_month is null and interval_months is null)
    or (recurrence_type = 'weekly'
      and start_date is not null
      and weekdays is not null and array_length(weekdays, 1) >= 1
      and interval_weeks is not null and interval_weeks >= 1
      and delivery_date is null
      and day_of_month is null and interval_months is null)
    or (recurrence_type = 'monthly'
      and start_date is not null
      and day_of_month is not null and day_of_month between 1 and 31
      and interval_months is not null and interval_months >= 1
      and delivery_date is null
      and weekdays is null and interval_weeks is null)
  ),

  constraint delivery_schedules_weekdays_range check (
    weekdays is null
    or (
      array_position(weekdays, null::smallint) is null
      and weekdays <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]
    )
  )
);

create index if not exists delivery_schedules_org_idx
  on public.delivery_schedules (org_id) where deleted_at is null;
create index if not exists delivery_schedules_customer_idx
  on public.delivery_schedules (customer_id) where deleted_at is null;
create index if not exists delivery_schedules_status_idx
  on public.delivery_schedules (status) where deleted_at is null;
```

---

## 3. `delivery_schedule_items` (template lines)

Products defined once on the schedule; copied to each occurrence at
materialization. `unit_price` is an optional override; when null the
materializer reads the product's current price.

```sql
create table if not exists public.delivery_schedule_items (
  id                   serial primary key,
  schedule_id          integer not null references public.delivery_schedules(id) on delete cascade,
  product_id           integer not null references public.products(id),
  quantity             numeric(10,2) not null check (quantity > 0),
  unit_price           numeric(12,2),           -- optional override; null = use product price
  org_id               integer not null references public.organizations(organization_code),
  created_at           timestamp not null default now(),
  updated_at           timestamp
);

create index if not exists delivery_schedule_items_schedule_idx
  on public.delivery_schedule_items (schedule_id);
```

---

## 4. `deliveries` (occurrences)

The actionable, dated delivery run. Carries the operational status and failure
remarks. Unique per `(schedule_id, delivery_date)` so the rolling top-up is
idempotent.

```sql
create table if not exists public.deliveries (
  id               serial primary key,
  schedule_id      integer not null references public.delivery_schedules(id),
  delivery_date    date    not null,

  status           delivery_status not null default 'pending',
  failure_remarks  varchar(500),
  notes            varchar(500),
  delivered_by     varchar(255) references public.users(clerk_id), -- auto-stamped on for_delivery

  org_id           integer     not null references public.organizations(organization_code),
  created_by       varchar(255) not null references public.users(clerk_id),
  created_at       timestamp   not null default now(),
  updated_at       timestamp,
  deleted_at       timestamp,

  -- Failure remarks required iff failed.
  constraint deliveries_failure_remarks_check check (
    (status = 'failed' and failure_remarks is not null and length(trim(failure_remarks)) > 0)
    or (status <> 'failed')
  )
);

-- Idempotent materialization: one occurrence per schedule per date (active rows).
create unique index if not exists deliveries_schedule_date_unique
  on public.deliveries (schedule_id, delivery_date) where deleted_at is null;

create index if not exists deliveries_org_date_idx
  on public.deliveries (org_id, delivery_date) where deleted_at is null;
create index if not exists deliveries_status_idx
  on public.deliveries (status) where deleted_at is null;
```

---

## 5. `delivery_items` (per-occurrence snapshot)

Line snapshot for each occurrence. `product_name` and `unit_price` are captured
at materialization time so historical deliveries are self-contained even if the
product is renamed, repriced, or soft-deleted.

```sql
create table if not exists public.delivery_items (
  id               serial primary key,
  delivery_id      integer not null references public.deliveries(id) on delete cascade,
  product_id       integer not null references public.products(id),
  product_name     varchar(255) not null,    -- snapshot
  unit_price       numeric(12,2) not null,    -- snapshot
  quantity         numeric(10,2) not null check (quantity > 0),
  org_id           integer not null references public.organizations(organization_code),
  created_at       timestamp not null default now(),
  updated_at       timestamp
);

create index if not exists delivery_items_delivery_idx
  on public.delivery_items (delivery_id);
```

---

## 6. Row Level Security

Enable RLS on all four tables.

```sql
alter table public.delivery_schedules      enable row level security;
alter table public.delivery_schedule_items enable row level security;
alter table public.deliveries              enable row level security;
alter table public.delivery_items          enable row level security;
```

Helper expressions used below (inline these to match your existing policies):

- org: `(auth.jwt() -> 'user_metadata' ->> 'organization')::integer`
- owner: `(auth.jwt() -> 'user_metadata' ->> 'is_owner')::boolean`

### `delivery_schedules`

```sql
-- SELECT: any org member, active rows only.
create policy "view schedules in org"
  on public.delivery_schedules for select
  using (
    org_id = (auth.jwt() -> 'user_metadata' ->> 'organization')::integer
    and deleted_at is null
  );

-- INSERT: any org member; stamp ownership.
create policy "create schedules in org"
  on public.delivery_schedules for insert
  with check (
    org_id = (auth.jwt() -> 'user_metadata' ->> 'organization')::integer
    and created_by = auth.jwt() ->> 'sub'
  );

-- UPDATE: any org member may edit/pause; cannot resurrect soft-deleted rows.
-- Owner-only soft-delete is enforced in the WITH CHECK: a non-owner may not set
-- deleted_at.
create policy "update schedules in org"
  on public.delivery_schedules for update
  using (
    org_id = (auth.jwt() -> 'user_metadata' ->> 'organization')::integer
    and deleted_at is null
  )
  with check (
    org_id = (auth.jwt() -> 'user_metadata' ->> 'organization')::integer
    and (
      deleted_at is null
      or (auth.jwt() -> 'user_metadata' ->> 'is_owner')::boolean = true
    )
  );
```

> **Owner-only schedule soft-delete:** the normal UI archives a schedule by
> setting `deleted_at = now()` via UPDATE. The `with check` above permits a
> non-null `deleted_at` only when the caller's `is_owner` claim is true, so staff
> can edit/pause schedules but only owners can archive them.

### `delivery_schedule_items`

```sql
create policy "view schedule items in org"
  on public.delivery_schedule_items for select
  using (org_id = (auth.jwt() -> 'user_metadata' ->> 'organization')::integer);

create policy "write schedule items in org"
  on public.delivery_schedule_items for all
  using (org_id = (auth.jwt() -> 'user_metadata' ->> 'organization')::integer)
  with check (org_id = (auth.jwt() -> 'user_metadata' ->> 'organization')::integer);
```

### `deliveries`

```sql
-- Shared org queue: any org member reads/inserts/updates occurrences.
create policy "view deliveries in org"
  on public.deliveries for select
  using (
    org_id = (auth.jwt() -> 'user_metadata' ->> 'organization')::integer
    and deleted_at is null
  );

create policy "create deliveries in org"
  on public.deliveries for insert
  with check (
    org_id = (auth.jwt() -> 'user_metadata' ->> 'organization')::integer
    and created_by = auth.jwt() ->> 'sub'
  );

create policy "update deliveries in org"
  on public.deliveries for update
  using (
    org_id = (auth.jwt() -> 'user_metadata' ->> 'organization')::integer
    and deleted_at is null
  )
  with check (
    org_id = (auth.jwt() -> 'user_metadata' ->> 'organization')::integer
  );
```

### `delivery_items`

```sql
create policy "view delivery items in org"
  on public.delivery_items for select
  using (org_id = (auth.jwt() -> 'user_metadata' ->> 'organization')::integer);

create policy "write delivery items in org"
  on public.delivery_items for all
  using (org_id = (auth.jwt() -> 'user_metadata' ->> 'organization')::integer)
  with check (org_id = (auth.jwt() -> 'user_metadata' ->> 'organization')::integer);
```

---

## 7. Manual RLS verification

1. Sign in as org A; confirm `/deliveries` lists only org A schedules and
   occurrences.
2. With org A's session, query an org B `deliveries` / `delivery_schedules` id
   directly through the Supabase client — must return no row.
3. Create a one-time delivery; confirm `org_id` / `created_by` match the signed-in
   user, and one `deliveries` occurrence is materialized for the chosen date.
4. Create a weekly schedule (Mon/Thu); confirm occurrences appear only within the
   14-day horizon and that re-loading the page does not duplicate them
   (unique `(schedule_id, delivery_date)`).
5. As **staff**, edit and pause a schedule — allowed. Attempt to archive
   (soft-delete) the schedule — must be **blocked** (owner-only).
6. As **owner**, archive the schedule — allowed; it leaves the active list while
   completed/failed history is retained.
7. Mark a delivery `failed` without remarks — DB CHECK and app validation must
   reject it; with remarks it succeeds.
8. Confirm a failed occurrence does not stop future materialization of its
   schedule.
```
