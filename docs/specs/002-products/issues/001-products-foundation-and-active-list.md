# Issue 001: Products foundation and active list

## Type

AFK

## Blocked by

None - can start immediately

## User stories covered

1-12, 24-25, 31, 38, 40, 43-44

## What to build

Build the end-to-end read path for products. A registered station user should be able to open the Products area, load the active product list scoped to their own organization, and see clear loading, error, empty, and no-results states. This slice also establishes the products feature structure, TypeScript types, validation schema, mappers, query keys, Supabase service read path, protected route composition, active-only list behavior, stock-tracked versus non-stock-tracked display, formatted prices, and Products navigation if needed.

## Acceptance criteria

- [ ] Signed-out users are redirected to sign in before the Products area renders protected data.
- [ ] Signed-in but unregistered users are redirected to the complete registration flow.
- [ ] The active products list shows only products visible to the current organization scope.
- [ ] Soft-deleted products are excluded from the default list.
- [ ] Product rows show product name, optional description, formatted price, stock tracking, stock display, created date, updated date, and row actions.
- [ ] Stock-tracked products show a numeric stock quantity.
- [ ] Non-stock-tracked products show stock as `Not tracked`.
- [ ] The list renders an explicit empty state when there are no active products.
- [ ] The list can render a no-results state when the current client-side search produces no matches.
- [ ] Product row validation, display types, mappers, query keys, and service read behavior are covered by focused tests.
- [ ] Supabase errors are converted into user-friendly errors before they reach the UI.
- [ ] Query keys are arrays and use a products feature key factory.
- [ ] The Products page follows the existing protected route and feature-module composition patterns.

## Notes

- Use `org_id` as the station ownership boundary.
- Created rows use `created_by` from the authenticated Clerk user ID.
- `deleted_at` is the soft-delete marker and should be treated as hidden by default.
- Use the existing Supabase `products` table and existing RLS policies.
- Do not add backend routes, server actions, database migrations, or schema changes in this slice.
