## What to build

Integrate the new delivery status and assignment fields into the queue, history, and schedule surfaces. The active queue remains focused on pending and for-delivery work, cancelled deliveries become terminal history records, and schedule lists remain compatible with weekly, custom-date, and historical one-time schedules.

## Acceptance criteria

- [ ] When the queue is filtered by status, the system shall include `cancelled` as an available filter where terminal deliveries are visible.
- [ ] When a pending or for-delivery occurrence is opened from the status menu, the system shall offer cancellation and require cancellation remarks before updating.
- [ ] When a completed, failed, or cancelled occurrence is shown, the system shall not offer further status changes.
- [ ] When a delivery has an assignee, queue and detail surfaces shall display the assignee without confusing it with `delivered_by`.
- [ ] When viewing history, the system shall include completed, failed, and cancelled terminal occurrences.
- [ ] When viewing schedules, the system shall display custom-date schedules without breaking existing weekly or one-time schedule rows.
- [ ] Delivery status, history, schedule-list, and transition tests shall cover cancellation and terminal-status behavior.

## Blocked by

- 003-html-baseline-unified-form-ui.md
