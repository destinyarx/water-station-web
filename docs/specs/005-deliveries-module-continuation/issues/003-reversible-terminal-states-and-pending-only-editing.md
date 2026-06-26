# Slice 003 — Reversible terminal states + pending-only editing

**Type:** AFK · **Feature:** `005-deliveries-module-continuation`

## Parent

PRD: `docs/specs/005-deliveries-module-continuation/prd.md`
ADR: `docs/specs/005-deliveries-module-continuation/adr-0003-delivery-status-stock-and-revert.md`

Stories: 8, 9.

## What to build

Make `completed` and `failed` **reversible** and gate occurrence editing on
`pending`. This slice adds the **revert** edges on top of the forward lifecycle
from 002 — and because the transition logic lives in the pure
`resolveStatusTransition(from, to, items)` function, revert should need **no new
branching**: it is just more cells of the same class-comparison table.

End-to-end behavior:

- The row-action menu offers revert transitions for terminal rows:
  - `completed → pending`, `completed → for_delivery`
  - `failed → pending`, `failed → for_delivery`
- Stock follows the same class invariant (ADR 0003): stock is "out" iff status ∈
  `{ for_delivery, completed }`.
  - `completed → pending` is out→in ⇒ **restore** stock.
  - `completed → for_delivery` is out→out ⇒ **no** stock change; clears
    `completed_at`.
  - `failed → for_delivery` is in→out ⇒ **deduct** (atomic, blocks negative,
    same warning as 002); stamps `delivered_by`.
  - `failed → pending` is in→in ⇒ **no** stock change.
- Derived fields on revert, applied by the same rules as forward:
  `completed_at` cleared whenever the new status is not `completed`;
  `failure_remarks` cleared whenever the new status is not `failed`.
- **Editing is pending-only:** a delivery's items, notes, and date are editable
  **only while `pending`**. In `for_delivery`/`completed`/`failed` the edit
  affordance is disabled; the user must revert to `pending` first. A row that is
  reverted to `pending` becomes editable again.

## Acceptance criteria

- [ ] The row menu shows the four revert transitions above for terminal rows.
- [ ] `completed → pending` restores stock; `failed → for_delivery` re-deducts
      stock atomically (negative blocked with the same warning as 002).
- [ ] `completed → for_delivery` clears `completed_at` and moves no stock;
      `failed → pending` moves no stock.
- [ ] Revert is handled by the **same** `resolveStatusTransition` function with
      no revert-specific special-casing; new table tests cover all four revert
      edges (legality, stock delta, field clears).
- [ ] The edit affordance is enabled only for `pending` rows; locked rows expose
      revert instead, and a reverted-to-`pending` row is editable again.
- [ ] Status changes invalidate the deliveries/current-queue/schedules query
      keys and never write `delivery_schedules`.
- [ ] Typecheck, lint, and tests pass; no `any`, no `@ts-ignore`.

## Blocked by

- `002-forward-status-lifecycle-and-stock-at-dispatch.md` (reuses
  `resolveStatusTransition` and the atomic stock path).
