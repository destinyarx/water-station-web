# Requirements — Deliveries Module (004)

EARS-style, testable requirements. IDs are stable references for acceptance and
issues.

## Schedules — creation & customer/guest

- **R-01** When a user submits a valid new delivery, the system shall create a
  Delivery Schedule scoped to the current organization, writing `org_id` and
  `created_by` from the Clerk session and never from form input.
- **R-02** Where a user selects an existing customer, the system shall store
  `customer_id` and leave guest fields empty.
- **R-03** Where a user creates a guest delivery, the system shall require a
  `guest_name` and store optional `guest_contact` and `guest_address`, with no
  `customer_id`.
- **R-04** If neither a customer nor a guest name is provided, then the system
  shall reject the submission (DB CHECK + form validation).
- **R-05** While a customer is linked, the system shall display the customer's
  current name and address from the `customers` record rather than a stored copy.

## Recurrence

- **R-06** When the user chooses one-time scheduling, the system shall require a
  single `delivery_date` on or after today and shall not collect recurrence
  fields.
- **R-07** When the user chooses weekly scheduling, the system shall require at
  least one weekday and an `interval_weeks ≥ 1`, and shall derive the displayed
  frequency from the number of selected weekdays.
- **R-08** When the user chooses monthly scheduling, the system shall require a
  `day_of_month` (1–31) and an `interval_months ≥ 1`.
- **R-09** Where a recurring schedule is created, the system shall use
  `start_date` (default today, user-editable) as the interval anchor.
- **R-10** Where an `end_date` is provided on a recurring schedule, the system
  shall not materialize occurrences after `end_date`.
- **R-11** If a monthly `day_of_month` exceeds the days in a target month, then
  the system shall clamp the occurrence to that month's last day.

## Materialization

- **R-12** When the deliveries view loads, the system shall ensure all `active`
  schedules have occurrences materialized for every due date within the next 14
  days (inclusive of today).
- **R-13** While topping up occurrences, the system shall not create a duplicate
  occurrence for an existing `(schedule_id, delivery_date)` (idempotent;
  enforced by a unique index).
- **R-14** When an occurrence is materialized, the system shall copy the
  schedule's template items into `delivery_items`, snapshotting `product_name`
  and the `unit_price` (template override if present, otherwise the product's
  current price) and `quantity`.
- **R-15** While a schedule's `status` is `paused` or `ended`, the system shall
  not materialize new occurrences for it.
- **R-16** When a schedule's recurrence or template is edited, the system shall
  apply the change to future materialization only and shall leave existing
  occurrences unchanged.

## Delivery (occurrence) lifecycle

- **R-17** When a delivery is created/materialized, the system shall set its
  status to `pending`.
- **R-18** When a user advances a `pending` delivery, the system shall set status
  to `for_delivery` and stamp `delivered_by` with the acting Clerk user id.
- **R-19** When a user completes a `for_delivery` delivery, the system shall set
  status to `completed`.
- **R-20** When a user marks a delivery `failed`, the system shall require
  non-empty `failure_remarks` before saving (form validation + DB CHECK).
- **R-21** Where a delivery is `completed` or `failed`, the system shall treat
  that status as terminal and shall not offer a transition back to an earlier
  status.
- **R-22** If a delivery is `failed`, then the system shall not alter its parent
  schedule's `status` or future materialization.
- **R-23** While editing a single occurrence, the system shall allow changing its
  line items, notes, and date without affecting the schedule template or other
  occurrences.

## Status interaction (UI)

- **R-24** Where a delivery row action menu is shown, the system shall offer only
  status transitions legal from the row's current status.
- **R-25** When a user selects "Mark as failed", the system shall open a dialog
  with a required failure-remarks field and keep submit disabled until it is
  filled.

## Products & totals

- **R-26** When a line item is added, the system shall default `unit_price` to the
  product's current price and allow the user to override it.
- **R-27** While displaying a delivery or schedule, the system shall compute line
  totals (`quantity × unit_price`) and the delivery total in the app, without
  persisting derived totals.
- **R-28** Where a product is later renamed, repriced, or soft-deleted, the system
  shall still display past `delivery_items` using their snapshot
  `product_name` and `unit_price`.

## Security & multi-tenancy

- **R-29** Where any delivery data is queried, the system shall return only rows
  matching the caller's organization (RLS), and shall never expose another
  organization's rows.
- **R-30** Where a user reads active lists, the system shall exclude
  soft-deleted (`deleted_at` not null) rows.
- **R-31** When a user archives (soft-deletes) a Delivery Schedule, the system
  shall permit it only for owners (`is_owner` claim true) and shall set
  `deleted_at = now()`.
- **R-32** When a schedule is archived, the system shall stop future occurrence
  generation and exclude its future `pending` occurrences from active lists while
  retaining completed/failed history.
- **R-33** Where any org member operates the delivery queue, the system shall
  allow them to create occurrences and update occurrence status/remarks/items
  regardless of who created the record.

## States & quality

- **R-34** Where any data view is shown, the system shall handle loading, error,
  empty, and populated states.
- **R-35** If a Supabase request fails, then the system shall surface a
  user-friendly error and shall handle the returned error object (no silent
  failures).
- **R-36** While a create/update mutation is pending, the system shall disable the
  submit action.
- **R-37** When a mutation succeeds, the system shall invalidate or update the
  affected TanStack Query caches so lists refresh without a full reload.
