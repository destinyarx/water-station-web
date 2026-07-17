# Dashboard V1 Product Requirements

## Status

Approved for implementation, subject to the database migration checkpoint in
`technical-plan.md`.

## Problem

AquaFlow's protected `/dashboard` route currently reuses a static marketing
preview. Owners cannot see a trustworthy summary of completed-delivery sales,
expenses, product performance, delivery activity, stock risk, or maintenance
work. Staff also lack a concise operational overview, while financial data must
remain owner-only.

## Product goal

Replace the preview with a role-aware, organization-scoped dashboard that helps
a water refilling station decide what needs attention today and lets its owner
review completed-delivery performance over a small set of calendar periods.

## Users

- **Owner:** needs financial and operational context for the whole station.
- **Staff:** needs delivery, refill, stock, and maintenance context without
  receiving owner financial summaries.

## V1 experience

The dashboard defaults to **Today** and also supports **Yesterday**, **This
week**, and **This month**. It presents:

- compact operational KPI cards for pending deliveries (Today only), completed
  deliveries, and refill units;
- owner-only Delivery sales, sales-versus-expenses, sales mix, and top-five
  products;
- today's delivery queue, low-stock products, and maintenance due soon;
- honest loading, refreshing, empty, partial-error, and unauthorized states.

Delivery sales means the recognized value of item snapshots on deliveries whose
current status is completed. It does not include walk-in or POS sales.

## Success criteria

- Owners can scan current financial and operational health without leaving the
  dashboard.
- Staff receive only operational data at both database and UI boundaries.
- Every result is tenant-isolated by the existing Clerk/Supabase identity and
  RLS contract.
- Period calculations are deterministic and match calendar boundaries.
- Historical refill and sales-mix classification is based on a delivery-time
  snapshot rather than a product's current classification.
- Dashboard queries return bounded aggregate payloads rather than raw source
  tables.
- The page remains usable across supported themes, roles, viewport sizes, and
  empty/error states.

## Product rules

- Revenue source: completed `delivery_items.quantity * unit_price`, bounded by
  the parent delivery's `completed_at`.
- Refill units: completed item quantity whose classification snapshot is
  `is_stock_tracked = false`.
- Low stock: active stock-tracked products with stock at or below 10.
- Maintenance attention: active pending work overdue or due within seven days.
- Top products: units descending, revenue descending, then product name
  ascending; at most five.
- This week starts Monday. This month is calendar month-to-date.
- No invalid or infinite percentage is shown for a zero baseline.

## Out of scope

- Walk-in/POS sales, orders, payments, invoices, receivables, and profit
  accounting.
- Forecasts, exports, custom ranges, configurable widgets, or background
  polling.
- A new chart, state, or date dependency.
- Redesigning the protected shell, sidebar, or header.
- Inferring refill status from product names.

## Known limitation

Non-stock-tracked products can represent refills, fees, or other services.
Dashboard V1 follows the approved definition and labels their quantity **Refill
units**, but a future product classification/unit model is needed for a more
precise physical-volume metric.

## Source documents

- `docs/specs/014-dashboard-v1/ai-agent-guide.md`
- `docs/specs/014-dashboard-v1/implementation-prompt.md`
- `docs/DESIGN.md`
- `docs/specs/014-dashboard-v1/AquaFlow Dashboard.html` (composition only)

