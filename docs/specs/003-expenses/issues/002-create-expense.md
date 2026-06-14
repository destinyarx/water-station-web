# Issue 002: Create expense

## Type

AFK

## Blocked by

- [Expense foundation and active list](./001-expense-foundation-and-active-list.md)

## User stories covered

2, 19, 20, 21, 22, 23

## What to build

Build the end-to-end create expense flow. A registered station user should be able to open an expense form, enter valid expense details, submit the form, and have a new active expense record saved for the current station. The create path must validate input before submission, show pending and error states, support conditional `other` inputs, keep the reference number optional, and persist ownership fields correctly.

## Acceptance criteria

- [ ] The create form validates required fields before submission.
- [ ] Amount is required and must be greater than 0.
- [ ] `category_other` is required only when category is `other`.
- [ ] `payment_method_other` is required only when payment method is `other`.
- [ ] Reference number remains optional for every payment method.
- [ ] The form blocks duplicate submission while the create request is pending.
- [ ] A valid expense is inserted successfully for the current station.
- [ ] The saved record is linked to the current `org_id` and authenticated `created_by` identity.
- [ ] Invalid input is rejected with visible validation feedback.
- [ ] On success, the active expenses list can reflect the new record without a full page reload.

## Notes

- Keep Supabase calls inside the feature service layer.
- The create flow should use the same validation schema as the UI form.
- Do not expose vendor name or receipt URL fields because they are out of scope for the current schema.
