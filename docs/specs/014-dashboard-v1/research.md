# Dashboard V1 Research

## Repository findings

- `/dashboard` now composes the focused `src/features/dashboard` module; the
  former landing-page `DashboardPreview` route reuse was removed.
- `/sales` is not a data source. Delivery snapshots are the only approved V1
  sales source.
- TanStack Query 5.101 supports `placeholderData: keepPreviousData`.
- The app already forwards the Clerk token through the Supabase client's
  `accessToken` option.
- Owner UX checks use the top-level `sessionClaims.is_owner`; database role
  enforcement is available through the `private.org_role(org_id)` /
  `private.is_org_admin(org_id)` membership helpers.
- Existing delivery creation has three item paths: template insertion,
  custom-date occurrence insertion, and recurring materialization. Pending
  occurrence edits use `replace_delivery_items_atomic`.
- Existing delivery status and edit services already call atomic RPCs, although
  their SQL source currently lives in the earlier review handoff rather than the
  versioned migration folder.
- `LOW_STOCK_THRESHOLD` is 10.

## Canonical migration and live Data API inspection (2026-07-17)

The web repository is not Supabase-linked. The sibling
`water-station-supabase` repository is linked to project
`yiguiyjnuvxrhqjyyykv`. The user confirmed migration application. On
2026-07-17, linked local and remote histories matched through `20260717100000`,
the linked dry run reported the remote database up to date, and linked database
lint returned no warnings or errors. The AI agent did not run a non-dry-run
push.

Read-only schema probes were made through PostgREST using the configured public
key and `limit=0`; no business rows or secrets were read. The canonical linked
schema initially passed `supabase db lint --linked`; after the dashboard
migrations appeared remotely, lint reported that three private helpers used
stable expressions while marked immutable. Canonical follow-up migration
`20260717100000_fix_dashboard_helper_volatility.sql` corrects planner metadata
without changing function bodies.

The initial audit confirmed the following gaps before migration:

- `delivery_schedule_items.is_stock_tracked` does not exist.
- `delivery_items.is_stock_tracked` does not exist.
- `get_dashboard_financials(text,date)` does not exist.
- `get_dashboard_operations(text,date)` does not exist.
- Calls with the exact application parameters resolve the existing
  `set_delivery_status_atomic` and `replace_delivery_items_atomic` names.
- Expense, product, maintenance, user, and core delivery columns used by the
  proposed dashboard are exposed.
- `deliveries` does not contain `customer_id`; recipient identity correctly
  belongs to `delivery_schedules`.
- PostgREST resolves `deliveries -> deliveries` and
  `delivery_schedule_items -> delivery_schedule_items` relationships, but
  rejects both intended relationships to `delivery_schedules` with `PGRST200`.
  This matches the self-referencing foreign keys in the original migration
  files and requires a guarded prerequisite repair.
- The original canonical `users` SELECT policy read
  `auth.jwt()->'user_metadata'->>'organization'`, while the application contract
  documents a top-level `organization` UUID claim. The prerequisite migration
  replaces only that SELECT policy and retains a membership check.
- After migration, both snapshot-column probes and both intended
  child-to-`delivery_schedules` relationship probes returned HTTP 200.
- Anon calls to both dashboard RPCs return HTTP 401 / SQLSTATE `42501`
  (`permission denied for function`), confirming the RPC names resolve and anon
  execution is revoked.

Not observable through the public Data API:

- function bodies, volatility/security flags, grants, policy expressions,
  trigger bodies, index definitions, or `EXPLAIN (ANALYZE, BUFFERS)` plans;
- authenticated owner/staff/cross-tenant results without test sessions.

Those remain mandatory production-sign-off evidence even though migration
application and linked CLI verification are complete.

## Historical classification gap

Current item snapshots keep product name, price, and quantity but not product
classification. A backfill can copy the present product or template value, but
cannot prove what a product's classification was when an old delivery was
completed if that product was edited later. The migration records the best
available value; this limitation is retained in the dashboard copy/docs.

For new writes, a database trigger derives the template snapshot from the
product and derives an occurrence snapshot from the schedule template when
possible. This protects the migration/deployment transition. Updated client and
atomic paths will also copy the field explicitly so intent remains visible in
application code.

## Query boundary decision

Two JSON RPCs are preferable to one role-shaped payload:

- the financial RPC can fail closed for non-owners and never populate the staff
  cache;
- the operational RPC has a structurally non-financial response;
- each section can retry independently;
- PostgreSQL aggregates bounded rows and returns a small payload.

Source-table RLS remains mandatory, but membership-based policies alone can
make multiple organizations visible to the same Clerk subject. Both dashboard
RPCs therefore derive the active top-level `organization` claim, verify that
membership, and add explicit `org_id` predicates to every source query. This
keeps the selected Clerk organization as the dashboard tenant even for a user
with more than one membership and makes the composite indexes usable.

Each response includes a non-financial all-time activity boolean. The client
uses it only to distinguish a genuinely new station from an empty selected
period; it does not replace bounded period metrics.

No new indexes should be added merely from intuition. The migration includes
only the two access paths directly introduced by the repeated completed-time
and expense-date predicates; all other index additions require live query-plan
evidence after realistic data is available.

## Design translation

`docs/DESIGN.md` is authoritative. The supplied HTML contributes only the KPI →
analysis → operations/attention → top-products hierarchy. New code will use
Tailwind, `--app-*` tokens, Poppins, compact stat dimensions, existing shell,
Lucide icons, responsive stacking, and accessible SVG/CSS charts. Its inline
CSS, mock data, custom tokens, sidebar, and header are intentionally excluded.

## Implementation verification (2026-07-17)

- Added strict, separate financial/operational schemas, mappers, service calls,
  query keys, owner-aware hooks, UTC date helpers, and component/view helpers.
- Added the responsive role-aware dashboard, accessible SVG/CSS charts,
  independent loading/error/empty states, Today-only pending metrics, and
  operational queue/stock/maintenance panels.
- Carried `is_stock_tracked` through client delivery creation/materialization;
  the database trigger remains authoritative.
- Added targeted invalidation for delivery, expense, product, and maintenance
  mutations without clearing the whole cache.
- `npm run typecheck`, all 278 tests, and `npm run build` pass. `npm run lint`
  passes with 12 pre-existing warnings outside the dashboard and no errors.

## Open verification items

- Inspect live function definitions, grants, RLS policies, triggers, and indexes.
- Run authenticated owner/staff, multi-membership, and cross-organization RPC
  attempts using real Clerk-backed Supabase clients.
- Capture query plans with representative data volume.
- Perform signed-in mobile/desktop, sidebar, light/dark, keyboard, reduced-motion,
  and populated/empty/error visual QA; the browser runtime was unavailable in
  this implementation session.
