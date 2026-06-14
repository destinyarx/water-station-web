Build the Expenses module for my Next.js project.

Before implementing anything, read and follow the existing `AGENTS.md` in the project. Also refer to `docs/DESIGN.md` for the design system, layout rules, colors, spacing, typography, components, and overall UI direction.

## Goal

Create a complete Expenses feature/module where the user can:

* View a list/table of expense records
* Create a new expense record
* Update/edit an existing expense record
* Delete an expense record
* View important expense information clearly
* Filter or search expenses where appropriate

This is for a **Water Refilling Station Management System**, so the visual design should feel clean, professional, organized, and related to water/purity/spring/mineral water businesses. The UI should look modern and business-ready, not playful or generic.

Use subtle water-inspired styling only where appropriate:

* Clean white and light surfaces
* Soft blue/cyan accents
* Rounded cards
* Calm spacing
* Professional dashboard-like layout
* Clear form hierarchy
* Minimal visual noise
* Icons that match water station operations, expenses, payments, receipts, and finance

Do not overdo the water theme. It should still look like a serious management system.

## Important Scope Limitation

Do **not** create backend logic, database migrations, API routes, server actions, or new database tables.

Assume the database already exists.

Use the Supabase SDK directly for CRUD operations.

This task is purely a **Next.js frontend feature/module** implementation.

## Database Context

The database already has an `expenses` table and these PostgreSQL enums:

```sql
create type expense_category as enum (
  'utilities',
  'water_production_supplies',
  'containers_packaging',
  'machine_maintenance_repairs',
  'delivery_expenses',
  'inventory_products_purchased',
  'rent_facility',
  'salaries_labor',
  'permits_government_fees',
  'testing_compliance',
  'marketing_promotion',
  'office_admin_supplies',
  'software_subscriptions',
  'bank_payment_fees',
  'cleaning_sanitation',
  'equipment_purchase',
  'miscellaneous',
  'other'
);

create type payment_method as enum (
  'cash',
  'gcash',
  'maya',
  'qr_ph',
  'bank_transfer',
  'debit_card',
  'credit_card',
  'cash_on_delivery',
  'other'
);
```

Use hard-coded frontend constants for these enum values.

## Expense Categories Constant

Create or use a frontend constant like this:

```ts
export const expenseCategories = [
  { name: 'Utilities', value: 'utilities' },
  { name: 'Water Production Supplies', value: 'water_production_supplies' },
  { name: 'Containers & Packaging', value: 'containers_packaging' },
  { name: 'Machine Maintenance & Repairs', value: 'machine_maintenance_repairs' },
  { name: 'Delivery Expenses', value: 'delivery_expenses' },
  { name: 'Inventory / Products Purchased', value: 'inventory_products_purchased' },
  { name: 'Rent & Facility', value: 'rent_facility' },
  { name: 'Salaries & Labor', value: 'salaries_labor' },
  { name: 'Permits & Government Fees', value: 'permits_government_fees' },
  { name: 'Testing & Compliance', value: 'testing_compliance' },
  { name: 'Marketing & Promotion', value: 'marketing_promotion' },
  { name: 'Office & Admin Supplies', value: 'office_admin_supplies' },
  { name: 'Software & Subscriptions', value: 'software_subscriptions' },
  { name: 'Bank & Payment Fees', value: 'bank_payment_fees' },
  { name: 'Cleaning & Sanitation', value: 'cleaning_sanitation' },
  { name: 'Equipment Purchase', value: 'equipment_purchase' },
  { name: 'Miscellaneous', value: 'miscellaneous' },
  { name: 'Other', value: 'other' },
] as const;
```

## Payment Methods Constant

Create or use a frontend constant like this:

```ts
export const paymentMethods = [
  { name: 'Cash', value: 'cash' },
  { name: 'GCash', value: 'gcash' },
  { name: 'Maya', value: 'maya' },
  { name: 'QR Ph', value: 'qr_ph' },
  { name: 'Bank Transfer', value: 'bank_transfer' },
  { name: 'Debit Card', value: 'debit_card' },
  { name: 'Credit Card', value: 'credit_card' },
  { name: 'Cash on Delivery', value: 'cash_on_delivery' },
  { name: 'Other', value: 'other' },
] as const;
```

Also create proper TypeScript types from these constants.

```ts
export type ExpenseCategory = typeof expenseCategories[number]['value'];
export type PaymentMethod = typeof paymentMethods[number]['value'];
```

## Table schema

