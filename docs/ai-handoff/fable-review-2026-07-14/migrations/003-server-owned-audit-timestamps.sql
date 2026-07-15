-- Centralize updated_at and soft-delete timestamps in Postgres.
create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.touch_ai_conversation(p_conversation_id bigint)
returns void language sql security invoker set search_path = '' as $$
  update public.ai_conversations set updated_at = now() where id = p_conversation_id;
$$;
revoke all on function public.touch_ai_conversation(bigint) from public;
grant execute on function public.touch_ai_conversation(bigint) to authenticated;

create or replace function private.set_updated_and_deleted_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  if old.deleted_at is null and new.deleted_at is not null then
    new.deleted_at = now();
  end if;
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['customers', 'products', 'expenses', 'delivery_schedules', 'deliveries', 'maintenance_schedules', 'maintenance_tasks', 'documents'] loop
    execute format('drop trigger if exists set_server_audit_timestamps on public.%I', table_name);
    execute format('create trigger set_server_audit_timestamps before update on public.%I for each row execute function private.set_updated_and_deleted_at()', table_name);
  end loop;
  foreach table_name in array array['delivery_schedule_items', 'delivery_items', 'ai_conversations'] loop
    execute format('drop trigger if exists set_server_updated_at on public.%I', table_name);
    execute format('create trigger set_server_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name);
  end loop;
end;
$$;
