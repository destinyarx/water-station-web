# Products Module Specification

## Goal

Build the **Products** feature/module for the Water Refilling Station Management System.

This module allows authenticated users to manage the products and services offered by their water refilling station, including bottled water, containers, refill services, accessories, and other related items.

Both Owner and Staff users may manage products for their own organization.
Staff users may create products and update or delete product rows they created.
Owners may update or delete organization-owned products even when the row's
`created_by` value does not match their Clerk user ID. Users must never access
products from another organization.

The Products module must support:

* Create product
* View products in a datatable
* Update product
* Delete product
* Confirm important actions
* Follow the existing database table schema
* Follow the project coding conventions and design system

Before implementation, read and follow:

* `AGENTS.md` for coding conventions, architecture rules, libraries, folder structure, and project-specific development standards.
* `docs/DESIGN.md` for UI/UX, layout, design system, spacing, typography, and visual direction.

---

## Project Context

The application is a **Water Refilling Station Management System**.

It helps a water refilling business manage:

* Customers
* Deliveries
* Products
* Sales
* Expenses
* Maintenance schedules

The Products module is one of the core modules because products are used in sales, deliveries, and inventory-related workflows.

Examples of products may include:

* 5 Gallon Water Refill
* Bottled Water 500ml
* Bottled Water 1L
* Slim Container
* Round Container
* Water Dispenser
* Container Cap
* Delivery Fee
* Cleaning Fee

Some products are physical inventory items, while some are services.

---

## Scope

This task is limited to the **Products module only**.

### Included in Scope

* Products page
* Products datatable
* Create product flow
* Edit product flow
* Delete product flow
* Product form validation
* Confirmation dialog for delete
* Confirmation dialog for update/save changes
* Empty state
* Loading state
* Error state
* Success/error feedback
* Multi-tenant filtering based on organization
* Owner override for update/delete within the same organization
* Soft delete support using `deleted_at`
* Follow existing table schema
* Follow existing design guide

### Out of Scope

Do not build or modify these modules unless required for integration:

* Sales module
* Deliveries module
* Customers module
* Expenses module
* Maintenance module
* Authentication module
* Organization onboarding
* User management

Do not redesign the whole dashboard or sidebar unless the Products module needs a small navigation entry or active state adjustment.

---

## Database Table Schema

The Products module must follow this table structure:

```sql
id serial primary key, 

product_name varchar(255) not null,

price float not null,

is_stock_tracked boolean default true,

stock int default 0,

descriptions varchar(255),

org_id integer not null references public.organizations(organization_code) on delete cascade,

created_by varchar(255) not null references public.users(clerk_id) on delete cascade,

created_at timestamp not null default now(),

updated_at timestamp,

deleted_at timestamp
```

---

## Field Meaning

### `id`

Unique product identifier.

Used internally for update, delete, and detail actions.

### `product_name`

The display name of the product.

Examples:

* 5 Gallon Water Refill
* Bottled Water 500ml
* Slim Container
* Round Container
* Delivery Fee

This field is required.

### `price`

The selling price of the product.

This field is required and must be greater than or equal to 0.

### `is_stock_tracked`

Determines whether inventory should be tracked for this product.

Use `true` for physical products with inventory.

Examples:

* Bottled water
* Containers
* Caps
* Dispensers

Use `false` for service-based or non-inventory products.

Examples:

* Water refill service
* Delivery fee
* Cleaning fee

### `stock`

The available stock quantity.

This should only be meaningful when `is_stock_tracked = true`.

When `is_stock_tracked = false`, stock may be set to `0` and visually treated as “Not tracked.”

### `descriptions`

Optional short description of the product.

Maximum length should follow the database limit of 255 characters.

### `org_id`

The organization code of the current user.

This must be automatically assigned from the authenticated user’s organization.

The user should not manually enter this value.

### `created_by`

The Clerk user ID of the authenticated user who created the product.

This must be automatically assigned.

The user should not manually enter this value.

### `created_at`

Timestamp when the product was created.

### `updated_at`

Timestamp when the product was last updated.

This should be updated whenever the product is edited.

### `deleted_at`

Used for soft delete.

When a product is deleted, do not permanently remove it unless the project already uses hard delete for this table.

Preferred behavior:

```sql
deleted_at = now()
```

Products with a non-null `deleted_at` should not appear in the active products table.

---

## Product Types

The UI does not need a separate `product_type` column because the current schema already uses `is_stock_tracked`.

Use this behavior:

### Stock-tracked product

For physical products where inventory count matters.

Example:

```txt
Product Name: Bottled Water 500ml
Price: 15.00
Stock Tracked: Yes
Stock: 120
```

