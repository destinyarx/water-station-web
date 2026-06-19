# Slice 007 — Per-occurrence editing + price-snapshot integrity

**Type:** AFK · **Epic:** `001-foundation.md`

## Parent

`docs/specs/004-deliveries-module/001-foundation.md`
PRD: `docs/specs/004-deliveries-module/deliveries-prd.md`

## What to build

Allow staff to adjust a single delivery occurrence — its line items, notes, or
date — without touching the parent schedule's template or any sibling occurrence.
This is the "this Thursday they also wanted 2 extra bottles" case. Editing an
occurrence operates only on its own `delivery_items` snapshot and fields.

Together with this, verify and lock in snapshot integrity: because each
occurrence's items store `product_name` and `unit_price` captured at
materialization, later product repricing, renaming, or soft-deleting must not
change the displayed history of past deliveries. Line and delivery totals are
computed in the app from the snapshot, never persisted.

## Acceptance criteria

- [ ] Editing one occurrence's items/notes/date leaves the schedule template and
      all sibling occurrences unchanged.
- [ ] After a product is repriced/renamed/soft-deleted, an existing delivery
      still shows its original snapshot name and price.
- [ ] Line totals and the delivery total are computed and displayed; no total
      column is persisted.
- [ ] Submit disabled while pending; list refreshes on success; Supabase errors
      handled.
- [ ] Tests: mapper/total computation; service test that occurrence-item edits do
      not mutate template rows; snapshot-display test against a changed product.
      Typecheck/lint/tests green.

## Blocked by

- `004-delivery-status-lifecycle.md`
