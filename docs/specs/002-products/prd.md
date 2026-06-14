# PRD: Products Management

## Problem Statement

Registered water station users need a reliable way to manage the products, refill services, containers, accessories, and fees their station offers. Without a focused Products module, staff and owners cannot keep the station's item catalog, prices, stock tracking, and service offerings organized for later sales, delivery, and inventory workflows.

## Solution

Add a Products module to the protected dashboard that lets registered Owner and Staff users view, search, create, update, and soft-delete active products for their own organization. The module should distinguish stock-tracked products from non-stock-tracked products, keep organization data isolated, and follow the existing water station dashboard patterns for forms, tables, Supabase services, TanStack Query, validation, dialogs, and feedback.

## User Stories

1. As a registered station user, I want to view active products in one place, so that I can understand what my station currently offers.
2. As a registered station user, I want the product list to include refill services, bottled products, containers, accessories, and fees, so that the catalog matches real water station operations.
3. As a registered station user, I want soft-deleted products to stay hidden from the active list, so that inactive products do not clutter daily workflows.
4. As a registered station user, I want to search products by product name, so that I can quickly find an item in the catalog.
5. As a registered station user, I want product rows to show name, description, price, stock tracking, stock, created date, and updated date, so that I can scan the catalog without opening every record.
6. As a registered station user, I want stock-tracked products to show a numeric stock quantity, so that I can monitor physical inventory items.
7. As a registered station user, I want non-stock-tracked products to show "Not tracked" instead of a stock number, so that refill services and fees are not mistaken for physical inventory.
8. As a registered station user, I want prices formatted as currency, so that product costs are easy to read.
9. As a registered station user, I want a loading state while products are fetched, so that the page does not appear broken.
10. As a registered station user, I want an error state if products fail to load, so that I know the system could not retrieve the catalog.
11. As a registered station user, I want an empty state when there are no active products, so that I know how to start building the catalog.
12. As a registered station user, I want a no-results state when search returns no matches, so that I can distinguish filtered results from an empty catalog.
13. As a registered station user, I want to create a product from the Products page, so that I can add new refill services or inventory items as the station changes.
14. As a registered station user, I want product name to be required, so that every product has a clear display label.
15. As a registered station user, I want product name to be trimmed before saving, so that accidental whitespace does not create inconsistent catalog entries.
16. As a registered station user, I want product name limited to the database length, so that saves do not fail unexpectedly.
17. As a registered station user, I want price to be required and non-negative, so that products always have valid selling prices.
18. As a registered station user, I want stock tracking to default to enabled, so that physical products are counted unless I intentionally mark them as services or fees.
19. As a registered station user, I want stock to be required when stock tracking is enabled, so that stock-tracked products always have a valid quantity.
20. As a registered station user, I want stock to be an integer greater than or equal to zero, so that inventory counts stay valid.
21. As a registered station user, I want stock to save as zero when stock tracking is disabled, so that non-stock-tracked products have predictable stored values.
22. As a registered station user, I want descriptions to be optional and short, so that I can add context without turning products into long notes.
23. As a registered station user, I want descriptions to be trimmed before saving, so that display text stays clean.
24. As a registered station user, I want `org_id` to be assigned automatically, so that I cannot accidentally create products for another station.
25. As a registered station user, I want `created_by` to be assigned automatically from my Clerk user ID, so that ownership and audit behavior are consistent.
26. As a staff user, I want to create products for my organization, so that I can maintain the station catalog during daily operations.
27. As a staff user, I want to update products I created, so that I can correct product details I am responsible for.
28. As a staff user, I want to delete products I created, so that I can remove inactive items I added.
29. As an owner, I want to update any product in my organization, so that I can manage the station catalog even when a staff member created the row.
30. As an owner, I want to delete any product in my organization, so that I can keep the active catalog clean regardless of who created the product.
31. As any user, I want cross-organization products to be inaccessible, so that another station's catalog is never exposed.
32. As a registered station user, I want to edit product name, price, stock tracking, stock, and description, so that product records can stay current.
33. As a registered station user, I want update confirmation before changes are saved, so that accidental edits do not alter product information used by later workflows.
34. As a registered station user, I want update actions to set `updated_at`, so that users can see when product details last changed.
35. As a registered station user, I want update actions to preserve `created_at`, `created_by`, and `org_id`, so that identity and tenancy metadata remain stable.
36. As a registered station user, I want delete confirmation before removing a product from the active list, so that I do not accidentally hide a catalog item.
37. As a registered station user, I want product deletion to use `deleted_at`, so that the row remains available for future audit or reporting needs.
38. As a registered station user, I want successful create, update, and delete actions to refresh the products table, so that I immediately see the latest catalog state.
39. As a registered station user, I want success feedback after create, update, and delete actions, so that I know the operation completed.
40. As a registered station user, I want safe error feedback when a mutation fails, so that I can retry without seeing raw database errors.
41. As a keyboard user, I want product forms and dialogs to be accessible, so that I can manage products without relying on a mouse.
42. As a station user on a smaller screen, I want the Products page to remain readable and usable, so that product management works during daily operations.
43. As a product implementer, I want the module to follow existing Customers and Expenses patterns, so that the codebase remains consistent and maintainable.
44. As a future sales or delivery implementer, I want products to use the existing schema exactly, so that later modules can select catalog items without needing a product model rewrite.

