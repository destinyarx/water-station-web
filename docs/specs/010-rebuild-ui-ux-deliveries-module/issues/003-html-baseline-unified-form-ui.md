## What to build

Replace the separate `New Schedule` and `New Delivery` creation entry points with a unified `Schedule delivery` form modeled after `Deliveries.dc.html`. The form supports From records/Guest customer targeting, Recurring Route/Custom Dates modes, 1-week and 2-week recurrence buttons, weekday ticks, multi-date selection, staff assignment, searchable product selection, item quantity controls, and notes.

## Acceptance criteria

- [ ] When the delivery page renders, the system shall show one primary creation action for scheduling a delivery rather than separate New Schedule and New Delivery actions.
- [ ] When the form opens, the system shall show the same core layout hierarchy as the HTML baseline: target, schedule mode, assignee, products, and notes.
- [ ] When Recurring Route is selected, the system shall show weekday ticks, 1-week and 2-week interval buttons, start date, and optional end date.
- [ ] When Custom Dates is selected, the system shall allow one or more selected planned dates and display the selected dates before submit.
- [ ] When choosing products, the system shall provide a searchable product selector.
- [ ] When an organization member is selected as assignee, the submit payload shall include that member's Clerk user id.
- [ ] While creation is pending, the system shall disable submit and prevent duplicate submissions.
- [ ] If validation fails, the system shall show field-level errors without submitting.

## Blocked by

- 002-unified-delivery-creation-service.md
