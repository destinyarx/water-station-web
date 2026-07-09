# Database Context

This file is the source-of-truth database reference for AI agents working on this project. It summarizes the current schema, relationships, RLS policies, helper functions, views, and known schema caveats from the current working-tree contents of `supabase/migrations`.

## High-Level Model

This is a multi-tenant water station management database. Most business data belongs to an organization through an `org_id` foreign key that references `public.organizations(id)`.

The core tenant model is:

- `organizations` represents each water station business/tenant.
- `users` stores application user profiles and links each user to one organization.
- `organization_members` stores membership and role information for users inside organizations.
- Business records such as customers, products, expenses, deliveries, maintenance records, documents, and AI conversations are tied to an organization through `org_id`.

Most mature business tables use soft deletion with a nullable `deleted_at` column. RLS policies commonly hide soft-deleted rows by requiring `deleted_at is null`.

## Important Delivery Module Warning

Important note: the deliveries related tables `delivery_schedules`, `deliveries`, and `delivery_items` are not yet completed and perfected.

Expect some of the delivery module structure to be not final and to have some flaws. Do not treat the delivery schema as stable without reviewing and redesigning it first. This warning also applies to related delivery objects that depend on those tables, especially `delivery_schedule_items` and the `v_current_deliveries` view.

## Auth And Identity Model

The schema appears to use Clerk user IDs as the main application-level user identifier. Several tables store user references as `varchar(255)` values that reference `public.users(clerk_id)`.

Important identity fields and functions:

- `public.users.clerk_id` is unique and is used as the referenced user ID by most business tables.
- `public.organization_members.user_id` is a `varchar(100)` reference to `public.users(clerk_id)`.
- `private.current_user_id()` returns `nullif(auth.jwt() ->> 'sub', '')`.
- Most newer RLS helper checks compare membership rows to `auth.jwt() ->> 'sub'`.
- Some older policies compare to `auth.uid()::varchar(100)`.
- The `users` table has RLS policies that compare `org_id` to `(auth.jwt() -> 'user_metadata' ->> 'organization')::uuid`.

Security note: the identity model is mixed. The `users` table relies on `user_metadata.organization`, while newer helper functions rely on the JWT `sub` claim. Treat this carefully when changing RLS, because `user_metadata` is user-controlled in many Supabase auth contexts and should not be trusted for authorization unless the application has a separate guarantee.

## Enums

### `public.roles`

Used by `organization_members.role`.

- `owner`
- `admin`
- `staff`
- `driver`

### `expense_category`

Used by `expenses.category`.

- `utilities`
- `water_production_supplies`
- `containers_packaging`
- `machine_maintenance_repairs`
- `delivery_expenses`
- `inventory_products_purchased`
- `rent_facility`
- `salaries_labor`
- `permits_government_fees`
- `testing_compliance`
- `marketing_promotion`
- `office_admin_supplies`
- `software_subscriptions`
- `bank_payment_fees`
- `cleaning_sanitation`
- `equipment_purchase`
- `miscellaneous`
- `other`

### `payment_method`

Used by `expenses.payment_method`.

- `cash`
- `gcash`
- `maya`
- `qr_ph`
- `bank_transfer`
- `debit_card`
- `credit_card`
- `cash_on_delivery`
- `other`

### Delivery Enums

`delivery_recurrence_type`, used by `delivery_schedules.recurrence_type`:

- `one_time`
- `weekly`
- `monthly`

`delivery_schedule_status`, used by `delivery_schedules.status`:

- `active`
- `paused`
- `ended`

`delivery_status`, used by `deliveries.status`:

- `pending`
- `for_delivery`
- `completed`
- `failed`

### Maintenance Enums

`maintenance_priority`, used by `maintenance_schedules.priority`:

- `low`
- `medium`
- `high`

`maintenance_recurrence`, used by `maintenance_schedules.recurrence_type`:

- `one_time`
- `everyday`
- `weekly`

`maintenance_task_status`, used by `maintenance_tasks.status`:

- `pending`
- `completed`

## Private Helper Functions

The `private` schema exists to hold RLS helper functions.

### `private.current_user_id()`

Returns the JWT subject:

```sql
nullif(auth.jwt() ->> 'sub', '')
```

Used by creator-based update/delete policies to compare the current user to `created_by`.

### `private.is_org_member(_org_id uuid)`

Returns true when an `organization_members` row exists for the given org and the current JWT subject.

This function is `security definer`, `stable`, and uses an empty `search_path`.

