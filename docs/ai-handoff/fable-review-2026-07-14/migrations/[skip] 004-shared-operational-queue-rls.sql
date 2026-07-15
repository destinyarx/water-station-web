-- Align RLS with the shared delivery/maintenance queue while preserving owner-only archives.
create or replace function private.guard_shared_queue_archive()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.deleted_at is null and new.deleted_at is not null and not private.is_org_admin(old.org_id) then
    raise exception 'Only an organization owner can archive this schedule.';
  end if;
  return new;
end;
$$;

create or replace function private.guard_product_member_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not private.is_org_admin(old.org_id)
     and old.created_by <> private.current_user_id()
     and row(new.product_name, new.price, new.is_stock_tracked, new.descriptions, new.is_active, new.org_id, new.created_by, new.deleted_at)
         is distinct from
         row(old.product_name, old.price, old.is_stock_tracked, old.descriptions, old.is_active, old.org_id, old.created_by, old.deleted_at) then
    raise exception 'Staff may only adjust stock for products created by another user.';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_product_member_update on public.products;
create trigger guard_product_member_update before update on public.products
for each row execute function private.guard_product_member_update();

drop policy if exists "Admins/org_owners or creator can update products in their organization" on public.products;
create policy "Members can update permitted products in their organization"
on public.products for update to authenticated
using (private.is_org_member(org_id) and deleted_at is null)
with check (private.is_org_member(org_id) and deleted_at is null);

drop policy if exists "Admins/org_owners or creator can update delivery_schedules in their organization" on public.delivery_schedules;
create policy "Members can update delivery_schedules in their organization"
on public.delivery_schedules for update to authenticated
using (private.is_org_member(org_id) and deleted_at is null)
with check (private.is_org_member(org_id));

drop trigger if exists guard_shared_queue_archive on public.delivery_schedules;
create trigger guard_shared_queue_archive before update on public.delivery_schedules
for each row execute function private.guard_shared_queue_archive();

drop policy if exists "Admins/org_owners or creator can update deliveries in their organization" on public.deliveries;
create policy "Members can update deliveries in their organization"
on public.deliveries for update to authenticated
using (private.is_org_member(org_id) and deleted_at is null)
with check (private.is_org_member(org_id) and deleted_at is null);

drop policy if exists "Admins/org_owners or creator can delete delivery_items in their organization" on public.delivery_items;
create policy "Members can replace delivery_items in their organization"
on public.delivery_items for delete to authenticated
using (private.is_org_member(org_id));

drop policy if exists "Admins/org_owners or creator can delete delivery_schedule_items in their organization" on public.delivery_schedule_items;
create policy "Members can replace delivery_schedule_items in their organization"
on public.delivery_schedule_items for delete to authenticated
using (private.is_org_member(org_id));

drop policy if exists "Admins/org_owners or creator can update maintenance_schedules in their organization" on public.maintenance_schedules;
create policy "Members can update maintenance_schedules in their organization"
on public.maintenance_schedules for update to authenticated
using (private.is_org_member(org_id) and deleted_at is null)
with check (private.is_org_member(org_id));

drop trigger if exists guard_shared_queue_archive on public.maintenance_schedules;
create trigger guard_shared_queue_archive before update on public.maintenance_schedules
for each row execute function private.guard_shared_queue_archive();

drop policy if exists "Admins/org_owners or creator can update maintenance_tasks in their organization" on public.maintenance_tasks;
create policy "Members can update maintenance_tasks in their organization"
on public.maintenance_tasks for update to authenticated
using (private.is_org_member(org_id) and deleted_at is null)
with check (private.is_org_member(org_id) and deleted_at is null);
