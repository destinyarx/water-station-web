# Issue 003: Edit customer

## Type

AFK

## Blocked by

- [Customer foundation and active list](./001-customer-foundation-and-active-list.md)

## User stories covered

4, 9, 10, 12

## What to build

Build the end-to-end edit customer flow. A registered user should be able to open an existing customer they own, change its details, and save the update back to Supabase. The edit path must reuse the same validation model as create, preserve pending and error states, and reject edits for customers outside the current tenant.

## Acceptance criteria

- [ ] The edit form loads an existing customer for the current tenant.
- [ ] The edit form validates user input before submission.
- [ ] A valid update persists to the customer record.
- [ ] The update is limited to customers in the current tenant.
- [ ] Validation errors are shown inline and prevent submission.
- [ ] On success, the updated data is reflected in the customer list or detail view.
- [ ] Attempting to edit a customer from another tenant fails safely.
- [ ] Archived customers cannot be edited unless a later restore flow is introduced.

## Notes

- This slice should reuse the same customer schema and service boundaries as the create flow.
- Edit should not introduce a new permission model; it should rely on the same tenant-scoped access rules.

