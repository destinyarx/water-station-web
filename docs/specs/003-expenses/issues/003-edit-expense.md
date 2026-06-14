# Issue 003: Edit expense

## Type

AFK

## Blocked by

- [Expense foundation and active list](./001-expense-foundation-and-active-list.md)
- [Create expense](./002-create-expense.md)

## User stories covered

3, 19, 20, 21, 22, 23

## What to build

Build the end-to-end edit expense flow. A registered station user should be able to open an existing active expense, see the form pre-filled with current values, update valid fields, and save the changes through Supabase. The edit path must reuse the create validation rules, preserve pending and error states, and update the active list after a successful save.

## Acceptance criteria

- [ ] The edit form opens with the selected active expense values pre-filled.
- [ ] The edit form uses the same required-field and conditional `other` validation as create.
- [ ] Reference number remains optional when editing.
- [ ] The form blocks duplicate submission while the update request is pending.
- [ ] A valid edit persists through Supabase for the current station scope.
- [ ] Invalid input is rejected with visible validation feedback.
- [ ] On success, the active expenses list reflects the updated record without a full page reload.
- [ ] Editing a soft-deleted expense is not exposed in the default UI.

## Notes

- Do not introduce a separate edit validation model unless the shared create/update schema cannot represent the behavior safely.
- Ownership fields such as `org_id` and `created_by` should not be editable from the form.
