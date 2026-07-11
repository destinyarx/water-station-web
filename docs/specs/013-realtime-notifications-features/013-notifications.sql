-- 013 — Real-time notifications: RLS, privileges, and realtime publication.
-- Run manually in the Supabase SQL editor (no supabase/ folder in this repo).
--
-- NOT included here (already deployed in the dashboard, do not re-run):
--   * CREATE TABLE public.notifications
--   * create_maintenance_notification() + its triggers on maintenance_tasks
--
-- See docs/specs/013-realtime-notifications-features/context.md and
-- docs/adr/0010-notifications-trigger-authored-consume-only.md for rationale.

-- 1. RLS ------------------------------------------------------------------
alter table public.notifications enable row level security;

-- 2. Privileges -----------------------------------------------------------
-- No INSERT policy exists → authenticated clients cannot insert. Rows are
-- written only by SECURITY DEFINER triggers. The column GRANT — not a policy —
-- is what limits an authenticated UPDATE to the is_read column (RLS cannot diff
-- old-vs-new to protect other columns).
revoke insert, update on public.notifications from authenticated;
grant  update (is_read) on public.notifications to authenticated;

-- 3. Policies -------------------------------------------------------------
-- SELECT: recipient reads only their own rows, within their org.
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select
  using (
    recipient_id = auth.jwt() ->> 'sub'
    and private.is_org_member(org_id)
  );

-- UPDATE: recipient may update their own rows; the column grant limits the
-- change to is_read.
drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update
  using ( recipient_id = auth.jwt() ->> 'sub' );

-- 4. Realtime -------------------------------------------------------------
-- Add the table to the realtime publication so Postgres Changes are streamed.
-- RLS above is enforced per-connection on the stream. REPLICA IDENTITY DEFAULT
-- is sufficient (we act on INSERT/UPDATE new-row data only).
alter publication supabase_realtime add table public.notifications;

-- 5. Manual verification (see DATABASE.md) --------------------------------
-- As user A: confirm the bell only shows A's rows; a direct select of another
-- user's / another org's notification returns nothing. Confirm an UPDATE that
-- sets any column other than is_read is rejected. Confirm a client INSERT is
-- rejected. Confirm a new maintenance assignment appears live without refresh.

-- 6. Troubleshooting: "marking read doesn't persist" ----------------------
-- Symptom: the bell updates optimistically but is_read reverts on reload.
-- Cause: RLS is enabled but the UPDATE policy and/or the is_read column grant
-- from steps 2-3 were not applied, so the UPDATE matches zero rows *without*
-- erroring. Run this to confirm both exist, then re-run steps 2-3 if missing:
--
--   select polname, cmd from pg_policies
--   where schemaname = 'public' and tablename = 'notifications';
--   -- expect: notifications_select (SELECT), notifications_update (UPDATE)
--
--   select privilege_type, column_name
--   from information_schema.column_privileges
--   where table_name = 'notifications' and grantee = 'authenticated';
--   -- expect: UPDATE on column is_read (and no table-wide UPDATE)
--
-- The client (markNotificationRead) uses .select().single() so a zero-row
-- update now raises a visible error toast instead of silently doing nothing.
