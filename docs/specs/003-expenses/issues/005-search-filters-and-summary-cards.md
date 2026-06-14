# Issue 005: Search, filters, and summary cards

## Type

AFK

## Blocked by

- [Expense foundation and active list](./001-expense-foundation-and-active-list.md)

## User stories covered

6, 7, 8, 9, 11, 12, 13, 14, 15, 17

## What to build

Build the expense discovery and overview layer. A registered station user should be able to search active expenses by name, description, or reference number; filter by category and payment method; optionally filter by date if it fits the current page layout; and see summary cards calculated from active expenses only. The page should distinguish between a true empty state and a no-results state caused by filters or search.

## Acceptance criteria

- [ ] Search matches expense name, description, and reference number.
- [ ] Search does not treat `category_other` or `payment_method_other` as primary search fields.
- [ ] Users can filter active expenses by category.
- [ ] Users can filter active expenses by payment method.
- [ ] Optional date filtering may be included, but it must not block shipping the slice.
- [ ] Filtered/search views show a no-results state when no active rows match.
- [ ] True empty state remains distinct from no-results state.
- [ ] Amounts are formatted as Philippine Peso.
- [ ] Summary cards are calculated from active expenses only.
- [ ] `This Month` uses the current calendar month.
- [ ] `Recent Expense Count` uses the last 7 days.
- [ ] `Largest Category` means the category with the highest total amount spent.

## Notes

- Summary cards should not include soft-deleted rows.
- Keep the filter controls usable on mobile and restrained enough for a business dashboard.
