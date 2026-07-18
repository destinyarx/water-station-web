# Requirements

## Schedule lifecycle and security

- **R-01** When any organization member stops or resumes an organization-owned
  delivery schedule, the system shall complete the operation without an RLS
  error.
- **R-02** When a member stops a schedule, the system shall permit the
  schedule-driven soft-delete of its future pending occurrences while retaining
  organization isolation.
- **R-03** If UI controls are bypassed, RLS shall reject schedule or occurrence
  writes outside the caller's organization.
- **R-04** Where an organization member operates an occurrence, the existing
  shared delivery status and item permissions shall remain unchanged.

## Recurring schedules

- **R-05** When a user searches by customer name, the system shall filter
  schedules at the database boundary.
- **R-06** When a user selects Active or Inactive, the system shall filter
  schedule status at the database boundary, mapping paused/ended schedules to
  the Inactive presentation.
- **R-07** When a user selects Business or Household, the system shall filter
  linked customer type at the database boundary.
- **R-08** The schedule list shall use offset plus `pageSize + 1` probing to
  determine whether a next page exists without a total-count query.
- **R-09** Each schedule result shall display its customer or guest name,
  customer type where available, recurrence, status, product names,
  quantities, and unit labels.
- **R-10** If a schedule has a pending occurrence due today or earlier, the
  system shall display the most recent such occurrence as Current; otherwise it
  shall display the nearest future pending occurrence as Next.
- **R-11** If neither Current nor Next exists, the system shall display an
  appropriate no-pending-delivery label.

## Delivery history

- **R-12** The system shall order completed, failed, and cancelled deliveries
  server-side by their latest terminal update timestamp, newest first.
- **R-13** When a history status filter is selected, the system shall query only
  that terminal status.
- **R-14** The history list shall use offset plus `pageSize + 1` probing and
  shall not fetch all terminal deliveries.
- **R-15** Each history row shall display its terminal date/time, recipient,
  status, total, and applicable failure/cancellation reason.
- **R-16** Delivery item details shall be collapsed by default and shall expose
  product name, quantity, unit label, and line total when opened.

## Quality

- **R-17** Edited dialog components shall use Tailwind utilities and current
  `--app-*` tokens without changing unrelated surfaces.
- **R-18** Both dialogs shall handle loading, error, empty, no-result, updating,
  and paginated states.
- **R-19** Focused tests shall cover pagination/filter query behavior,
  chronological ordering, current/next mapping, and the shared-member policy.
- **R-20** While a recurring delivery schedule is paused, the main delivery
  queue shall exclude every occurrence belonging to that schedule.
- **R-21** When a paused recurring delivery schedule is resumed, the main
  delivery queue shall again include its eligible pending or in-progress
  occurrences according to the current-queue date rules.
- **R-22** When a schedule is stopped or resumed, the system shall not update,
  archive, restore, or otherwise mutate occurrences whose status is
  `completed`, `cancelled`, or `failed`.
