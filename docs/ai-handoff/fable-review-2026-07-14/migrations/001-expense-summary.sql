-- Review and apply in the water-station-supabase repository. Do not run from the web app.
create or replace function public.get_expense_summary()
returns table (
  total_expenses numeric,
  this_month numeric,
  this_month_count bigint,
  largest_category text,
  largest_category_total numeric,
  largest_expense numeric,
  largest_expense_label text,
  recent_expense_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with visible as (
    select *
    from public.expenses
    where deleted_at is null
  ), category_totals as (
    select category::text as category, sum(amount) as amount
    from visible
    group by category
    order by amount desc
    limit 1
  ), largest as (
    select name, amount
    from visible
    order by amount desc, id asc
    limit 1
  )
  select
    coalesce((select sum(amount) from visible), 0),
    coalesce((select sum(amount) from visible where date_incurred >= date_trunc('month', current_date)::date and date_incurred < (date_trunc('month', current_date) + interval '1 month')::date), 0),
    (select count(*) from visible where date_incurred >= date_trunc('month', current_date)::date and date_incurred < (date_trunc('month', current_date) + interval '1 month')::date),
    (select category from category_totals),
    coalesce((select amount from category_totals), 0),
    coalesce((select amount from largest), 0),
    (select name from largest),
    (select count(*) from visible where date_incurred between current_date - 6 and current_date);
$$;

revoke all on function public.get_expense_summary() from public;
grant execute on function public.get_expense_summary() to authenticated;
