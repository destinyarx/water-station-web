## What to build

Create one delivery creation path that can submit either a recurring route or a custom-dates delivery schedule. Recurring routes create a weekly Delivery Schedule and materialize the rolling horizon. Custom dates create one `custom_dates` Delivery Schedule, save each explicit selected date, and immediately create one pending delivery occurrence per selected date.

## Acceptance criteria

- [ ] When a user submits recurring route values, the system shall create a weekly Delivery Schedule with schedule items and materialized pending occurrences.
- [ ] When a user submits custom dates, the system shall create one `custom_dates` Delivery Schedule, one date row per selected date, and one pending delivery occurrence per selected date.
- [ ] When custom-date values contain one date, the system shall still create a `custom_dates` schedule rather than a new `one_time` schedule.
- [ ] When an assignee is selected, the system shall store the assignee on both the schedule and created occurrences.
- [ ] When no assignee is selected, the system shall store the schedule and occurrences as unassigned.
- [ ] Existing one-time schedules shall remain readable for history and compatibility.
- [ ] Query invalidation shall refresh deliveries, schedules, and related counts after creation.

## Blocked by

- 001-schema-status-and-assignment-foundation.md
