# Dashboard V1 Migration Handoff

## Status

The user confirmed application on 2026-07-17. Linked verification now shows the
canonical local and remote histories synchronized through `20260717100000`,
`supabase db push --linked --dry-run` reports the remote database is up to date,
and linked database lint reports no schema warnings or errors. The AI agent did
not run a non-dry-run push.

Dashboard application code is implemented. Authenticated owner/staff,
multi-membership tenant-isolation, SQL metadata, and representative query-plan
checks below remain deployment evidence to capture with real Clerk sessions and
SQL access.

The authoritative files are in the linked `water-station-supabase` repository:

1. `supabase/migrations/20260717080000_repair_delivery_parent_relations_and_users_rls.sql`
2. `supabase/migrations/20260717090000_dashboard_v1_aggregates.sql`
3. `supabase/migrations/20260717100000_fix_dashboard_helper_volatility.sql`

The web repository deliberately contains no executable copy. This prevents two
migration histories from drifting.

## Why there are two migrations

Read-only PostgREST relationship probes confirmed that the live foreign keys on
`deliveries.schedule_id` and `delivery_schedule_items.schedule_id` point back to
their own tables. The first migration aborts if the intended schedule parent is
missing, repairs both constraints, and changes only the `users` SELECT policy to
use the documented top-level Clerk `organization` claim plus membership.

The second migration adds durable classification snapshots and the two bounded,
role-partitioned Dashboard V1 aggregate functions. Every aggregate query is
explicitly restricted to the active JWT organization in addition to source-table
RLS.

Linked database lint classified three private date/JSON helpers as `STABLE`
rather than `IMMUTABLE`. The third migration corrects planner metadata only; it
does not alter function bodies or payload behavior.

## Applied order and linked verification

The linked project reference was `yiguiyjnuvxrhqjyyykv` during preparation.
Confirm it is still the intended target before future migration work.

From the `water-station-supabase` repository:

```powershell
npx supabase migration list --linked
npx supabase db push --linked --dry-run
```

Remote history contains the prerequisite sequence followed by the Dashboard
follow-up, in this order:

1. `20260716001701_grant_authenticated_private_schema_usage.sql`
2. `20260716010000_fix_soft_delete_policies_and_add_maintenance_cancellation.sql`
3. `20260717080000_repair_delivery_parent_relations_and_users_rls.sql`
4. `20260717090000_dashboard_v1_aggregates.sql`
5. `20260717100000_fix_dashboard_helper_volatility.sql`

The current dry run lists no pending migration. If future history differs, stop
and reconcile it. Do not use `--include-all`, mark migrations applied manually,
or run an edited SQL subset.

## Read-only preflight

Run these queries before the remaining push. Both orphan counts must be zero.

```sql
select count(*) as orphaned_deliveries
from public.deliveries as d
left join public.delivery_schedules as ds on ds.id = d.schedule_id
where ds.id is null;

select count(*) as orphaned_schedule_items
from public.delivery_schedule_items as dsi
left join public.delivery_schedules as ds on ds.id = dsi.schedule_id
where ds.id is null;
```

Capture the current constraints, RLS flags, and policies for comparison:

```sql
select
  con.conname,
  con.conrelid::regclass as child_table,
  con.confrelid::regclass as parent_table,
  con.convalidated,
  pg_get_constraintdef(con.oid) as definition
from pg_constraint as con
where con.contype = 'f'
  and con.conrelid in (
    'public.deliveries'::regclass,
    'public.delivery_schedule_items'::regclass
  )
order by child_table::text, con.conname;

select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity,
  c.relforcerowsecurity
from pg_class as c
join pg_namespace as n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'users', 'customers', 'products', 'expenses',
    'delivery_schedules', 'delivery_schedule_items',
    'deliveries', 'delivery_items',
    'maintenance_schedules', 'maintenance_tasks'
  )
order by c.relname;

select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'users', 'customers', 'products', 'expenses',
    'delivery_schedules', 'delivery_schedule_items',
    'deliveries', 'delivery_items',
    'maintenance_schedules', 'maintenance_tasks'
  )
order by tablename, policyname;
```

## Apply record

The human-applied migration was confirmed with:

```powershell
npx supabase db push --linked
npx supabase migration list --linked
```

