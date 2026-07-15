-- Atomic delivery state transitions and pending-occurrence edits. Security invoker keeps RLS active.
create or replace function public.set_delivery_status_atomic(
  p_delivery_id integer,
  p_expected_status text,
  p_new_status text,
  p_failure_remarks text default null,
  p_cancellation_remarks text default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_delivery public.deliveries%rowtype;
  v_product record;
  v_direction integer := 0;
begin
  select * into v_delivery
  from public.deliveries
  where id = p_delivery_id and deleted_at is null
  for update;

  if not found or v_delivery.status::text <> p_expected_status then
    raise exception 'Delivery was changed by another user.';
  end if;

  if not (
    (p_expected_status = 'pending' and p_new_status in ('for_delivery', 'cancelled'))
    or (p_expected_status = 'for_delivery' and p_new_status in ('completed', 'failed', 'cancelled'))
  ) then
    raise exception 'Illegal delivery status transition.';
  end if;
  if p_new_status = 'failed' and nullif(btrim(p_failure_remarks), '') is null then
    raise exception 'Failure remarks are required.';
  end if;
  if p_new_status = 'cancelled' and nullif(btrim(p_cancellation_remarks), '') is null then
    raise exception 'Cancellation remarks are required.';
  end if;

  if p_expected_status = 'pending' and p_new_status = 'for_delivery' then v_direction := -1; end if;
  if p_expected_status = 'for_delivery' and p_new_status in ('failed', 'cancelled') then v_direction := 1; end if;

  if v_direction <> 0 then
    for v_product in
      select p.id, p.stock,
        (select sum(di.quantity) from public.delivery_items di where di.delivery_id = p_delivery_id and di.product_id = p.id) as quantity
      from public.products p
      where p.org_id = v_delivery.org_id and p.is_stock_tracked and p.deleted_at is null
        and exists (select 1 from public.delivery_items di where di.delivery_id = p_delivery_id and di.product_id = p.id)
      order by p.id
      for update
    loop
      if trunc(v_product.quantity) <> v_product.quantity then
        raise exception 'Stock-tracked delivery quantities must be whole numbers.';
      end if;
      if v_product.stock + (v_direction * v_product.quantity)::integer < 0 then
        raise exception 'Insufficient product stock.';
      end if;
      update public.products
      set stock = stock + (v_direction * v_product.quantity)::integer
      where id = v_product.id;
    end loop;
  end if;

  update public.deliveries set
    status = p_new_status::public.delivery_status,
    delivered_by = case when p_new_status = 'for_delivery' then private.current_user_id() else delivered_by end,
    completed_at = case when p_new_status = 'completed' then now() else null end,
    failure_remarks = case when p_new_status = 'failed' then btrim(p_failure_remarks) else null end,
    cancellation_remarks = case when p_new_status = 'cancelled' then btrim(p_cancellation_remarks) else null end
  where id = p_delivery_id;
end;
$$;

create or replace function public.replace_delivery_items_atomic(
  p_delivery_id integer,
  p_delivery_date date,
  p_notes text,
  p_items jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_delivery public.deliveries%rowtype;
begin
  select * into v_delivery from public.deliveries
  where id = p_delivery_id and deleted_at is null
  for update;
  if not found or v_delivery.status::text <> 'pending' then
    raise exception 'Only pending deliveries can be edited.';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one delivery item is required.';
  end if;

  update public.deliveries
  set delivery_date = p_delivery_date, notes = nullif(btrim(p_notes), '')
  where id = p_delivery_id;

  delete from public.delivery_items where delivery_id = p_delivery_id;
  insert into public.delivery_items (delivery_id, product_id, product_name, unit_price, quantity, org_id)
  select
    p_delivery_id,
    item.product_id,
    left(btrim(item.product_name), 255),
    item.unit_price,
    item.quantity,
    v_delivery.org_id
  from jsonb_to_recordset(p_items) as item(product_id integer, product_name text, unit_price numeric, quantity numeric)
  join public.products p on p.id = item.product_id and p.org_id = v_delivery.org_id and p.deleted_at is null
  where item.quantity > 0 and item.unit_price >= 0 and nullif(btrim(item.product_name), '') is not null;

  if (select count(*) from public.delivery_items where delivery_id = p_delivery_id) <> jsonb_array_length(p_items) then
    raise exception 'One or more delivery items are invalid.';
  end if;
end;
$$;

revoke all on function public.set_delivery_status_atomic(integer, text, text, text, text) from public;
revoke all on function public.replace_delivery_items_atomic(integer, date, text, jsonb) from public;
grant execute on function public.set_delivery_status_atomic(integer, text, text, text, text) to authenticated;
grant execute on function public.replace_delivery_items_atomic(integer, date, text, jsonb) to authenticated;
