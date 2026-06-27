# Requirements — maintenance module (008)

EARS-style, testable. "System" = the maintenance feature.

## Schedules & occurrences

- R1. When a user opens the maintenance page, the system shall list the active
  station's maintenance **occurrences** (one card per `maintenance_tasks` row of
  a non-archived schedule), scoped to the user's organization by RLS.
- R2. While a schedule is **inactive** (`is_active = false`), the system shall
  exclude its occurrences from the list, unless the user enables **Show
  inactive**.
- R3. When a user submits a valid create form, the system shall validate input
  with a Zod schema, insert a `maintenance_schedules` row, and insert its
  occurrence(s): one per chosen date for `one_time`; a single `pending`
  occurrence at the start date for `everyday`/`weekly`.
- R4. If the create/update request fails, the system shall show a user-friendly
  error and shall not surface the raw database error.
- R5. While a create/update mutation is pending, the system shall disable the
  submit button.

## Recurrence

- R6. The system shall offer exactly three recurrence types: `one_time`,
  `everyday`, `weekly`. It shall not offer biweekly, monthly, quarterly,
  six-month, or yearly.
- R7. Where recurrence is `weekly`, the system shall require a frequency of Once,
  Twice, or Thrice and exactly that many selected weekdays (ISO 1–7); it shall
  reject a mismatch.
- R8. Where recurrence is `one_time`, the system shall let the user pick one or
  more dates from a calendar pop-up and shall reject an empty selection.
- R9. When a user completes a recurring (`everyday`/`weekly`) occurrence, the
  system shall stamp `completed_at`/`completed_by` and create the next `pending`
  occurrence at the next due date, without duplicating `(schedule_id, due_date)`.

## Status

- R10. The system shall represent a schedule as **active**, **inactive**, or
  **completed**, where *completed* applies only to a `one_time` schedule whose
  occurrences are all done.
- R11. When a user sets a schedule active/inactive from the card menu, the system
  shall update `is_active` and refresh the list.
- R12. When an owner archives a schedule, the system shall soft-delete it
  (`deleted_at = now()`); staff shall not be able to archive (RLS-enforced).

## Assignee

- R13. The system shall populate the "Assigned to" picker only with users in the
  caller's organization, plus an "Unassigned" option.
- R14. The system shall store `assigned_to` on the occurrence so it can be
  changed per task.

## Due labels (overrides the design mockup)

- R15. For a pending occurrence the system shall label the due chip:
  "Overdue Nd" if past; "Due today" if today; "Tomorrow" if +1 day;
  "In N days" only when 2 ≤ N ≤ 3; otherwise the formatted date only.
- R16. For a completed occurrence the system shall label it "Completed".

## Stats

- R17. The system shall show counts for Due this week, Overdue, Done this month,
  and active Recurring schedules, derived from the loaded data.
