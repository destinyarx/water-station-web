# Issue 001: Expense foundation and active list

## Type

AFK

## Blocked by

None - can start immediately

## User stories covered

1, 5, 10, 16, 18, 22, 25

## What to build

Build the end-to-end read path for expenses. A registered station user should be able to open the expenses area, load the active expense list scoped to their own station, and see clear loading, empty, and error states. This slice also establishes the expenses feature structure, enum constants, TypeScript types, validation schema, query keys, protected route composition, active-only list behavior, readable category/payment labels, and default most-recent sorting.

## Acceptance criteria

- [ ] Signed-out users are redirected to sign in before the expenses area renders protected data.
- [ ] Signed-in but unregistered users are redirected to the complete registration flow.
- [ ] The active expenses list shows only expenses visible to the current station scope.
- [ ] Soft-deleted expenses are excluded from the default list.
- [ ] The list defaults to most recent expense date first.
- [ ] Category and payment method values display readable labels instead of raw enum values.
- [ ] An empty active list renders an explicit empty state instead of a blank table.
- [ ] Client-side validation and shared types exist for expense read and display shapes.
- [ ] The feature surfaces user-friendly loading and error states.

## Notes

- Use `org_id` as the station ownership boundary.
- Created rows use `created_by` from the authenticated user's Clerk-backed identity.
- `deleted_at` is the soft-delete marker and should be treated as hidden by default.
- Do not add backend routes, server actions, database migrations, or schema changes in this slice.