### `private.org_role(_org_id uuid)`

Returns the current user's organization role for the given org, based on `organization_members.role`.

This function is `security definer`, `stable`, and uses an empty `search_path`.

### `private.is_org_admin(_org_id uuid)`

Returns true when the current user is an `owner` or `admin` in the given org.

This function is `security definer`, `stable`, and uses an empty `search_path`.

## Table Reference

### `public.organizations`

Tenant/business table.

Key columns:

- `id uuid primary key default gen_random_uuid()`
- `owner_id varchar(255) not null`
- `organization_code varchar(20) not null unique`
- `organization_name varchar(255) not null`
- `created_at timestamp not null default now()`

Relationships:

- Referenced by almost every tenant-owned table through `org_id`.
- `users.org_id` cascades on organization delete.
- `organization_members.org_id` cascades on organization delete.

RLS:

- Enabled.
- Members can select organizations where `private.is_org_member(id)` is true.
- Authenticated users can insert organizations.
- Admins/owners can update organizations.
- Owners can delete organizations.

### `public.users`

Application user profile table. User identity is tied to Clerk through `clerk_id`.

Key columns:

- `id uuid primary key default gen_random_uuid()`
- `clerk_id varchar(255) unique`
- `is_owner boolean default false`
- `is_active boolean default false`
- `org_id uuid not null references organizations(id) on delete cascade`
- `name`, `role`, `email`, `contact_number`
- `created_at`, `updated_at`

Indexes:

- `idx_users_clerk_id`
- `idx_users_org_id`

Relationships:

- Referenced by many tables through `created_by`, `delivered_by`, `assigned_to`, or `completed_by`.
- `organization_members.user_id` references `users.clerk_id`.

RLS:

- Enabled.
- Authenticated users can select users where `users.org_id` equals `(auth.jwt() -> 'user_metadata' ->> 'organization')::uuid`.
- Authenticated users can insert users only for that same JWT metadata organization.
- No explicit update/delete policies are present in the inspected migrations.

Important note:

- This table uses JWT `user_metadata.organization` for RLS, which differs from most newer helper-function policies.

### `public.organization_members`

Maps users to organizations and stores their role.

Key columns:

- `id uuid primary key default gen_random_uuid()`
- `org_id uuid not null references organizations(id) on delete cascade`
- `user_id varchar(100) unique not null references users(clerk_id) on delete cascade`
- `role roles not null default 'staff'`
- `is_active boolean not null default true`
- `created_at`, `updated_at`

Constraints and indexes:

- `unique_org_user unique (org_id, user_id)`
- `idx_org_members_user_org` on `(user_id, org_id)`
- `user_id` is globally unique, so one Clerk user can only appear once in this table, even though there is also a `(org_id, user_id)` uniqueness constraint.

Relationships:

- Joins users to organizations.
- Used by private RLS helper functions to decide membership, role, and admin status.

RLS:

- Enabled.
- Initial policies allow users to select/insert/update/delete only rows where `user_id = auth.uid()::varchar(100)`.
- Later policies allow authenticated organization members to view members in their organization.
- Later insert policy allows authenticated users to add organization members with `with check (true)`.
- Later update/delete policies allow admins/owners to manage organization members for their org.

Important note:

- This table has multiple overlapping policies from separate migrations.

### `public.customers`

Customer records for an organization.

Key columns:

- `id serial primary key`
- `name varchar(100) not null`
- `is_business boolean default false`
- Contact and location fields: `contact_number`, `facebook_url`, `latitude`, `longitude`, address fields
- `is_active boolean not null default true`
- `org_id uuid not null references organizations(id) on delete cascade`
- `created_by varchar(255) not null references users(clerk_id) on delete cascade`
- `created_at`, `updated_at`, `deleted_at`

Indexes:

- `customers_org_id_idx`
- `customers_created_by_idx`

Relationships:

- Belongs to an organization.
- Created by a user.
- Referenced by `delivery_schedules.customer_id`.

RLS:

- Enabled.
- Members can select non-deleted customers in their org.
- Members can insert customers in their org.
- Admins/owners or the original creator can update/delete non-deleted customers.

### `public.products`

Products sold or delivered by an organization.

Key columns:

- `id serial primary key`
- `product_name varchar(255) not null`
- `price float not null`
- `is_stock_tracked boolean default true`
- `stock int default 0`
- `descriptions varchar(255)`
- `is_active boolean not null default true`
- `org_id uuid not null references organizations(id) on delete cascade`
- `created_by varchar(255) not null references users(clerk_id) on delete cascade`
- `created_at`, `updated_at`, `deleted_at`

