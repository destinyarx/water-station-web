# ADR 0016 — Dashboard financial and operational aggregates are separate security boundaries

- **Status:** Proposed; all three Dashboard migrations are applied, linked
  history/dry-run/lint verification passes, and the application is implemented.
  Accept after authenticated RLS/role/tenant and query-plan verification passes.
- **Date:** 2026-07-17
- **Feature:** `docs/specs/014-dashboard-v1/`
- **Migrations (authoritative `water-station-supabase` repository):**
  - full path: `C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\water-station-supabase\supabase\migrations`
  `supabase/migrations/20260717080000_repair_delivery_parent_relations_and_users_rls.sql`,
  `supabase/migrations/20260717090000_dashboard_v1_aggregates.sql`, and
  `supabase/migrations/20260717100000_fix_dashboard_helper_volatility.sql`

## Context

Dashboard V1 combines owner-only financial analysis with shared operational
information. A single database payload shaped in React would allow staff to
receive financial values even if the UI hid them. Downloading raw deliveries,
items, expenses, products, and maintenance tasks would also create excessive
payloads and duplicate security-sensitive aggregation in the browser.

Completed delivery items snapshot price/name/quantity but not the product's
stock-tracking classification. Joining historical rows to today's product value
would rewrite refill and sales-mix history when a product is reclassified.

## Decision

1. Add `is_stock_tracked` snapshots to `delivery_schedule_items` and
   `delivery_items`. New occurrence items prefer the schedule snapshot; pending
   occurrence-only items fall back to the product classification at edit time.
2. Backfill existing rows with the best available schedule/product value and
   document that earlier product reclassification cannot be reconstructed.
3. Aggregate in PostgreSQL through two bounded JSON functions:
   - `get_dashboard_financials(text,date)` — strict organization-owner access;
   - `get_dashboard_operations(text,date)` — shared organization operations and
     structurally no financial fields.
4. Both functions are stable, read-only, `SECURITY INVOKER`, and accept no
   tenant or role parameter. They retain source-table RLS and also constrain
   every query to the validated active Clerk `organization` claim so a caller
   with multiple memberships cannot combine organizations.
5. The browser validates unknown JSON with Zod and keeps the two result/cache
   families separate. Staff never enable the financial query.
6. Calendar periods use one reference date, half-open ranges, Monday-start
   weeks, calendar month-to-date, and aligned previous spans.
7. A prerequisite migration repairs the two incorrect self-referencing
   delivery schedule foreign keys and aligns the `users` SELECT policy with the
   top-level organization claim. No other source-table RLS policy changes.
8. Each result includes a role-appropriate all-time activity boolean solely for
   distinguishing true-empty and period-empty interface states.

## Consequences

- Database authorization, not CSS, prevents financial disclosure to staff.
- One section can fail/retry without blanking the other.
- The client receives bounded aggregates and operational previews instead of
  source-table history.
- Snapshot storage and write-path maintenance increase slightly, but historical
  classification stops depending on mutable product rows.
- Pre-migration historical classifications are best-effort, not provably exact.
- The operational result may include refill quantities but never unit price,
  revenue, expense, or product-sales values.
- Explicit active-organization predicates complement, rather than replace, RLS
  and improve use of the organization/period indexes.
- Live query plans must justify any indexes beyond the two repeated period
  access paths included in the migration.

## Alternatives considered

**One dashboard RPC with role-conditional fields.** Rejected because a mistake
in JSON construction or caching could put financial values in a staff response.

**Client-side aggregation.** Rejected because it downloads excessive tenant
data, weakens the least-privilege boundary, and makes metric logic inconsistent.

**Join delivery history to current products.** Rejected because product edits
would retroactively change refill units and sales mix.

**Product-name refill heuristics.** Rejected because names are mutable and fees
or services can also be non-stock-tracked.