All dashboard migrations are transactional. The final migration changes only
helper volatility metadata.

## Structural verification

### Parent relationships

```sql
select
  con.conname,
  con.conrelid::regclass as child_table,
  con.confrelid::regclass as parent_table,
  con.convalidated,
  pg_get_constraintdef(con.oid) as definition
from pg_constraint as con
where con.conname in (
  'deliveries_schedule_id_fkey',
  'delivery_schedule_items_schedule_id_fkey'
)
order by con.conname;
```

Expected: both parents are `delivery_schedules`, both are validated, and the
template-item relationship retains `ON DELETE CASCADE`.

### Snapshot columns and triggers

```sql
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('delivery_schedule_items', 'delivery_items')
  and column_name = 'is_stock_tracked'
order by table_name;

select
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation,
  action_statement
from information_schema.triggers
where trigger_schema = 'public'
  and trigger_name in (
    'set_delivery_schedule_item_classification',
    'set_delivery_item_classification'
  )
order by event_object_table, event_manipulation;
```

Expected: both columns are `boolean`/`NO`; both classification triggers exist.

### Functions and grants

```sql
select
  n.nspname as schema_name,
  p.proname,
  p.prosecdef as security_definer,
  p.provolatile,
  pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc as p
join pg_namespace as n on n.oid = p.pronamespace
where n.nspname in ('public', 'private')
  and p.proname in (
    'dashboard_active_org_id',
    'dashboard_period_range',
    'dashboard_comparison_ranges',
    'dashboard_trend',
    'get_dashboard_financials',
    'get_dashboard_operations',
    'replace_delivery_items_atomic'
  )
order by n.nspname, p.proname;

select
  has_function_privilege(
    'authenticated',
    'public.get_dashboard_financials(text,date)',
    'execute'
  ) as authenticated_financials,
  has_function_privilege(
    'anon',
    'public.get_dashboard_financials(text,date)',
    'execute'
  ) as anon_financials,
  has_function_privilege(
    'authenticated',
    'public.get_dashboard_operations(text,date)',
    'execute'
  ) as authenticated_operations,
  has_function_privilege(
    'anon',
    'public.get_dashboard_operations(text,date)',
    'execute'
  ) as anon_operations;
```

Expected: both public RPCs are `SECURITY INVOKER`, `STABLE`, executable by
`authenticated`, and not executable by `anon`. After `20260717100000`, all
three private calendar/trend helpers also report `provolatile = 's'`.

### RLS and policy delta

Re-run the preflight RLS/policy queries. Every listed source table must still
have `relrowsecurity = true`. The only intended policy change is:

```sql
select policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public'
  and tablename = 'users'
  and policyname = 'Users can view users in their organization';
```

Its predicate must compare `users.org_id` with the top-level
`auth.jwt() ->> 'organization'` claim and also call
`private.is_org_member(org_id)`.

### Indexes

```sql
select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'deliveries_dashboard_completed_idx',
    'expenses_dashboard_date_idx'
  )
order by indexname;
```

## Authenticated verification

Use real Clerk-backed Supabase clients; never a service-role client:

1. Owner in org A: both RPCs succeed for all four periods.
2. Staff in org A: operations succeeds; financials returns SQLSTATE `42501`.
3. User with memberships in org A and org B: switching the active JWT
   `organization` changes the result scope; neither call combines both orgs.
4. Org A results contain no org B fixtures.
5. Operations JSON contains no financial key at any nesting level.
6. Unsupported/null periods are rejected.
7. Create a schedule with multiple items, materialize an occurrence, and replace
   a pending occurrence's items; both snapshot columns remain non-null and
   correct.
8. Assigned delivery/maintenance rows return the same-org assignee name; an
   org-B user is not visible from org A.

## Query plans

With representative data, run `EXPLAIN (ANALYZE, BUFFERS)` for the completed
delivery and expense range predicates inside the financial RPC. Confirm the
explicit `org_id` and period bounds use reasonable plans. Record the results in
`research.md`; add no further index without evidence.

## Remaining live evidence

Capture the redacted structural query results, authenticated role/tenant
results, and query-plan summary before production sign-off. Issues 003-005 and
the `/dashboard` implementation are complete; these checks are no longer an
application-code blocker, but they remain required security/performance QA.
