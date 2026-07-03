-- Delivery rebuild migration notes for feature 010.
-- Apply after reviewing against the current database because this repository
-- stores feature migrations under docs/specs rather than a Supabase migrations
-- directory.

alter type public.delivery_recurrence_type add value if not exists 'custom_dates';
alter type public.delivery_status add value if not exists 'cancelled';

alter table public.delivery_schedules
  add column if not exists assigned_to varchar(255) references public.users(clerk_id);

alter table public.deliveries
  add column if not exists assigned_to varchar(255) references public.users(clerk_id),
  add column if not exists cancellation_remarks varchar(500);

create table if not exists public.delivery_schedule_dates (
  id bigserial primary key,
  schedule_id bigint not null references public.delivery_schedules(id) on delete cascade,
  delivery_date date not null,
  org_id bigint not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (schedule_id, delivery_date)
);

alter table public.delivery_schedule_dates enable row level security;

drop policy if exists "delivery_schedule_dates_select_org" on public.delivery_schedule_dates;
create policy "delivery_schedule_dates_select_org"
on public.delivery_schedule_dates
for select
to authenticated
using (
  org_id in (
    select users.org_id
    from public.users
    where users.clerk_id = (select auth.uid())::text
  )
);

drop policy if exists "delivery_schedule_dates_insert_org" on public.delivery_schedule_dates;
create policy "delivery_schedule_dates_insert_org"
on public.delivery_schedule_dates
for insert
to authenticated
with check (
  org_id in (
    select users.org_id
    from public.users
    where users.clerk_id = (select auth.uid())::text
  )
);

alter table public.deliveries
  drop constraint if exists deliveries_failed_requires_remarks,
  add constraint deliveries_failed_requires_remarks
    check (
      status <> 'failed'
      or nullif(btrim(failure_remarks), '') is not null
    );

alter table public.deliveries
  drop constraint if exists deliveries_cancelled_requires_remarks,
  add constraint deliveries_cancelled_requires_remarks
    check (
      status <> 'cancelled'
      or nullif(btrim(cancellation_remarks), '') is not null
    );

alter table public.delivery_schedules
  drop constraint if exists delivery_schedules_recurrence_shape_check,
  add constraint delivery_schedules_recurrence_shape_check
    check (
      (
        recurrence_type = 'one_time'
        and delivery_date is not null
        and start_date is null
        and weekdays is null
        and interval_weeks is null
        and day_of_month is null
        and interval_months is null
      )
      or (
        recurrence_type = 'weekly'
        and delivery_date is null
        and start_date is not null
        and weekdays is not null
        and array_length(weekdays, 1) >= 1
        and interval_weeks is not null
        and day_of_month is null
        and interval_months is null
      )
      or (
        recurrence_type = 'monthly'
        and delivery_date is null
        and start_date is not null
        and weekdays is null
        and interval_weeks is null
        and day_of_month is not null
        and interval_months is not null
      )
      or (
        recurrence_type = 'custom_dates'
        and delivery_date is null
        and weekdays is null
        and interval_weeks is null
        and day_of_month is null
        and interval_months is null
      )
    );

-- Update the current queue view so cancelled terminal rows do not appear in the
-- active queue, and so assigned/cancellation fields are available to the app.
create or replace view public.v_current_deliveries
with (security_invoker = true) as
select
  d.id,
  d.schedule_id,
  d.delivery_date,
  d.status,
  d.failure_remarks,
  d.cancellation_remarks,
  d.notes,
  d.assigned_to,
  d.delivered_by,
  d.completed_at,
  d.org_id,
  d.created_by,
  d.created_at,
  d.updated_at
from public.deliveries d
where d.deleted_at is null
  and d.status in ('pending', 'for_delivery');
