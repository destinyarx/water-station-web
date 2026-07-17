# Requirements

## Dashboard

- **R-01** Where the Dashboard renders KPI cards, the system shall preserve the
  featured Delivery Sales treatment and render Pending Deliveries, Completed
  Deliveries, and Refill Units with a subtle Customers-style glow and wave.
- **R-02** When Today is selected, the system shall show Delivery Sales,
  Completed Deliveries, and Refill Units as a percentage versus Yesterday when
  a percentage can be calculated.
- **R-03** When Yesterday is selected, the system shall show those same metrics
  as a percentage versus Today when a percentage can be calculated.
- **R-04** While This Week or This Month is selected, the system shall not show
  KPI percentage comparisons.
- **R-05** The system shall never show a percentage comparison on Pending
  Deliveries and shall not show invalid or infinite percentages for zero
  baselines.
- **R-06** The Sales versus Expenses panel shall have an independent Weekly or
  Monthly coverage control that defaults to Weekly and does not change the
  page-wide KPI, sales-mix, top-product, or operations coverage.
- **R-07** When Monthly chart coverage is selected, the system shall render one
  aggregated sales/expense bucket for the selected month-to-date.
- **R-08** Where the Low Stock and Maintenance Due cards render, their titles
  shall use title case and their destination actions shall be clear buttons in
  the top-right header area.

## Deliveries

- **R-09** While a delivery occurrence is Pending or For Delivery, the system
  shall allow cancellation of only that occurrence.
- **R-10** When cancellation is chosen, the system shall show a required reason
  field and Keep Delivery / Cancel Delivery actions.
- **R-11** When cancellation is confirmed, the system shall save the trimmed
  reason as `cancellation_remarks` through the existing atomic RPC and shall not
  alter the parent schedule or future occurrences.
- **R-12** When a user selects an ordinary delivery status transition, the
  system shall require confirmation with status-specific copy and concise
  recipient, source, date, and item details before mutating.
- **R-13** When Custom Dates is selected in the delivery form, the system shall
  show the multi-date calendar in an accessible popover and shall keep the
  selected-date count visible on the closed trigger.

## Quality and security

- **R-14** The system shall preserve owner/staff dashboard payload separation,
  organization scoping, delivery RLS, and the existing atomic transition
  boundary.
- **R-15** New or edited UI shall use the existing app tokens, Tailwind where
  practical, responsive layouts, dark mode, and keyboard-accessible controls.
- **R-16** Focused tests shall cover the fixed cancellation form body,
  comparison copy, independent chart aggregation, and confirmation content.

