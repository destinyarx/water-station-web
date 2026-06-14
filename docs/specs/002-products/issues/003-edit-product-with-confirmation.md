# Issue 003: Edit product with confirmation

## Type

AFK

## Blocked by

- Issue 001: Products foundation and active list
- Issue 002: Create product

## User stories covered

27, 29, 32-35, 38-41

## What to build

Build the end-to-end edit product flow. A registered user should be able to open an existing product they are allowed to modify, edit the same product fields used by create, confirm the save action, and see the updated product reflected in the active products table. Staff users can update products they created, while owners can update any product in their organization through the existing owner override RLS behavior.

## Acceptance criteria

- [ ] Each active product row exposes an edit action.
- [ ] The edit form is pre-filled from the selected product.
- [ ] The edit flow reuses the same product validation rules as create.
- [ ] Editable fields are product name, price, stock tracking, stock, and description.
- [ ] The user sees a confirmation dialog before the update mutation runs.
- [ ] Canceling the confirmation leaves the product unchanged.
- [ ] Confirming the update saves the edited product and closes the edit flow on success.
- [ ] Updates set `updated_at`.
- [ ] Updates do not change `created_at`, `created_by`, or `org_id`.
- [ ] Staff users can update products they created, subject to existing RLS.
- [ ] Owner users can update organization-owned products created by another user, subject to existing RLS.
- [ ] Cross-organization updates fail safely through existing RLS.
- [ ] Successful update invalidates or refreshes the products query.
- [ ] Successful update shows user-facing success feedback.
- [ ] Failed update shows safe user-facing error feedback and does not expose raw database details.
- [ ] Validation, mapper, service, and mutation invalidation behavior are covered by focused tests.

## Notes

- Product feature code should read owner status from `sessionClaims.is_owner` if UI gating is needed.
- UI checks may improve experience, but they must not replace Supabase RLS enforcement.
- Do not add a product restore flow in this slice.