### Non-stock-tracked product

For services or refill items where stock is not directly tracked.

Example:

```txt
Product Name: 5 Gallon Water Refill
Price: 35.00
Stock Tracked: No
Stock: 0
```

In the UI, display this as:

```txt
Stock: Not tracked
```

---

## Main Page Requirements

Create a Products page for managing all active products.

Suggested route:

```txt
/products
```

Follow the existing route structure in the project.

The page should have:

* Page title: `Products`
* Short description: `Manage your water station products, refill services, containers, and inventory items.`
* Primary action button: `Add Product`
* Products datatable
* Search/filter controls
* Empty state when no products exist
* Loading state while fetching products
* Error state when products fail to load

---

## Datatable Requirements

The Products datatable should be clean, professional, and easy to scan.

Suggested columns:

| Column         | Description                                 |
| -------------- | ------------------------------------------- |
| Product Name   | Product name and optional short description |
| Price          | Formatted currency                          |
| Stock Tracking | Shows whether stock is tracked              |
| Stock          | Shows quantity or “Not tracked”             |
| Created At     | Date created                                |
| Updated At     | Date last updated, if available             |
| Actions        | Edit and Delete actions                     |

### Datatable Features

The datatable should support:

* Search by product name
* Sort by product name
* Sort by price
* Sort by stock
* Sort by created date
* Empty state
* Loading skeleton
* Row actions menu
* Pagination if the existing table pattern supports it

### Row Actions

Each row should have actions:

* Edit
* Delete

Use the existing project pattern for dropdown menus, action buttons, or table row actions.

---

## Create Product Flow

The user should be able to create a product using a form.

The form may be displayed in a modal, drawer, or separate page depending on the existing project pattern.

### Required Fields

* Product name
* Price
* Stock tracking

### Optional Fields

* Stock
* Description

### Form Fields

| Field            | Type                   | Validation                                            |
| ---------------- | ---------------------- | ----------------------------------------------------- |
| Product Name     | Text input             | Required, max 255 characters                          |
| Price            | Number input           | Required, must be >= 0                                |
| Is Stock Tracked | Switch/checkbox/select | Default: true                                         |
| Stock            | Number input           | Required when stock tracking is enabled, must be >= 0 |
| Description      | Textarea/input         | Optional, max 255 characters                          |

### Behavior

When `is_stock_tracked` is enabled:

* Show the stock field
* Require stock to be a number greater than or equal to 0

When `is_stock_tracked` is disabled:

* Hide or disable the stock field
* Save stock as `0`
* Display stock as `Not tracked` in the table

### Auto-filled Fields

The following should not be manually entered by the user:

* `org_id`
* `created_by`
* `created_at`
* `updated_at`
* `deleted_at`

These should be handled by the backend, service layer, database defaults, or authenticated session context.

---

## Update Product Flow

The user should be able to update an existing product.

Editable fields:

* Product name
* Price
* Is stock tracked
* Stock
* Description

When the user saves changes, show a confirmation dialog before applying the update.

Suggested confirmation message:

```txt
Save changes to this product?
```

Suggested description:

```txt
This will update the product information used across your water station records.
```

Actions:

* Cancel
* Save Changes

When updating:

* Set `updated_at` to the current timestamp
* Do not change `created_at`
* Do not change `created_by`
* Do not change `org_id`

---

## Delete Product Flow

The user should be able to delete a product from the products table.

Use a confirmation dialog before deleting.

Suggested confirmation title:

```txt
Delete product?
```

Suggested confirmation description:

```txt
This product will be removed from your active products list. This action may affect future selection of this product in sales or delivery workflows.
```

Actions:

* Cancel
* Delete Product

Preferred delete behavior:

* Soft delete the product by setting `deleted_at = now()`
* Exclude soft-deleted products from the active products list

Do not permanently delete the row unless the existing project convention requires hard delete.

---

## Multi-Tenant Rules

Products must be organization-scoped.

Users should only see products where:

```sql
products.org_id = current user's organization
```

Users should only create products under their own organization.

Users should not be able to manually choose another organization.

The `org_id` should come from the authenticated user/session metadata, existing auth helper, or backend context.

The `created_by` value should come from the authenticated Clerk user ID.

The application role check should follow the current repo auth contract:

```ts
sessionClaims.is_owner
```

Do not read a separate Clerk public metadata shape from Products feature code
unless the repository-wide auth contract is changed first.

---

## Validation Rules

Use the existing validation library defined in `AGENTS.md`.

Expected validation behavior:

### Product Name

