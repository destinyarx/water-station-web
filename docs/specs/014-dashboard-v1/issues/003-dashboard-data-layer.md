# 003 — Typed dashboard data layer

## Goal

Build strict TypeScript contracts, validation, mapping, services, query keys,
and hooks over the verified RPCs.

## Deliverables

- `src/features/dashboard` schemas, types, mapper, date/trend helpers, keys,
  service, hooks, and public barrel.
- 60-second caching and owner/staff query enablement.
- Focused unit/service tests.

## Dependency

Issue 002 live migration verification.

## Done when

- [x] Financial and operational result contracts remain separate and strict.
- [x] Zod validation and explicit snake-to-camel mapping cover both RPCs.
- [x] Query keys include period/reference date and retain previous-period data.
- [x] Staff sessions do not enable the financial query.
- [x] Date, schema/mapper, service, access, and query-key tests pass.