## Implementation Decisions

- The Products module is limited to product catalog management for one organization.
- The existing Supabase `products` table is the source of truth. No product database migration is part of this PRD.
- Products are organization-owned records scoped by `org_id`.
- The app must never expose a form field for `org_id`, `created_by`, `created_at`, `updated_at`, or `deleted_at`.
- On create, the service resolves `org_id` from the current Clerk session organization and `created_by` from the current Clerk user ID.
- Product feature code uses the current repository auth contract: `sessionClaims.is_owner`.
- Staff users can create products and update or soft-delete products they created.
- Owner users can update or soft-delete any product in their organization, even when `created_by` belongs to another user.
- RLS remains the authoritative authorization boundary. UI checks may improve experience, but they must not replace Supabase policy enforcement.
- Product deletion means soft delete by setting `deleted_at`, not hard delete.
- Active product lists only show rows where `deleted_at` is null.
- The product type distinction is represented by `is_stock_tracked`, not by adding a new product type column.
- `Stock-tracked product` means a physical item whose quantity is counted, such as bottled water, containers, caps, dispensers, and accessories.
- `Non-stock-tracked product` means a refill, service, or fee whose quantity is not counted, such as 5 gallon refill, delivery fee, or cleaning fee.
- When `is_stock_tracked` is false, the saved stock value should be zero and the UI should display stock as "Not tracked".
- Product name is required, trimmed, and limited to 255 characters.
- Product price is required and must be greater than or equal to zero.
- Product stock is required only when stock tracking is enabled, must be an integer, and must be greater than or equal to zero.
- Product description is optional, trimmed, and limited to 255 characters.
- The create and edit form should be reusable, with mode-specific defaults and submit copy.
- Updates require a confirmation dialog before applying changes.
- Deletes require a confirmation dialog before applying the soft delete.
- CRUD success should invalidate or refresh the Products query so the datatable reflects the latest state.
- Product data fetching and mutations should use the Supabase SDK through feature services.
- Server state should use TanStack Query with array query keys and a feature-level product query key factory.
- Forms should use React Hook Form and Zod.
- The UI should use shadcn/ui and Tailwind, following the existing dashboard design direction.
- The page route should follow the existing protected route structure and use the existing `/products` route stub.
- A small sidebar/navigation adjustment is allowed if needed to expose the Products page and active state.
- The Products module should not redesign the broader dashboard layout.

## Testing Decisions

- Tests should focus on external behavior and module contracts rather than internal component implementation details.
- Validation tests should cover required product name, max lengths, non-negative price, stock integer rules, conditional stock behavior, trimming, and default values.
- Mapper tests should cover database row to display model mapping, insert payloads, update payloads, and form default values.
- Service tests should verify active-only reads, create payloads with resolved owner metadata, update payloads with `updated_at`, soft delete payloads with `deleted_at`, and safe error handling.
- Authorization-sensitive tests should verify that client payloads do not accept manually supplied `org_id` or `created_by`.
- Query key tests should verify Products query keys are arrays and stable.
- Hook tests should verify create, update, and delete mutations invalidate the Products query.
- UI tests or manual verification should cover loading, error, empty, no-results, table display, create dialog, edit confirmation, delete confirmation, pending states, success feedback, and error feedback.
- Manual RLS verification should confirm active list tenant isolation, cross-organization blocking, staff creator permissions, and owner override behavior.
- Prior art should follow the existing Customers and Expenses test coverage style: schema tests, mapper tests, service tests, query key tests, and focused component flow checks.

## Out of Scope

- Sales module changes.
- Deliveries module changes.
- Customers module changes.
- Expenses module changes.
- Maintenance module changes.
- Authentication or onboarding changes.
- User management and role administration changes.
- Product database migrations, unless later verification shows the live table differs from the documented schema.
- Hard delete flows.
- Restore flows for soft-deleted products.
- Product categories beyond `is_stock_tracked`.
- Inventory deduction, stock movement history, purchases, or replenishment workflows.
- Price history.
- Bulk import or export.
- Product image upload.
- Barcode or SKU management.
- Analytics, reports, or dashboards based on product data.
- Redesigning the full dashboard or sidebar beyond a small Products navigation entry if needed.

## Further Notes

The Products module should feel like part of a real water refilling station workflow, not a generic item CRUD screen. Product examples and empty-state copy should use station language such as refill services, bottled products, containers, delivery fees, caps, and dispensers.

The implementation should follow the existing feature-module approach used by Customers and Expenses. The best testing seams are validation/schema, mapper behavior, Supabase service behavior, query keys, mutation invalidation, and page-level user flows.
