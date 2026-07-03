## What to build

Add the delivery data-model foundation needed by the rebuilt delivery form and status behavior. Delivery occurrences support the `cancelled` terminal status with required cancellation remarks, delivery schedules and delivery occurrences support nullable staff assignment, and custom-date schedules are represented as Delivery Schedules with explicit selected dates.

## Acceptance criteria

- [ ] When a delivery status is parsed, the system shall accept `pending`, `for_delivery`, `completed`, `failed`, and `cancelled`.
- [ ] When a custom-date schedule is parsed, the system shall accept `custom_dates` as a delivery recurrence type while retaining existing `one_time`, `weekly`, and `monthly` values.
- [ ] Where a delivery or delivery schedule has an assignee, the system shall expose `assigned_to` as nullable Clerk user id data distinct from `delivered_by`.
- [ ] When a delivery is cancelled, the system shall require non-empty `cancellation_remarks`.
- [ ] When a delivery transitions status, the system shall allow only `pending -> for_delivery`, `pending -> cancelled`, `for_delivery -> completed`, `for_delivery -> failed`, and `for_delivery -> cancelled`.
- [ ] If a delivery is cancelled from `for_delivery`, the system shall restore stock for stock-tracked items.
- [ ] If a delivery is cancelled from `pending`, the system shall not move stock.
- [ ] The database migration notes shall describe `custom_dates`, `delivery_schedule_dates`, `assigned_to`, `cancelled`, and `cancellation_remarks` changes.

## Blocked by

None - can start immediately
