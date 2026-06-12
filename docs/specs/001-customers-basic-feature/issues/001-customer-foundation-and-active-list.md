# Issue 001: Customer foundation and active list

## Type

AFK

## Blocked by

None - can start immediately

## User stories covered

1, 6, 7, 8, 9, 10, 12

## What to build

Build the end-to-end read path for customers. A registered user should be able to open the customers area, load the active customer list scoped to their own tenant, and see clear loading, empty, and error states. This slice also establishes the customer schema, validation, query keys, route protection, and RLS read policies needed to keep signed-out users, unregistered users, and other tenants out of customer data.

## Acceptance criteria

- [ ] Signed-out users are redirected to sign in before the customers area renders protected data.
- [ ] Signed-in but unregistered users are redirected to the complete registration flow.
- [ ] The active customer list shows only customers that belong to the current tenant.
- [ ] Archived customers are excluded from the default active list.
- [ ] An empty list renders an explicit empty state instead of a blank table.
- [ ] Client-side validation and shared types exist for customer read and display shapes.
- [ ] RLS blocks reads across tenants even if the UI is bypassed.
- [ ] The feature surfaces user-friendly loading and error states.

## Notes

- This slice should assume `created_by` maps to the local app user record associated with the Clerk identity, not a raw Clerk ID string.
- `deleted_at` is the archive marker and should be treated as hidden by default in the active list.

