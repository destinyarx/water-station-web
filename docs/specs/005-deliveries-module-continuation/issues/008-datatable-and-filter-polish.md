# Slice 008 — Datatable & filter polish

**Type:** AFK · **Feature:** `005-deliveries-module-continuation`

## Parent

PRD: `docs/specs/005-deliveries-module-continuation/prd.md`
DESIGN: `docs/DESIGN.md`

Stories: 25, 26, 27.

## What to build

The visual scan-ability pass over the deliveries datatables, done last so it
polishes the finished tables rather than chasing them.

End-to-end behavior:

- **Column sizing:** the narrow columns (date, status, total) are sized to their
  content so the wider columns (recipient, items) get the remaining space; the
  table reads cleanly without horizontal cramming.
- **Product icons:** stock-tracked vs non-stock products (`is_stock_tracked`)
  render **different icons**, so services (refills, fees) are distinguishable
  from physical goods at a glance.
- **Filter affordances:** the status filter and the sort control have clear,
  distinct icons so they are not confused with each other.
- Purely presentational — no change to queries, pagination, or status/stock
  logic. Follow `docs/DESIGN.md` (water/freshness direction, shadcn components).

## Acceptance criteria

- [ ] Date, status, and total columns are content-sized; recipient and items
      columns take the freed space; no cramped/overflowing layout.
- [ ] Stock-tracked and non-stock products show distinct icons driven by
      `is_stock_tracked`.
- [ ] Status and sort filters have clear, distinct icons.
- [ ] No behavioral/query changes; existing table behavior and tests still pass.
- [ ] Follows `docs/DESIGN.md`; uses shadcn/ui + Tailwind, `cn()` for conditional
      classes, no arbitrary values unless needed.
- [ ] Typecheck and lint pass; no `any`, no `@ts-ignore`.

## Blocked by

- `004-current-queue-today-cards-and-pagination.md` (main queue table).
- `005-history-modal-and-revert-from-history.md` (history table).
- `007-recurring-schedule-list-modal-and-stop-resume.md` (schedule table).