Indexes:

- `products_org_id_idx`
- `products_created_by_idx`

Relationships:

- Belongs to an organization.
- Created by a user.
- Referenced by `delivery_schedule_items.product_id` and `delivery_items.product_id`.

RLS:

- Enabled.
- Members can select non-deleted products in their org.
- Members can insert products in their org.
- Admins/owners or the original creator can update/delete non-deleted products.

### `public.expenses`

Expense records for an organization.

Key columns:

- `id serial primary key`
- `name varchar(100) not null`
- `amount numeric(10, 2) not null`
- `category expense_category not null`
- `category_other varchar(50)`
- `payment_method payment_method not null`
- `payment_method_other varchar(50)`
- `description varchar(255)`
- `date_incurred date not null`
- `references_number varchar(100)`
- `org_id uuid not null references organizations(id) on delete cascade`
- `created_by varchar(255) not null references users(clerk_id) on delete cascade`
- `created_at`, `updated_at`, `deleted_at`

Indexes:

- `expenses_org_id_idx`
- `expenses_created_by_idx`

Relationships:

- Belongs to an organization.
- Created by a user.

RLS:

- Enabled.
- Members can select non-deleted expenses in their org.
- Members can insert expenses in their org.
- Admins/owners or the original creator can update/delete non-deleted expenses.

### `public.delivery_schedules`

Defines one-time or recurring delivery schedules.

This table is part of the unfinished delivery module. Its structure is not final.

Key columns:

- `id serial primary key`
- Customer target: `customer_id` or guest fields `guest_name`, `guest_contact`, `guest_address`
- Recurrence fields: `recurrence_type`, `start_date`, `delivery_date`, `weekdays`, `interval_weeks`, `day_of_month`, `interval_months`, `end_date`
- `status delivery_schedule_status not null default 'active'`
- `notes varchar(500)`
- `org_id uuid not null references organizations(id)`
- `created_by varchar(255) not null references users(clerk_id)`
- `created_at`, `updated_at`, `deleted_at`

Constraints:

- `delivery_schedules_customer_xor_guest`: exactly one of `customer_id` or `guest_name` must be present.
- `delivery_schedules_recurrence_shape`: recurrence-specific fields must match `one_time`, `weekly`, or `monthly`.
- `delivery_schedules_weekdays_range`: weekly weekdays must be ISO weekday numbers `1` through `7` and cannot contain nulls.

Indexes:

- `delivery_schedules_org_idx` on `org_id` where not deleted.
- `delivery_schedules_customer_idx` on `customer_id` where not deleted.
- `delivery_schedules_status_idx` on `status` where not deleted.

Relationships:

- Belongs to an organization.
- Created by a user.
- Optionally belongs to a customer.
- Has many `delivery_schedule_items`.
- Has many materialized `deliveries`.

RLS:

- No explicit RLS enable statement or policies are present for this table in the inspected migrations.

### `public.delivery_schedule_items`

Product line items attached to a delivery schedule.

This table depends on the unfinished delivery schedule model.

Key columns:

- `id serial primary key`
- `schedule_id integer not null references delivery_schedules(id) on delete cascade`
- `product_id integer not null references products(id)`
- `quantity numeric(10,2) not null check (quantity > 0)`
- `unit_price numeric(12,2)`, optional override where null means use the product price
- `org_id uuid not null references organizations(id)`
- `created_at`, `updated_at`

Indexes:

- `delivery_schedule_items_schedule_idx`

Relationships:

- Belongs to a delivery schedule.
- References a product.
- Belongs to an organization.

RLS:

- No explicit RLS enable statement or policies are present for this table in the inspected migrations.

### `public.deliveries`

Materialized delivery occurrences for a schedule and date.

This table is part of the unfinished delivery module. Its structure is not final.

Key columns:

- `id serial primary key`
- `schedule_id integer not null references delivery_schedules(id)`
- `delivery_date date not null`
- `status delivery_status not null default 'pending'`
- `failure_remarks varchar(500)`
- `notes varchar(500)`
- `delivered_by varchar(255) references users(clerk_id)`
- `completed_at timestamp`
- `org_id uuid not null references organizations(id)`
- `created_by varchar(255) not null references users(clerk_id)`
- `created_at`, `updated_at`, `deleted_at`

Constraints:

