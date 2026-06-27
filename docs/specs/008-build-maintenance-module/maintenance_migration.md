# Maintenance module — database migration

Feature: `008-build-maintenance-module`. Run this SQL **once** in the Supabase
dashboard SQL editor (the repo has no `supabase/` folder; same convention as
deliveries `004-deliveries-schema.md`). This file is the authoritative source
for columns, enums, constraints, indexes, and policies — keep it and
`docs/DATABASE.md` synchronized with the live tables.

Two tables model maintenance, mirroring the deliveries split but **without** a
rolling-materialization engine (see ADR 0006):

- `maintenance_schedules` — the recurring/one-time **plan** (equipment, task,
  priority, recurrence rule, active/inactive). The user toggles a whole plan
  inactive here.
- `maintenance_tasks` — individual dated **occurrences** that staff actually do.
  `assigned_to` lives here so the assignee can be changed per occurrence. A
  recurring plan keeps exactly one `pending` occurrence at a time and rolls the
  next due date forward on completion; a one-time plan inserts one occurrence
  per chosen date.

```sql
-- ============================================================
-- Enums
-- ============================================================
do $$ begin
  create type maintenance_priority as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type maintenance_recurrence as enum ('one_time', 'everyday', 'weekly');
exception when duplicate_object then null; end $$;

do $$ begin
  create type maintenance_task_status as enum ('pending', 'completed');
exception when duplicate_object then null; end $$;

-- ============================================================
-- maintenance_schedules — the plan / recurrence rule
-- ============================================================
create table if not exists public.maintenance_schedules (
  id               bigint generated always as identity primary key,
  title            varchar(120) not null,
  equipment        varchar(60)  not null,
  equipment_other  varchar(120),                         -- required iff equipment = 'Others'
  priority         maintenance_priority   not null default 'medium',
  recurrence_type  maintenance_recurrence not null,
  weekdays         smallint[],                           -- ISO 1=Mon..7=Sun; weekly only
  times_per_week   smallint,                             -- 1..3; weekly only; = array_length(weekdays,1)
  notes            varchar(500),
  is_active        boolean      not null default true,   -- active/inactive (distinct from archive)

  org_id           integer      not null references public.organizations(organization_code),
  created_by       varchar(255) not null references public.users(clerk_id),
  created_at       timestamp    not null default now(),
  updated_at       timestamp,
  deleted_at       timestamp,                            -- archive (soft delete), owner-only

  constraint maintenance_schedules_other_chk
    check (equipment <> 'Others' or (equipment_other is not null and length(trim(equipment_other)) > 0)),
  constraint maintenance_schedules_weekly_chk
    check (
      recurrence_type <> 'weekly'
      or (weekdays is not null and array_length(weekdays, 1) between 1 and 3
          and times_per_week = array_length(weekdays, 1))
    )
);

-- ============================================================
-- maintenance_tasks — a single dated occurrence
-- ============================================================
create table if not exists public.maintenance_tasks (
  id            bigint generated always as identity primary key,
  schedule_id   bigint  not null references public.maintenance_schedules(id) on delete cascade,
  due_date      date    not null,
  status        maintenance_task_status not null default 'pending',
  assigned_to   varchar(255) references public.users(clerk_id),  -- nullable = Unassigned
  completed_at  timestamp,
  completed_by  varchar(255) references public.users(clerk_id),

  org_id        integer      not null references public.organizations(organization_code),
  created_by    varchar(255) not null references public.users(clerk_id),
  created_at    timestamp    not null default now(),
  updated_at    timestamp,
  deleted_at    timestamp
);

-- One live occurrence per schedule per date keeps roll-forward idempotent.
create unique index if not exists maintenance_tasks_schedule_date_ux
  on public.maintenance_tasks (schedule_id, due_date)
  where deleted_at is null;

create index if not exists maintenance_tasks_org_due_idx
  on public.maintenance_tasks (org_id, due_date) where deleted_at is null;
create index if not exists maintenance_schedules_org_idx
  on public.maintenance_schedules (org_id) where deleted_at is null;

-- ============================================================
-- Row Level Security  (shared org queue, mirrors deliveries)
-- ============================================================
alter table public.maintenance_schedules enable row level security;
alter table public.maintenance_tasks     enable row level security;

-- helpers: organization scope + ownership come from the Clerk JWT claims.
--   (auth.jwt() ->> 'organization')::int  = caller's org_id
--   (auth.jwt() ->> 'sub')                = caller's clerk_id
--   (auth.jwt() ->> 'is_owner')::boolean  = caller is the station owner

-- maintenance_schedules ----------------------------------------------------
create policy "maintenance_schedules_select"
  on public.maintenance_schedules for select
  using (org_id = (auth.jwt() ->> 'organization')::int and deleted_at is null);

create policy "maintenance_schedules_insert"
  on public.maintenance_schedules for insert
  with check (org_id = (auth.jwt() ->> 'organization')::int
              and created_by = (auth.jwt() ->> 'sub'));

-- any org member may edit/pause; soft-delete (set deleted_at) only when owner.
create policy "maintenance_schedules_update"
  on public.maintenance_schedules for update
  using (org_id = (auth.jwt() ->> 'organization')::int)
  with check (
    org_id = (auth.jwt() ->> 'organization')::int
    and (deleted_at is null or (auth.jwt() ->> 'is_owner')::boolean = true)
  );

-- maintenance_tasks --------------------------------------------------------
create policy "maintenance_tasks_select"
  on public.maintenance_tasks for select
  using (org_id = (auth.jwt() ->> 'organization')::int and deleted_at is null);

create policy "maintenance_tasks_insert"
  on public.maintenance_tasks for insert
  with check (org_id = (auth.jwt() ->> 'organization')::int
              and created_by = (auth.jwt() ->> 'sub'));

create policy "maintenance_tasks_update"
  on public.maintenance_tasks for update
  using (org_id = (auth.jwt() ->> 'organization')::int)
  with check (org_id = (auth.jwt() ->> 'organization')::int);

-- ============================================================
-- users: let an org member read co-members (for the assignee picker)
-- ============================================================
-- The assignee dropdown lists staff in the caller's organization. If your
-- `public.users` table already exposes co-members to org members, skip this.
-- Assumes columns: clerk_id (pk), name, org_id (-> organizations.organization_code).
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'users'
      and policyname = 'users_select_org_members'
  ) then
    create policy "users_select_org_members"
      on public.users for select
      using (org_id = (auth.jwt() ->> 'organization')::int);
  end if;
end $$;
```

## Manual RLS verification

1. **Cross-org isolation** — a user in org A cannot SELECT/UPDATE org B's
   schedules or tasks (queries return 0 rows; updates affect 0 rows).
2. **Owner-only archive** — a staff member's `update ... set deleted_at = now()`
   on a schedule is rejected by the `with check`; the owner's succeeds.
3. **Shared queue** — any org member can complete a task and create a schedule
   regardless of `created_by`.
4. **Roll-forward idempotency** — completing a recurring task inserts the next
   occurrence; re-running cannot duplicate `(schedule_id, due_date)`.
5. **Weekly CHECK** — inserting a `weekly` schedule whose `times_per_week`
   ≠ `array_length(weekdays,1)` is rejected.
6. **Assignee picker** — a member can SELECT co-members from `public.users`
   within their org; cannot see other orgs' users.
