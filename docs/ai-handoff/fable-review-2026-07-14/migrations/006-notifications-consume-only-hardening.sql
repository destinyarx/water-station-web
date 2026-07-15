-- Reconcile the source migration with ADR 0010: clients consume and mark read only.
drop policy if exists "Members can add notifications in their organization" on public.notifications;
drop policy if exists "Recipient users can update notifications in their organization" on public.notifications;

create policy "Recipients can mark their notifications read"
on public.notifications for update to authenticated
using (private.is_org_member(org_id) and recipient_id = private.current_user_id())
with check (private.is_org_member(org_id) and recipient_id = private.current_user_id());

revoke insert on public.notifications from authenticated;
revoke update on public.notifications from authenticated;
grant update (is_read) on public.notifications to authenticated;

alter function public.create_maintenance_notification() set search_path = '';

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;
