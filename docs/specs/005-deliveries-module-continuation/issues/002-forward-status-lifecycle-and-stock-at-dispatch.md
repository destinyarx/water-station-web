# Slice 002 — Forward status lifecycle + stock-at-dispatch

**Type:** AFK · **Feature:** `005-deliveries-module-continuation`

## Parent

PRD: `docs/specs/005-deliveries-module-continuation/prd.md`
ADR: `docs/specs/005-deliveries-module-continuation/adr-0003-delivery-status-stock-and-revert.md`

## What to build

Let staff move a delivery occurrence through its **forward** operating lifecycle
from the main queue table, and keep `products.stock` correct as goods leave the
station. This is the core of the module; build it behind a single pure decision
function so the revert slice (003) can reuse it unchanged.

End-to-end behavior:

- A status-aware **row-action menu** on each delivery offers only the legal
  forward transitions for that row's current status:
  - `pending → for_delivery`
  - `pending → failed`
  - `for_delivery → completed`
  - `for_delivery → failed`
- Moving to `for_delivery` **deducts** stock for every stock-tracked line item
  (`is_stock_tracked = true`) from `products.stock`, and **auto-stamps**
  `delivered_by` with the acting Clerk user. The deduction is **atomic and
  blocks negative stock**: it must not allow `products.stock` to go below zero;
  if any line would, the whole transition is rejected and the user sees a clear
  warning naming the short product. Non-stock products never touch stock.
- Moving `for_delivery → completed` stamps `completed_at = now()`; no further
  stock change.
- Moving to `failed` (from `pending` or `for_delivery`) opens a dialog requiring
  non-empty `failure_remarks` (submit disabled until filled). A `for_delivery →
  failed` transition **restores** the previously deducted stock; `pending →
  failed` moves no stock.

The transition decision must live in a **pure function**
(e.g. `resolveStatusTransition(from, to, items)`) returning: whether the edge is
legal, the per-product stock deltas, whether `completed_at` should be set,
whether `delivered_by` should be stamped, and whether `failure_remarks` is
required. The stock invariant (from ADR 0003): stock is "out" iff status ∈
`{ for_delivery, completed }`; in→out deducts, out→in restores, same-class does
nothing.

After a successful status mutation, **invalidate** the deliveries / current-queue
/ schedules query keys so all views re-derive. **Do not** write
`delivery_schedules` on a status change.

## Acceptance criteria

- [ ] The row menu shows only the four legal forward transitions above for the
      row's current status; terminal-from-here options are absent.
- [ ] `pending → for_delivery` deducts each stock-tracked line from
      `products.stock` and stamps `delivered_by` with the Clerk user id from
      session (never form input).
- [ ] A dispatch that would drive any product's stock below zero is rejected
      atomically (no partial deduction) with a user-friendly warning; stock is
      unchanged.
- [ ] Non-stock-tracked products are excluded from all stock writes.
- [ ] `for_delivery → completed` sets `completed_at`; `for_delivery → failed`
      restores the deducted stock.
- [ ] Marking `failed` requires non-empty `failure_remarks` (enforced in the
      form and by the existing DB CHECK); submit is disabled until valid.
- [ ] The status decision is a pure, table-tested function covering every legal
      and illegal forward edge, its stock deltas, and its field effects.
- [ ] Supabase errors surface as friendly messages; a successful mutation
      invalidates the deliveries/current-queue/schedules query keys.
- [ ] `delivery_schedules` is never written by a status change.
- [ ] Typecheck, lint, and tests pass; no `any`, no `@ts-ignore`.

## Blocked by

- `001-schema-migration-completed-at-and-current-queue-view.md` (needs
  `completed_at`).