- `deliveries_failure_remarks_check`: failed deliveries require non-empty `failure_remarks`.

Indexes:

- `deliveries_schedule_date_unique`, a partial unique index on `(schedule_id, delivery_date)` where not deleted.
- `deliveries_org_date_idx` on `(org_id, delivery_date)` where not deleted.
- `deliveries_status_idx` on `status` where not deleted.

Relationships:

- Belongs to a delivery schedule.
- Belongs to an organization.
- Created by a user.
- May be assigned/delivered by a user through `delivered_by`.
- Has many `delivery_items`.
- Used by `v_current_deliveries`.

RLS:

- No explicit RLS enable statement or policies are present for this table in the inspected migrations.

### `public.delivery_items`

Snapshot product line items for a materialized delivery.

This table is part of the unfinished delivery module. Its structure is not final.

Key columns:

- `id serial primary key`
- `delivery_id integer not null references deliveries(id) on delete cascade`
- `product_id integer not null references products(id)`
- `product_name varchar(255) not null`
- `unit_price numeric(12,2) not null`
- `quantity numeric(10,2) not null check (quantity > 0)`
- `org_id uuid not null references organizations(id)`
- `created_at`, `updated_at`

Indexes:

- `delivery_items_delivery_idx`

Relationships:

- Belongs to a delivery.
- References a product.
- Stores product name and unit price snapshots.
- Belongs to an organization.

RLS:

- No explicit RLS enable statement or policies are present for this table in the inspected migrations.

### `public.maintenance_schedules`

Defines recurring or one-time maintenance schedules.

Key columns:

- `id bigint generated always as identity primary key`
- `title varchar(120) not null`
- `equipment varchar(60) not null`
- `equipment_other varchar(120)`
- `priority maintenance_priority not null default 'medium'`
- `recurrence_type maintenance_recurrence not null`
- `weekdays smallint[]`
- `times_per_week smallint`
- `notes varchar(500)`
- `is_active boolean not null default true`
- `org_id uuid not null references organizations(id)`
- `created_by varchar(255) not null references users(clerk_id)`
- `created_at`, `updated_at`, `deleted_at`

Constraints:

- `maintenance_schedules_other_chk`: `equipment_other` is required when `equipment = 'Others'`.
- `maintenance_schedules_weekly_chk`: weekly schedules require 1 to 3 weekdays and `times_per_week = array_length(weekdays, 1)`.

Indexes:

- `maintenance_schedules_org_idx` on `org_id` where not deleted.

Relationships:

- Belongs to an organization.
- Created by a user.
- Has many `maintenance_tasks`.

RLS:

- Enabled.
- Members can select non-deleted maintenance schedules in their org.
- Members can insert maintenance schedules in their org.
- Admins/owners or the original creator can update/delete non-deleted maintenance schedules.

### `public.maintenance_tasks`

Materialized maintenance task occurrences.

Key columns:

- `id bigint generated always as identity primary key`
- `schedule_id bigint not null references maintenance_schedules(id) on delete cascade`
- `due_date date not null`
- `status maintenance_task_status not null default 'pending'`
- `assigned_to varchar(255) references users(clerk_id)`
- `completed_at timestamp`
- `completed_by varchar(255) references users(clerk_id)`
- `org_id uuid not null references organizations(id)`
- `created_by varchar(255) not null references users(clerk_id)`
- `created_at`, `updated_at`, `deleted_at`

Indexes:

- `maintenance_tasks_schedule_date_ux`, a partial unique index on `(schedule_id, due_date)` where not deleted.
- `maintenance_tasks_org_due_idx` on `(org_id, due_date)` where not deleted.

Relationships:

- Belongs to a maintenance schedule.
- Belongs to an organization.
- Created by a user.
- Can be assigned to a user.
- Can be completed by a user.

RLS:

- Enabled.
- Members can select non-deleted maintenance tasks in their org.
- Members can insert maintenance tasks in their org.
- Admins/owners or the original creator can update/delete non-deleted maintenance tasks.

### `public.documents`

Document metadata for an organization.

Key columns:

- `id bigint generated always as identity primary key`
- `org_id uuid not null references organizations(id)`
- `created_by varchar(255) not null references users(clerk_id)`
- `title varchar(200) not null`
- `description text`
- `category text not null`
- `document_type text`
- `document_date date`
- `amount numeric(12,2)`
- `expiry_date date`
- `visibility text not null default 'all'`
- `is_approved boolean not null default false`
- `original_name text`
- `created_at`, `updated_at`, `deleted_at`

