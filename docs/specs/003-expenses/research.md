# Expenses Research Notes

## Resolved Decisions

### Ownership field

Use `org_id` for the Expenses module ownership field to match the current `expenses` table schema.

The product language can still describe records as belonging to the current water station, but technical specs, data model notes, service payloads, and acceptance criteria should use `org_id` instead of `tenant_id`.

### Schema-backed fields only

The Expenses module should only expose fields present in the current `expenses` table schema.

Do not include vendor name or receipt URL in this version because the provided schema does not include columns for them. Search should cover `name`, `description`, and `references_number`.

## Resolved Clarifications

### Expense deletion semantics

Use soft delete by setting `deleted_at`.

The schema in `DESCRIPTION.md` now includes a `deleted_at` column, so the default expenses experience should hide deleted rows and treat them as inactive.

### Other-value validation

When `category` is `other`, require `category_other`.

When `payment_method` is `other`, require `payment_method_other`.

The create and edit forms should surface those companion inputs only when the matching select is set to `other`.

### Active metrics only

Summary cards and other aggregate counts should be calculated from active expenses only, excluding rows where `deleted_at` is not null.

### Reference number optional

`references_number` remains optional for all expense types.

The form should not force a reference number for any payment method in this version.

Search should not treat `category_other` or `payment_method_other` as primary search fields.

### Recent count window

`Recent Expense Count` covers the last 7 days of active expenses.

### Largest category meaning

`Largest Category` means the category with the highest total amount spent across active expenses.

### This Month window

`This Month` means the current calendar month and counts active expenses only.

### Date filter scope

The date filter is optional for the first version. If implemented, it should not block the rest of the module from shipping.

### Default sort order

The expenses list should default to most recent expense date first.

### Empty vs no-results states

Use a true empty state when there are no active expenses.

Use a separate no-results state when search or filters return no matching rows.

### Restore flow

There is no restore flow in this version. Soft-deleted expenses stay hidden from the UI.
