# Acceptance — maintenance module (008)

## Create
- [ ] Creating a one-time task with 3 picked dates produces 1 schedule + 3
      occurrences; all 3 appear as cards.
- [ ] Creating a weekly "Twice" task requires exactly 2 weekdays; 1 or 3 is
      rejected with a field error.
- [ ] Creating an everyday task produces 1 pending occurrence at the start date.
- [ ] "Others" equipment requires the description field; blank is rejected.

## Complete / roll-forward
- [ ] Completing a one-time occurrence marks it Completed; when the last one is
      done, the schedule reads "completed".
- [ ] Completing an everyday occurrence creates the next pending occurrence at
      +1 day; the list still shows one open card for it.
- [ ] Completing a weekly (Mon/Thu) occurrence advances to the next of Mon/Thu.
- [ ] Completing the same occurrence twice does not create duplicate next-dates.

## Status & visibility
- [ ] Setting a schedule inactive hides its occurrences from the list.
- [ ] Enabling "Show inactive" reveals them, visually de-emphasised.
- [ ] Staff cannot archive a schedule (action hidden / RLS rejects); owner can.

## Assignee
- [ ] The assignee picker lists only org staff + "Unassigned".
- [ ] Changing a task's assignee persists on that occurrence only.

## Due labels
- [ ] Past = "Overdue Nd"; today = "Due today"; +1 = "Tomorrow";
      +2/+3 = "In N days"; +4 or more = formatted date only.

## Cross-cutting
- [ ] Loading, error, empty, and no-results states all render.
- [ ] Dark mode follows the `--app-*` tokens on every surface.
- [ ] `tsc`, `vitest`, `eslint`, and `next build` pass.
