# Expenses Management Issues

This folder contains the tracer-bullet issue breakdown for the expenses management feature.

## Issue Order

1. [Expense foundation and active list](./001-expense-foundation-and-active-list.md)
2. [Create expense](./002-create-expense.md)
3. [Edit expense](./003-edit-expense.md)
4. [Soft-delete expense](./004-soft-delete-expense.md)
5. [Search, filters, and summary cards](./005-search-filters-and-summary-cards.md)

## Coverage Map

- Foundation and active list: route, feature structure, constants, types, validation, active-only read path, loading/error/empty states, readable labels, default sorting
- Create expense: create form, conditional `other` inputs, validation, insert mutation, `org_id` and `created_by` ownership, pending state
- Edit expense: pre-filled edit form, shared validation, update mutation, pending/error states, active list refresh
- Soft-delete expense: confirmation dialog, `deleted_at` mutation, active-list visibility rule, no restore flow
- Search, filters, and summary cards: default search fields, category/payment filters, optional date filter, no-results state, PHP formatting, active-only metrics
