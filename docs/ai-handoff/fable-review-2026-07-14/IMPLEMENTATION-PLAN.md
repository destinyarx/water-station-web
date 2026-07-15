# Fable Review Implementation Plan — 2026-07-15

## Scope and source-of-truth decisions

This plan executes the review package against the current application and the
separate Supabase migration repository at
`water-station-supabase/supabase/migrations`. The migration repository is the
schema/RLS source of truth; this repository only receives reviewable migration
artifacts under this handoff folder.

### Explicitly skipped

- ISS-002: do not restore delivery revert/reopen behavior.
- ARC-003: the Supabase migration history intentionally lives in a separate
  repository.
- ARC-009: no monitoring vendor or dependency will be selected in this pass.
- ARC-008 Part 2: no component-test dependencies will be added without a
  separate owner decision.

### Resolved review decisions

- ISS-001: `customers.org_id` and `products.org_id` are UUID foreign keys to
  `organizations(id)`; reconcile documentation only.
- ISS-003: implement monthly recurrence generation because the accepted
  deliveries specification already requires it. The unified creation UI remains
  weekly/custom-dates by design; monthly rows remain supported for existing or
  externally-created schedules.
- ISS-005: customer updates use creator-or-owner rules. The source migration
  already has that policy, so no customer RLS migration is needed.
- ISS-006: use a private `documents` bucket, a 10 MiB server-side limit, and
  allow PDF, PNG, JPEG, and WebP. Files are retained when a row is soft-deleted
  because archived document records are restorable/auditable.
- ARC-007: keep the existing `useSyncExternalStore` stores and amend the docs;
  remove the TanStack Table/React Table mandate from the project guidance as
  requested. The unused `@tanstack/react-table` dependency is removed; existing list UIs are not mass-rewritten.

## Dependency order

1. Add CI/typecheck and low-risk security fixes.
2. Reconcile database documentation from the verified migrations.
3. Add small, reviewable migration artifacts for delivery RPCs, document
   storage, authoritative timestamps, and intended shared-queue RLS.
4. Implement application changes that depend on those migrations.
5. Add server-side pagination/filtering to customers, then products, expenses,
   and documents while preserving each module's existing states and design.
6. Add the shared mutation hook and migrate customers as the pilot feature.
7. Backfill/move tests, repair ADR/doc drift, and update ticket/spec notes.
8. Run focused tests after each feature, then the full test/lint/typecheck suite.

## Task breakdown

### Security and platform

- [x] Delete the production email playground route/feature (ISS-007).
- [x] Add the protected-layout Clerk gate and production logging guard (ISS-008).
- [x] Add `npm run typecheck` and GitHub CI (ARC-002).

### Database-backed reliability

- [x] Add atomic delivery status and occurrence-item replacement RPC migration
  artifacts, then switch services/tests to RPC (ISS-004).
- [x] Add document bucket/column/storage-policy migration and upload/download
  behavior (ISS-006).
- [x] Add server-maintained audit timestamp triggers and remove client-written
  `updated_at` values (ARC-006).
- [x] Align delivery/maintenance shared-queue UPDATE policies with the accepted
  domain specs while retaining owner-only archive enforcement (ARC-005).

### Feature correctness

- [x] Implement monthly recurrence and boundary tests (ISS-003).
- [x] Add customer creator/owner guards and tests (ISS-005).
- [x] Add exact unread-count query/invalidation and cap toasts at five (ISS-010).
- [x] Add role-aware predicates for remaining affected feature actions (ARC-005).

### Scalability and reuse

- [x] Move customers search/type/pagination and counts server-side (ARC-001).
- [x] Propagate the same service/query pattern to products, expenses, and
  documents without redesigning their pages (ARC-001).
- [x] Add and test `useEntityMutation`; migrate customer mutation hooks with
  behaviorally identical invalidation/toasts (ARC-004 pilot).

### Tests and documentation

- [x] Add documents and notifications unit/service tests; move maintenance and
  registration tests into feature `tests/` folders (ARC-008 Part 1).
- [x] Reconcile `docs/DATABASE.md` for customers, products, expenses, documents,
  delivery schedule dates, RPCs, storage, and timestamp triggers (ISS-001/009).
- [x] Accept ADR 0013 and synchronize state/table guidance (ARC-007).
- [x] Renumber duplicate/inconsistent ADR filenames and references (ARC-010).
- [x] Record behavior changes in the relevant feature specs and handoff tickets.

## Deployment boundary

Migration files created here are not applied automatically. Before deploying
dependent application changes, the database owner must copy/review them in the
Supabase migration repository, apply them in order to staging, run the manual
RLS/storage checks in `docs/DATABASE.md`, and only then deploy the web changes.
