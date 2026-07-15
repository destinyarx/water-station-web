# Fable review execution results — 2026-07-15

## Outcome

All owner-approved issue and architecture tickets in this review are implemented in the web repository. ISS-002, ARC-003, ARC-008 Part 2, and ARC-009 remain intentionally skipped per the owner notes. ISS-001 required documentation reconciliation only.

## Implemented

- ISS-003/004: monthly recurrence and atomic delivery status/item replacement RPC integration.
- ISS-005/006: creator-or-owner customer actions and private persisted document uploads with signed access.
- ISS-007/008: email playground removal, protected-layout authentication, and production log gating.
- ISS-009/010: database documentation reconciliation, exact unread totals, and a five-toast cap.
- ARC-001/002/004: server pagination for customers/products/expenses/documents, CI/typecheck, and the customer-pilot mutation helper.
- ARC-005/006: role-aware guards, shared operational-queue RLS artifacts, and server-owned audit timestamps.
- ARC-007/008/010: accepted state/table ADR, removed unused table dependency, backfilled/moved unit tests, and repaired ADR numbering.

## Migration artifacts

Apply only after review in the separate Supabase repository, in numeric order:

1. `001-expense-summary.sql`
2. `002-document-storage-and-visibility.sql`
3. `003-server-owned-audit-timestamps.sql`
4. `004-shared-operational-queue-rls.sql`
5. `005-atomic-delivery-writes.sql`
6. `006-notifications-consume-only-hardening.sql`

The dependent web changes must not be deployed before these migrations. Validate with owner and staff JWTs in staging, especially document privacy/storage, non-creator stock movement during delivery dispatch, owner-only schedule archive, cross-organization RPC calls, and notification column grants.

## Verification

- `npm run test`: 56 files, 229 tests passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed with 12 existing React Compiler/unused-code warnings and no errors.
- `git diff --check`: passed; Windows emitted line-ending conversion notices only.
- Focused product, expense, customer, delivery, document, notification, recurrence, mutation-helper, and toast tests passed during implementation.

`npm uninstall @tanstack/react-table` reported five dependency audit findings (three moderate, two high). No broad `npm audit fix` was run because dependency upgrades were not part of this review scope.

## Assumptions

- Existing monthly delivery schedules must continue materializing, but the current unified creation UI remains weekly/custom-date only.
- Document files are limited to PDF/PNG/JPEG/WEBP at 10 MiB, stored privately, and retained after metadata soft delete.
- Delivery and maintenance operations are shared organization queues; schedule archive remains owner-only.
- Database server triggers override client-provided soft-delete timestamps and own every `updated_at` value.
