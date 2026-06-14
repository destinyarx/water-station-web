# PRD: Expenses Management

## Problem Statement

Registered station users need a reliable way to record operating expenses in one place so they can understand where money is going, review costs quickly, and keep day-to-day financial records organized without relying on spreadsheets or scattered notes.

## Solution

Add an Expenses module for the water refilling station dashboard that lets authenticated users create, edit, view, filter, search, and soft-delete expense records for their own station. The module should be clean, business-focused, and easy to scan, while keeping the data scoped to the current station through existing Supabase authorization rules.

## User Stories

1. As a registered station user, I want to view my active expenses in one place, so that I can understand current operating costs.
2. As a registered station user, I want to add a new expense record, so that I can track business spending as it happens.
3. As a registered station user, I want to edit an existing expense, so that I can correct details when I notice a mistake.
4. As a registered station user, I want to soft-delete an expense, so that I can remove it from the active view without losing the record.
5. As a registered station user, I want deleted expenses to stay hidden by default, so that the main list only shows active records.
6. As a registered station user, I want to search expenses by name, description, or reference number, so that I can find a record quickly.
7. As a registered station user, I want to filter expenses by category, so that I can review a specific cost type.
8. As a registered station user, I want to filter expenses by payment method, so that I can review payments made through a specific channel.
9. As a registered station user, I want an optional date filter, so that I can narrow the list when needed without forcing extra controls into the workflow.
10. As a registered station user, I want the expenses list to default to the most recent expense first, so that new records are easy to see.
11. As a registered station user, I want summary cards for total expenses, this month, largest category, and recent expense count, so that I can get a quick financial overview.
12. As a registered station user, I want summary numbers to reflect only active expenses, so that deleted rows do not distort the dashboard.
13. As a registered station user, I want the current month card to mean the current calendar month, so that the label matches the calculation.
14. As a registered station user, I want the recent expense count to mean the last 7 days, so that the metric has a clear and predictable window.
15. As a registered station user, I want the largest category card to mean the category with the highest total spend, so that I can identify the biggest cost driver.
16. As a registered station user, I want a clear empty state when there are no active expenses, so that the page does not look broken.
17. As a registered station user, I want a separate no-results state when filters or search return nothing, so that I know the data exists but does not match my current view.
18. As a registered station user, I want category and payment method labels to be human-readable, so that I do not have to decode raw enum values.
19. As a registered station user, I want to use the `other` option when a category or payment method does not fit the presets, so that the system still captures the correct business context.
20. As a registered station user, I want the matching free-text field to be required when I choose `other`, so that the record is still specific and useful.
21. As a registered station user, I want the reference number field to stay optional, so that I do not have to invent a value when one is not available.
22. As a registered station user, I want the form to validate required fields before saving, so that bad data is blocked early.
23. As a registered station user, I want loading and pending states during save and delete actions, so that I do not submit duplicates.
24. As a registered station user, I want confirmation before deleting, so that I can avoid accidental soft deletes.
25. As a registered station user, I want the UI to stay consistent with the rest of the dashboard, so that the expenses module feels like part of the same system.

## Implementation Decisions

- The Expenses module uses `org_id` as the ownership boundary and scopes all reads and mutations to the current station.
- Created records store `created_by` from the authenticated user's Clerk-backed identity, matching the existing schema.
- The module uses `deleted_at` for soft delete, and the default list shows only active rows where `deleted_at` is null.
- There is no restore flow in this version.
- The expenses list defaults to sorting by `date_incurred` descending.
- Summary cards are calculated from active expenses only.
- `This Month` means the current calendar month.
- `Recent Expense Count` means active expenses from the last 7 days.
- `Largest Category` means the category with the highest total amount spent across active expenses.
- Search is limited to the default text fields: expense name, description, and reference number.
- The create and edit forms include conditional `other` text inputs for category and payment method, and those fields are required only when `other` is selected.
- `references_number` remains optional for every expense.
- Vendor name and receipt URL are out of scope because they are not part of the current schema.
- The module uses the existing Supabase SDK and follows the established feature-module pattern instead of adding new backend routes or schema changes.
- Form validation uses Zod and the UI should keep pending, loading, empty, and no-results states explicit.
- The UI should keep the water-station look restrained: clean surfaces, soft blue accents, readable amounts, and clear badges for category and payment method.

## Testing Decisions

- Validate the Zod schema directly for required fields, positive amount checks, and conditional `other` field requirements.
- Test the service layer through its observable behavior: create, update, soft delete, search, filter, default sorting, and active-only reads.
- Test that soft-deleted rows stay out of the default list and that list metrics ignore them.
- Test the list UI for empty state, no-results state, loading state, and row actions.
- Test the form UI for validation feedback, pending submit states, and conditional rendering of the `other` inputs.
- Prior art should follow the existing customer-management coverage style: schema tests, service tests, hook tests, and feature-level UI tests focused on external behavior rather than implementation details.

## Out of Scope

- Vendor name and receipt URL fields.
- Restore UI for soft-deleted expenses.
- Backend routes, server actions, or database migrations beyond the already-described schema.
- Recurring expenses, approvals, and expense categories beyond the documented enum values.
- Import/export, attachments, and analytics beyond the summary cards already specified.

## Further Notes

The module should feel like part of a serious water refilling station operations dashboard, not a separate finance product. The default experience should stay focused on active expenses, with soft-deleted rows hidden unless future reporting features need them.

The implementation seams should stay high-level: validation/schema, service/query behavior, and page-level list/form composition. Those seams are the right places to test the feature without locking tests to fragile internal details.
