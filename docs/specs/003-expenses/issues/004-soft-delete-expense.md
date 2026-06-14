# Issue 004: Soft-delete expense

## Type

AFK

## Blocked by

- [Expense foundation and active list](./001-expense-foundation-and-active-list.md)

## User stories covered

4, 5, 23, 24

## What to build

Build the end-to-end soft-delete expense flow. A registered station user should be able to choose an active expense, confirm the action in a professional dialog, and remove the record from the default active list by setting `deleted_at`. The flow must show pending and error states and must not add a restore workflow.

## Acceptance criteria

- [ ] Delete action opens a confirmation dialog instead of using a browser confirm.
- [ ] The confirmation dialog clearly identifies which expense will be deleted.
- [ ] Confirming delete sets `deleted_at` through Supabase.
- [ ] The delete action blocks duplicate submission while pending.
- [ ] A successfully soft-deleted expense disappears from the default active list.
- [ ] Soft-deleted expenses are not included in active-list reads.
- [ ] Errors are surfaced as user-friendly messages.
- [ ] No restore UI is introduced in this slice.

## Notes

- This is a soft delete, not a hard delete.
- The feature should continue treating rows with non-null `deleted_at` as hidden from the default UI.
