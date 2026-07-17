# Dashboard V1 Technical Plan

## Implementation status

Phases 1-4 and automated Phase 5 checks are complete as of 2026-07-17. Linked
migration history/dry-run/lint verification passes. Authenticated RLS/tenant,
representative query-plan, and signed-in browser QA remain manual production
sign-off items; see `MIGRATION.md` and `AI-HANDOFF.md`.

## Architecture

```txt
thin /dashboard route
  -> role-aware DashboardPage feature component
     -> TanStack Query hooks (period + reference date keys)
        -> dashboard service
           -> Supabase SECURITY INVOKER RPC
              -> RLS + owner role enforcement
                 -> bounded JSON validated by Zod
```

Financial and operational payloads remain separate end to end. Staff never run
the financial query.

## Phase 1 — specification and migration checkpoint

1. Complete the PRD, EARS requirements, acceptance criteria, research, this
   plan, and ordered issue slices.
2. Add canonical versioned migrations that:
   - abort on orphaned delivery/template rows, repair both incorrect
     self-referencing schedule foreign keys, and align only the users SELECT
     policy with the top-level organization claim;
   - snapshots `is_stock_tracked` on schedule and occurrence item rows;
   - backfills existing rows and guards future insert paths;
   - updates the atomic replacement function;
   - adds the two role-partitioned aggregate functions with explicit active-org
     predicates in addition to RLS and activity flags for empty-state context;
   - grants only authenticated execution and preserves RLS;
   - adds only the completed-delivery and expense date indexes justified by the
     new repeated predicates.
3. Update the ADR and database/delivery documentation.
4. Stop. A human applies the migration and supplies confirmation.
5. Verify live columns, trigger/function bodies, `SECURITY INVOKER`, volatility,
   grants, policies, indexes, RPC results, and tenant/owner behavior.

Application code that depends on the new snapshots or RPCs must not be reported
as working before step 5.

## Phase 2 — typed data layer

Create `src/features/dashboard` with:

- period, comparison, trend, financial, operational, queue, stock, and
  maintenance contracts;
- Zod schemas for snake_case RPC payloads and explicit camelCase mappers;
- pure UTC/ISO date range and display helpers;
- `dashboardKeys` containing period/reference date;
- a Supabase-only service with safe user-facing errors;
- owner-aware hooks, 60-second stale time, and previous-data retention.

The reference date is computed once by the feature page and passed to both
queries. Owner status comes from Clerk for query enablement/UX only; database
authorization remains authoritative.

## Phase 3 — interface

Replace the route preview with a thin import from the dashboard feature.

- Header: greeting, Delivery-sales disclosure, compact period selector.
- KPI row: one featured Delivery-sales card for owners; Today-only pending;
  completed deliveries; refill units.
- Owner analysis: accessible sales/expense chart and sales-mix visualization.
- Shared operations: today's queue and attention panels.
- Owner ranking: top five products.
- Staff layout: operational cards/sections reflow without empty financial space.
- Section-local skeleton, empty, refreshing, error, and retry states.

All new styling uses Tailwind and `--app-*` tokens. Charts use SVG/CSS plus a
screen-reader table/summary; no new dependency or global CSS is introduced.

## Phase 4 — targeted invalidation

Import only `dashboardKeys` through the dashboard feature public API. Invalidate:

- both dashboard families after delivery create/edit/status/cancel/fail/revert;
- financials after expense create/update/archive;
- operations after product stock/status/classification changes;
- operations after maintenance completion/cancellation/schedule visibility
  changes.

Do not clear the query cache.

## Phase 5 — verification

- Unit tests: date boundaries, trend math, schemas/mappers, decimals, malformed
  RPCs, query keys, service parameters/errors, role query enablement.
- Component tests: period switch, Today-only pending, roles, empty/partial-error
  states, retry, accessible chart labels.
- SQL/live checks: completed-time semantics, deleted rows, ranking, snapshots,
  grants, RLS, staff rejection, tenant isolation, and query plans.
- Commands: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.
- Manual UI: roles, themes, reduced motion, keyboard/screen reader, mobile through
  desktop, sidebar states, and all loading/error/empty/populated states.

## Rollback and failure handling

- The additive snapshot columns and functions do not remove source data.
- Revoke dashboard function execution to disable the feature if authorization
  verification fails.
- The application must render independent section errors when an RPC is absent
  or malformed; it must never fall back to downloading raw source tables.
- Do not drop snapshot columns after data has begun depending on them without a
  reviewed reverse migration.
