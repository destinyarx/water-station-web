# Products Management Issues

This folder contains the tracer-bullet issue breakdown for the products management feature.

## Issue Order

1. [Products foundation and active list](./001-products-foundation-and-active-list.md)
2. [Create product](./002-create-product.md)
3. [Edit product with confirmation](./003-edit-product-with-confirmation.md)
4. [Soft-delete product with confirmation](./004-soft-delete-product-with-confirmation.md)
5. [Search, sorting, and table polish](./005-search-sorting-and-table-polish.md)

## Coverage Map

- Products foundation and active list: route, feature structure, constants, types, validation, mappers, query keys, active-only read path, loading/error/empty/no-results states, product navigation if needed
- Create product: create form/dialog, stock-tracking validation, insert mutation, `org_id` and `created_by` ownership, pending state, success/error feedback
- Edit product with confirmation: pre-filled edit form, shared validation, confirmation before save, `updated_at`, active list refresh, owner override via existing RLS
- Soft-delete product with confirmation: row delete action, confirmation dialog, `deleted_at` mutation, active-list visibility rule, owner override via existing RLS, no restore flow
- Search, sorting, and table polish: product-name search, supported sortable columns, stock display polish, responsive table behavior, accessible row actions
