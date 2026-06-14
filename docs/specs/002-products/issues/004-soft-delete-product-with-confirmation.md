# Issue 004: Soft-delete product with confirmation

## Type

AFK

## Blocked by

- Issue 001: Products foundation and active list
- Issue 002: Create product

## User stories covered

28, 30, 36-41

## What to build

Build the end-to-end soft-delete product flow. A registered user should be able to choose delete from an active product row, confirm the destructive action, and have the product removed from the active products list by setting `deleted_at`. Staff users can soft-delete products they created, while owners can soft-delete any product in their organization through the existing owner override RLS behavior.

## Acceptance criteria

- [ ] Each active product row exposes a delete action.
- [ ] Delete uses a confirmation dialog before any mutation runs.
- [ ] The confirmation copy explains that the product will be removed from the active products list.
- [ ] Canceling the confirmation leaves the product active.
- [ ] Confirming delete soft-deletes the product by setting `deleted_at`.
- [ ] The implementation does not hard-delete product rows.
- [ ] Soft-deleted products disappear from the active products list after success.
- [ ] Staff users can soft-delete products they created, subject to existing RLS.
- [ ] Owner users can soft-delete organization-owned products created by another user, subject to existing RLS.
- [ ] Cross-organization soft deletes fail safely through existing RLS.
- [ ] While the delete mutation is pending, duplicate delete submissions are blocked.
- [ ] Successful delete invalidates or refreshes the products query.
- [ ] Successful delete shows user-facing success feedback.
- [ ] Failed delete shows safe user-facing error feedback and does not expose raw database details.
- [ ] Service and mutation invalidation behavior are covered by focused tests.

## Notes

- Product deletion means soft delete only.
- There is no restore flow in this Products feature set.
- UI checks may improve experience, but RLS remains the authoritative authorization boundary.
