# 005 — Invalidation, verification, and handoff

## Goal

Keep the dashboard fresh after source mutations and provide evidence that the
feature is safe and usable.

## Deliverables

- Targeted dashboard invalidation in delivery, expense, product, and maintenance
  mutation hooks.
- Automated checks and the manual RLS/role/responsive/theme/accessibility matrix.
- Updated project docs and an AI handoff referencing the final artifacts.

## Dependency

Issues 002-004.

## Done when

- [x] Delivery mutations invalidate financial and operational families.
- [x] Expense mutations invalidate only financials.
- [x] Product and maintenance mutations invalidate only operations.
- [x] Typecheck, 278 tests, and production build pass; lint has no errors.
- [x] Project docs and the final feature handoff are updated.
- [ ] Authenticated RLS/tenant/query-plan evidence is captured.
- [ ] Signed-in responsive, dark-mode, keyboard, reduced-motion, and sidebar QA
  is captured.
