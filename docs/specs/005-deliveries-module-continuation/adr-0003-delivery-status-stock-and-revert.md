# ADR 0003 — Delivery status: stock movement on dispatch, reversible terminal states

**Status:** Accepted (2026-06-22)
**Context:** feature `005-deliveries-module-continuation`
**Supersedes (in part):** the "terminal `completed`/`failed`" assumption from
`docs/adr/0002-deliveries-two-entity-rolling-materialization.md` and issue 004.

## Context

The deliveries module needs to (a) keep `products.stock` correct as deliveries
move through their lifecycle, and (b) let staff undo a status they set by
mistake. Two design questions had real, hard-to-reverse trade-offs:

1. **When does a stock-tracked product leave inventory** — at `completed`
   (customer confirmed) or at `for_delivery` (loaded onto the truck)?
2. **Are `completed`/`failed` truly terminal**, or can a row be sent back to
   `pending`/`for_delivery` to fix a mistake and become editable again?

There is no inventory-movement/ledger table; `products.stock` is a single
integer column, and the app is the only writer of delivery status.

## Decision

### 1. Stock moves at dispatch, not at completion

Stock is considered **"out"** whenever a delivery's status is in
`{ for_delivery, completed }`, and **"in"** whenever it is in
`{ pending, failed }`. Only `is_stock_tracked = true` products move stock;
refills/fees never touch it.

A status change compares the old class against the new class:

- in → out: **deduct** each item's quantity from `products.stock`
- out → in: **restore** each item's quantity
- same class: no stock change

The deduction is **atomic and bounded**: it runs as an `update products set
stock = stock - qty where id = ? and stock >= qty`. If it affects zero rows the
stock is insufficient and the whole transition is rejected with a warning.
Negative stock is therefore impossible.

We chose **dispatch (`for_delivery`)** over **completion** because that is when
goods physically leave the station; blocking a shortage at dispatch is the
moment that matters operationally ("you cannot load 10 bottles you do not have").

We chose **direct mutation of `products.stock`** over a `stock_movements`
ledger because the station has no existing inventory-history concept and the
atomic guard already prevents the only failure that hurts (negative stock). The
delivery's own `status` is the record of whether its stock is currently out.

> `ponytail:` no movement ledger. Add a `stock_movements` table only if
> stock-audit history (per-delivery reservation trail, reconciliation) is ever
> required.

### 2. `completed`/`failed` are reversible

`completed` and `failed` are no longer dead-ends. The legal-transition map adds
revert edges so a mis-set status can be corrected, and a reverted row becomes
editable again when it lands on `pending`.

Crucially, **revert needs no special logic**. Every transition — forward or
reverse — is fed through the same three derived rules:

- **Stock:** the class comparison above.
- **`completed_at`:** set to `now()` iff the new status is `completed`, else
  `null` (so re-completing restamps the true completion time).
- **`failure_remarks`:** required iff the new status is `failed`, else cleared.

The complete legal-transition map:

| From → To | Stock | `completed_at` | `failure_remarks` | Editable after |
|---|---|---|---|---|
| `pending → for_delivery` | deduct | — | — | locked |
| `pending → failed` | — | — | require | locked |
| `for_delivery → completed` | — | set | — | locked |
| `for_delivery → failed` | restore | — | require | locked |
| `for_delivery → pending` (revert) | restore | — | — | editable |
| `completed → pending` (revert) | restore | clear | — | editable |
| `completed → for_delivery` (revert) | — | clear | — | locked |
| `failed → pending` (revert) | — | — | clear | editable |
| `failed → for_delivery` (revert) | deduct | — | clear | locked |

### 3. Editing is `pending`-only

A delivery occurrence (its `delivery_items`, notes, date) is editable **only
while `pending`** — i.e. before any stock has moved. `for_delivery`,
`completed`, and `failed` are locked. The path to edit a locked row is to revert
it to `pending` first (which restores stock and/or clears terminal fields via
the rules above), edit, then re-dispatch.

### 4. `completed_at` column

A `completed_at timestamp` column is added to `public.deliveries` to record the
real completion datetime, which can differ from `delivery_date` (a run planned
for Jun 25 but actually completed Jun 26). The "Completed today" metric is keyed
on `completed_at::date = today`; the "Active today" and "Pending backlog"
metrics are keyed on `delivery_date` (a non-completed row has no completion
time).

## Consequences

- **Positive:** one transition map + one boundary function handle forward and
  reverse with no per-direction special-casing; negative stock is structurally
  impossible; no new ledger table; mistakes are correctable.
- **Negative / accepted:** no per-movement audit trail (only current status);
  `products.stock` correctness depends on the app being the sole writer of
  status — a hand-edit in the DB that sets `completed` twice could double-count,
  which the app prevents but the schema does not.
- **Schema delta for 005:** `alter table public.deliveries add column
  completed_at timestamp`. (The only other migration object is the
  `v_current_deliveries` view; see the 005 migration script.)
- **Editing-while-`for_delivery`** is deliberately disallowed so we never have
  to reconcile a partial item edit against already-deducted stock.