* Required
* Must be a string
* Maximum 255 characters
* Should be trimmed before saving

### Price

* Required
* Must be a valid number
* Must be greater than or equal to 0
* Display as currency in the UI

### Is Stock Tracked

* Boolean
* Default value: `true`

### Stock

* Must be an integer
* Must be greater than or equal to 0
* Required when `is_stock_tracked = true`
* Should become `0` when `is_stock_tracked = false`

### Description

* Optional
* Maximum 255 characters
* Should be trimmed before saving

---

## UI/UX Requirements

Follow `docs/DESIGN.md`.

The Products module should feel appropriate for a water refilling station business.

Design direction:

* Clean
* Professional
* Light
* Fresh
* Organized
* Water/purity-inspired
* SaaS-style dashboard interface

Use the existing project design system and components.

Suggested UI copy:

### Page Header

```txt
Products
Manage refill services, bottled products, containers, and other water station items.
```

### Empty State

```txt
No products yet
Start by adding your first refill service, bottled water, or container product.
```

Button:

```txt
Add Product
```

### Delete Confirmation

```txt
Delete product?
This product will be removed from your active products list.
```

### Update Confirmation

```txt
Save product changes?
This will update the product information used in your water station records.
```

---

## Feedback and Toasts

Show feedback after each action.

### Create Success

```txt
Product created successfully.
```

### Update Success

```txt
Product updated successfully.
```

### Delete Success

```txt
Product deleted successfully.
```

### Error

```txt
Something went wrong. Please try again.
```

Use the existing toast/notification pattern in the project.

---

## Data Fetching and State Management

Follow `AGENTS.md` for the preferred libraries and structure.

Expected behavior:

* Fetch only active products where `deleted_at` is null
* Scope all queries by organization
* Use the existing server/client data fetching pattern
* Keep loading, success, and error states clear
* Revalidate or invalidate the products query after create, update, or delete

---

## Suggested Folder Structure

Follow the project’s existing feature folder structure.

Suggested structure only if it matches the project conventions:

```txt
src/features/products/
  components/
    products-table.tsx
    product-form.tsx
    product-actions.tsx
    delete-product-dialog.tsx
    update-product-dialog.tsx
  hooks/
    use-products.ts
    use-create-product.ts
    use-update-product.ts
    use-delete-product.ts
  services/
    products-service.ts
  schemas/
    product-schema.ts
  types/
    product.types.ts
  tests/
    products.test.ts
```

Do not force this structure if `AGENTS.md` defines a different convention.

---

## Product Form Details

The product form should be reusable for both create and update.

Recommended behavior:

* Create mode: empty default values
* Edit mode: pre-fill existing product values
* Submit button text changes depending on mode

Button labels:

```txt
Create Product
Save Changes
```

The form should prevent duplicate accidental submissions by disabling the submit button while loading.

---

## Accessibility Requirements

The module should follow basic accessibility practices:

* Inputs must have labels
* Buttons must have clear text or accessible labels
* Dialogs must be keyboard accessible
* Confirmation dialogs should clearly explain the action
* Error messages should be shown near the related form field
* Destructive actions should be visually distinct

---

## Acceptance Criteria

The Products module is complete when:

* User can view a list of active products
* User can search products by name
* User can create a product
* User can update a product
* User sees a confirmation dialog before update is applied
* User sees a confirmation dialog before delete is applied
* User can delete a product
* Deleted products no longer appear in the table
* Soft delete uses `deleted_at` if consistent with the project convention
* Product form validates required fields
* Stock behavior changes based on `is_stock_tracked`
* `org_id` is automatically assigned from the current user’s organization
* `created_by` is automatically assigned from the current Clerk user
* The module follows `AGENTS.md`
* The module follows `docs/DESIGN.md`
* The UI looks professional and suitable for a water refilling station SaaS dashboard
* Loading, empty, success, and error states are handled properly
* CRUD operations refresh the datatable after success

---

## Notes for `/grill-with-docs`

Please review this Products module specification against:

* `AGENTS.md`
* `docs/DESIGN.md`
* Existing project folder structure
* Existing CRUD patterns
* Existing data fetching patterns
* Existing table/datatable components
* Existing form validation approach
* Existing toast/dialog components
* Existing Supabase/Clerk auth integration
* Existing RLS and multi-tenant conventions

Check for:

* Missing requirements
* Schema mismatches
* Security issues
* Multi-tenant mistakes
* UX gaps
* Inconsistent naming
* Better folder structure
* Better service/query organization
* Better validation rules
* Anything that may cause implementation bugs later

The final implementation plan should remain focused only on the Products module.