Existing database schema:
    name varchar(100) not null,
    amount numeric(10, 2) not null,
    category expense_category not null,
    category_other varchar(50),
    payment_method payment_method not null,
    payment_method_other varchar(50),
    description varchar(255),
    date_incurred date not null,
    references_number varchar(100),
    org_id integer not null references public.organizations(organization_code) on delete cascade,
    created_by varchar(255) not null references public.users(clerk_id) on delete cascade,
    created_at timestamp not null default now(),
    updated_at timestamp,
    deleted_at timestamp


Do not modify the database schema.

## Feature Requirements

### Expenses Page

Create a main Expenses page with:

* Page title: `Expenses`
* Short description related to tracking operating costs for the water refilling station
* Primary action button: `Add Expense`
* Summary cards at the top if practical:

  * Total Expenses
  * This Month
  * Largest Category
  * Recent Expense Count

  Summary cards should be calculated from active expenses only.
  Recent Expense Count should cover the last 7 days.
  Largest Category should mean the category with the highest total amount spent.
  This Month should mean the current calendar month.
* A clean table/list of expenses
* Empty state if there are no expenses yet
* Loading state
* Error state
* Default list should exclude soft-deleted expenses
* Default list should sort by most recent expense date first
* Search by expense name, description, or reference number
* Filter by category
* Filter by payment method
* Optional date filter if it fits the current project style; it is not required for the first version
* Show an empty state when there are no active expenses
* Show a separate no-results state when filters or search return nothing

The layout should follow the current project design patterns and `docs/DESIGN.md`.

### Expense Table

The table should show:

* Expense name
* Category
* Amount
* Payment method
* Expense date
* Reference number if available
* Actions: Edit, Delete

Use readable labels for category and payment method instead of showing raw enum values.

Example:

* `machine_maintenance_repairs` should display as `Machine Maintenance & Repairs`
* `bank_transfer` should display as `Bank Transfer`

### Create Expense

Create a form/dialog/page depending on the existing project pattern.

Fields:

* Expense name
* Description
* Amount
* Category select
* Category other text input, shown only when category is `other`
* Payment method select
* Payment method other text input, shown only when payment method is `other`
* Expense date
* Reference number

Validation requirements:

* Expense name is required
* Amount is required and must be greater than 0
* Category is required
* Payment method is required
* Expense date is required
* When category is `other`, `category_other` is required
* When payment method is `other`, `payment_method_other` is required
* Optional fields should remain optional

Use existing form patterns in the project. If the project uses React Hook Form and Zod, follow that. If the project already has shared form components, reuse them.

### Update Expense

Allow the user to edit an existing expense record.

The edit form should:

* Pre-fill existing values
* Validate the same way as create
* Save changes through Supabase SDK
* Show success/error feedback
* Update the UI after saving

### Delete Expense

Allow the user to delete an expense record.

The delete action should:

* Ask for confirmation before deleting
* Clearly show which expense is being deleted
* Soft delete through Supabase SDK by setting `deleted_at`
* Show success/error feedback
* Refresh or update the list after deletion

Soft-deleted expenses should not appear in the default expenses list.
The UI does not need a restore flow in this version.

Use a professional confirmation dialog. Avoid using a plain browser confirm if the project already has dialog components.

## Supabase Requirements

Use the Supabase SDK already configured in the project.

## UI Direction

Make the module visually match a water refilling station business.

The design should feel:

* Clean
* Light
* Trustworthy
* Professional
* Fresh
* Organized
* Easy to scan

Suggested visual direction:

* Use card-based sections
* Use soft borders and subtle shadows if consistent with `docs/DESIGN.md`
* Use blue/cyan accents sparingly
* Use icons from the existing icon library if available
* Use finance/receipt/payment/category icons where useful
* Make the amount values visually clear
* Use badges for category and payment method
* Use a clean empty state with messaging like:
  `No expenses recorded yet`
  `Start tracking your water station operating costs by adding your first expense.`

Do not create a childish or overly decorative water theme. Keep it polished and suitable for business owners and staff.

## UX Requirements

* Keep the create/edit flow simple
* Make mobile/responsive layout usable
* Prevent duplicate submits
* Show loading states on buttons
* Show toast notifications if the project has toast support
* Format amounts as Philippine Peso
* Format dates clearly
* Use accessible labels
* Keep actions easy to find but not visually overwhelming

Currency format should be:

```ts
new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})
```

## Important Rules

* Follow `AGENTS.md`
* Follow `docs/DESIGN.md`
* Use the existing Supabase SDK setup
* Keep the enums hard-coded in frontend constants
* Keep the feature scoped only to expenses
* Reuse existing shared components where possible
* Maintain TypeScript safety
* Make the UI polished and production-ready

## Final Output Expected

After implementation, the Expenses module should allow users to create, update, delete, view, search, and filter expenses using the existing Supabase database.

The module should look like it belongs in a professional water refilling station management system and should follow the project’s existing design guide and coding conventions.