Constraints:

- `category` must be one of the allowed document categories, such as `Business Permits`, `Water Quality Tests`, `Sales & Customer Receipts`, or `Other`.
- `visibility` must be `all` or `only_me`.

Indexes:

- `documents_org_idx` on `org_id` where not deleted.
- `documents_expiry_idx` on `(org_id, expiry_date)` where `expiry_date is not null` and not deleted.

Relationships:

- Belongs to an organization.
- Created by a user.

RLS:

- Enabled.
- Members can select non-deleted documents in their org.
- Members can insert documents in their org.
- Admins/owners or the original creator can update/delete non-deleted documents.

Important note:

- The `visibility` column currently does not appear to be enforced in RLS. The inspected select policy allows all organization members to view all non-deleted documents regardless of `visibility`.

### `public.ai_conversations`

AI chat conversation/thread table.

Key columns:

- `id bigint generated always as identity primary key`
- `org_id uuid not null references organizations(id)`
- `created_by varchar(255) not null references users(clerk_id)`
- `title varchar(200) not null default 'New chat'`
- `created_at`, `updated_at`

Indexes:

- `ai_conversations_owner_idx` on `(org_id, created_by)`

Relationships:

- Belongs to an organization.
- Created by a user.
- Has many `ai_messages`.
- No `deleted_at`; comments indicate conversations are hard-deleted and cascade to messages.

RLS:

- No explicit RLS enable statement or policies are present for this table in the inspected migrations.

### `public.ai_messages`

Messages within an AI conversation.

Key columns:

- `id bigint generated always as identity primary key`
- `conversation_id bigint not null references ai_conversations(id) on delete cascade`
- `role text not null check (role in ('user', 'assistant'))`
- `content text not null`
- `display_text text`
- `card_type text check (card_type in ('insight', 'flag', 'ranked'))`
- `card_data jsonb`
- `created_at timestamp not null default now()`

Indexes:

- `ai_messages_conversation_idx`

Relationships:

- Belongs to an AI conversation.
- Deleted automatically when the parent conversation is deleted.

RLS:

- No explicit RLS enable statement or policies are present for this table in the inspected migrations.

## Relationship Map

Core tenancy:

- `organizations.id` is the tenant key.
- `users.org_id -> organizations.id`.
- `organization_members.org_id -> organizations.id`.
- Most business tables include `org_id -> organizations.id`.

User ownership and authorship:

- `users.clerk_id` is referenced by most `created_by` fields.
- `customers.created_by -> users.clerk_id`.
- `products.created_by -> users.clerk_id`.
- `expenses.created_by -> users.clerk_id`.
- `delivery_schedules.created_by -> users.clerk_id`.
- `deliveries.created_by -> users.clerk_id`.
- `maintenance_schedules.created_by -> users.clerk_id`.
- `maintenance_tasks.created_by -> users.clerk_id`.
- `documents.created_by -> users.clerk_id`.
- `ai_conversations.created_by -> users.clerk_id`.

Membership and roles:

- `organization_members.user_id -> users.clerk_id`.
- `organization_members.role` controls admin/owner checks through private helper functions.

Customers, products, and deliveries:

- `delivery_schedules.customer_id -> customers.id`, or a delivery schedule can use guest fields instead of a customer.
- `delivery_schedule_items.schedule_id -> delivery_schedules.id`.
- `delivery_schedule_items.product_id -> products.id`.
- `deliveries.schedule_id -> delivery_schedules.id`.
- `delivery_items.delivery_id -> deliveries.id`.
- `delivery_items.product_id -> products.id`.
- `deliveries.delivered_by -> users.clerk_id`.

Maintenance:

- `maintenance_tasks.schedule_id -> maintenance_schedules.id`.
- `maintenance_tasks.assigned_to -> users.clerk_id`.
- `maintenance_tasks.completed_by -> users.clerk_id`.

Documents:

- `documents.org_id -> organizations.id`.
- `documents.created_by -> users.clerk_id`.

AI conversations:

- `ai_messages.conversation_id -> ai_conversations.id`.
- `ai_conversations.org_id -> organizations.id`.
- `ai_conversations.created_by -> users.clerk_id`.

## RLS Summary

Tables with explicit RLS enabled and policies:

- `organizations`
- `users`
- `organization_members`
- `customers`
- `products`
- `expenses`
- `maintenance_schedules`
- `maintenance_tasks`
- `documents`

