# 002 — Snapshot and dashboard RPC migration

## Goal

Create the durable classification snapshot and least-privilege database
aggregation boundary.

## Deliverables

- Canonical prerequisite migration for the incorrect delivery parent foreign
  keys and the legacy users SELECT policy.
- Versioned canonical migration for both snapshot columns, backfill, write-path
  guards, atomic item replacement, active-organization-scoped dashboard RPCs,
  grants, and justified indexes.
- ADR plus database/delivery documentation updates.
- Manual apply and live verification instructions.

## Done when

- [x] Both migrations are prepared in the canonical Supabase repository for
  review.
- [x] The prerequisite and aggregate versions appear in the intended remote
  migration history; read-only column/relationship/anon-grant probes pass.
- [x] Human applies `20260717100000_fix_dashboard_helper_volatility.sql`;
  linked history/dry-run/lint verification passes.
- [ ] Live schema, functions, grants, RLS, role rejection, tenant isolation, and
  query plans are verified.

## Blocker

Application implementation is complete after the user's migration confirmation.
The unchecked live role/tenant/query-plan evidence remains required before
production sign-off.
