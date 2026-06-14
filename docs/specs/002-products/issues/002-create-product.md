# Issue 002: Create product

## Type

AFK

## Blocked by

- Issue 001: Products foundation and active list

## User stories covered

13-26, 38-41

## What to build

Build the end-to-end create product flow. A registered Owner or Staff user should be able to open a create product form from the Products page, enter product details, validate stock-tracking behavior, save the product under their current organization, and see the active products table refresh with success or safe error feedback.

## Acceptance criteria

- [ ] The Products page exposes an `Add Product` action.
- [ ] The create form collects product name, price, stock tracking, stock when applicable, and optional description.
- [ ] Product name is required, trimmed before saving, and limited to 255 characters.
- [ ] Price is required and must be greater than or equal to zero.
- [ ] Stock tracking defaults to enabled.
- [ ] Stock is required, an integer, and greater than or equal to zero when stock tracking is enabled.
- [ ] Stock is saved as zero when stock tracking is disabled.
- [ ] Description is optional, trimmed before saving, and limited to 255 characters.
- [ ] The form does not expose `org_id`, `created_by`, `created_at`, `updated_at`, or `deleted_at`.
- [ ] The create service writes `org_id` from the current Clerk session organization and `created_by` from the current Clerk user ID.
- [ ] While the create mutation is pending, duplicate submissions are blocked.
- [ ] Successful create invalidates or refreshes the products query.
- [ ] Successful create shows user-facing success feedback.
- [ ] Failed create shows safe user-facing error feedback and does not expose raw database details.
- [ ] Validation, mapper, service, and mutation invalidation behavior are covered by focused tests.

## Notes

- Staff and Owner users can create products for their own organization.
- RLS remains the authoritative authorization boundary.
- Follow the existing create dialog/form pattern from nearby feature modules.