Tables with no explicit RLS policies in the inspected migrations:

- `delivery_schedules`
- `delivery_schedule_items`
- `deliveries`
- `delivery_items`
- `ai_conversations`
- `ai_messages`

Common mature-table RLS pattern:

- Select requires the current user to be an organization member and `deleted_at is null`.
- Insert requires the current user to be an organization member.
- Update/delete requires `deleted_at is null` and either:
  - the current user is an org admin/owner, or
  - the current user is an org member and is the original creator.

Common helper functions:

- Membership: `private.is_org_member(org_id)`
- Admin/owner: `private.is_org_admin(org_id)`
- Owner-only role check: `private.org_role(id) = 'owner'`
- Creator check: `created_by = private.current_user_id()`

Important security notes:

- `users` uses JWT `user_metadata.organization` rather than the private membership helpers.
- `organization_members` has overlapping policies from multiple migrations.
- `documents.visibility = 'only_me'` is not enforced by the current RLS policy.
- Delivery and AI chat tables currently need RLS review before being exposed to untrusted clients.

## View Reference

### `public.v_current_deliveries`

Created with:

```sql
create or replace view public.v_current_deliveries
with (security_invoker = on)
```

Purpose:

- Shows active current delivery rows for deliveries whose status is `pending` or `for_delivery`.
- Includes deliveries due on or before `current_date`.
- Also includes the next future pending/for-delivery delivery per schedule.

Selected fields:

- Delivery fields: `id`, `schedule_id`, `delivery_date`, `status`, `failure_remarks`, `notes`, `delivered_by`, `completed_at`, `org_id`, `created_by`, timestamps
- Schedule fields: `customer_id`, `guest_name`, `recurrence_type`
- Customer field: `customer_name`

Relationships used:

- `deliveries d join delivery_schedules s on s.id = d.schedule_id`
- `left join customers c on c.id = s.customer_id`

Filtering:

- Excludes soft-deleted deliveries.
- Includes only `pending` and `for_delivery`.
- Uses a correlated subquery to include the next future delivery date per schedule.

Security:

- The view uses `security_invoker = on`, so underlying table permissions/RLS should apply.
- Because the underlying delivery tables currently have no explicit RLS policies in the inspected migrations, this view should be reviewed before exposure.

## Index And Constraint Notes

Multi-tenant lookup indexes:

- Most business tables have an `org_id` index.
- Many soft-deletable tables use partial indexes with `where deleted_at is null`.

Idempotent occurrence indexes:

- `deliveries_schedule_date_unique` enforces one live delivery occurrence per schedule/date.
- `maintenance_tasks_schedule_date_ux` enforces one live maintenance task occurrence per schedule/date.

Soft deletion:

- `customers`, `products`, `expenses`, `delivery_schedules`, `deliveries`, `maintenance_schedules`, `maintenance_tasks`, and `documents` include `deleted_at`.
- `delivery_schedule_items`, `delivery_items`, `ai_conversations`, and `ai_messages` do not include `deleted_at`.

Cascade deletes:

- Deleting an organization cascades to `users` and `organization_members`, and to several business tables that specify `on delete cascade`.
- Deleting a delivery schedule cascades to `delivery_schedule_items`, but `deliveries.schedule_id` does not specify cascade.
- Deleting a delivery cascades to `delivery_items`.
- Deleting a maintenance schedule cascades to `maintenance_tasks`.
- Deleting an AI conversation cascades to `ai_messages`.

## Migration Inventory

This context was derived from these migration files:

- `20260609160018_create_organization_table.sql`
- `20260609160117_create_users_table.sql`
- `20260609160120_create_organization_members_table.sql`
- `20260609160121_create_rls_helper_function.sql`
- `20260609160122_organizations_table_rls_policies.sql`
- `20260609160123_organization_members_table_rls_policies.sql`
- `20260609160137_create_customers_table.sql`
- `20260609160200_create_products_table.sql`
- `20260609175718_create_expenses_table.sql`
- `20260616051702_create_delivery_schedules.sql`
- `20260616051708_create_delivery_schedules_items.sql`
- `20260616051727_create_deliveries.sql`
- `20260616051827_create_delivery_items.sql`
- `20260627123217_create_maintenance_schedules_table.sql`
- `20260627123218_create_maintenance_tasks_table.sql`
- `20260629084439_create_documents_table.sql`
- `20260705144315_create_ai_conversations_table.sql`
- `20260705144500_create_ai_messages_table.sql`
