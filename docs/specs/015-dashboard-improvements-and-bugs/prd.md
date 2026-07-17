# Dashboard Improvements and Delivery Workflow Fixes

## Problem

Dashboard V1 is functional, but its KPI comparison language and card treatment
do not match the requested operational hierarchy. The sales-versus-expenses
chart is also coupled to the page-wide coverage selector. In Deliveries, the
cancellation reason form is hidden by the shared confirmation shell, ordinary
status changes occur without confirmation, and the custom-date calendar takes
too much vertical space inside the scheduling form.

## Goal

Refine the existing Dashboard V1 experience without changing its financial or
tenant-security boundaries, and make delivery occurrence status changes safer
and more usable.

## Scope

- Preserve the featured Delivery Sales KPI.
- Give the remaining KPI cards the Customers-style glow and water-wave detail.
- Show a single percentage comparison only for Today and Yesterday, excluding
  Pending Deliveries.
- Give Sales versus Expenses an independent Weekly/Monthly selector.
- Show Monthly sales and expenses as one whole-period comparison rather than
  one bar pair per date.
- Improve the Low Stock and Maintenance Due card headers and actions.
- Repair per-occurrence delivery cancellation with a required saved reason.
- Confirm ordinary delivery status transitions with concise recipient details.
- Present the custom-date calendar in a popover while retaining the selected
  date count in the form.

## Out of scope

- New financial definitions, POS/walk-in revenue, or a new chart dependency.
- Cancelling, pausing, or editing a parent delivery schedule.
- Changing delivery RLS or the existing atomic status RPC.
- Redesigning unrelated modules.

