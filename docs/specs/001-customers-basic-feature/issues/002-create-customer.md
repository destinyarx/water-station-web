# Issue 002: Create customer

## Type

AFK

## Blocked by

- [Customer foundation and active list](./001-customer-foundation-and-active-list.md)

## User stories covered

2, 3, 9, 10, 12

## What to build

Build the end-to-end create customer flow. A registered user should be able to open a customer form, enter valid customer details, submit the form, and have a new customer record saved only for their tenant. The create path must validate input before submission, show pending and error states, and persist the creator and tenant ownership fields correctly.

## Acceptance criteria

- [ ] The create form validates required and optional fields before submission.
- [ ] The form blocks submission while the create request is pending.
- [ ] A valid customer is inserted successfully for the current tenant.
- [ ] The saved record is linked to the current tenant and creator identity.
- [ ] Invalid input is rejected with visible validation feedback.
- [ ] RLS prevents a user from creating a customer outside their tenant context.
- [ ] On success, the active customer list can reflect the new record without a full page reload.

## Notes

- This slice should keep Supabase calls inside the service layer.
- The create flow should use the same validation schema as the UI form.

