# PRD: Customer Management

## Problem Statement

Water station owners need a way to record and maintain customer profiles so they can track recurring deliveries, contact details, and address information in one place. Without a customer management feature, customer data is scattered, hard to update, and can be exposed across owners or tenants if access control is not enforced consistently.

## Solution

Add a tenant-scoped customer management feature that lets authenticated, registered users create, edit, archive, and view customers that belong to their own station or tenant. The feature must use the existing Clerk authentication flow for access, use Supabase for persistence, and rely on RLS for data isolation. Archived customers should remain in the database for historical reference but should be excluded from the default active customer experience.

## User Stories

1. As a registered station user, I want to see my customer list, so that I can manage deliveries from one place.
2. As a registered station user, I want to create a customer with a name and optional contact and address details, so that I can start tracking delivery recipients.
3. As a registered station user, I want to mark whether a customer is a business or not, so that I can store the right delivery context.
4. As a registered station user, I want to edit a customer record, so that I can keep contact and address details current.
5. As a registered station user, I want to archive a customer instead of deleting it, so that I can preserve history without showing inactive customers in the active list.
6. As a registered station user, I want archived customers to stay hidden by default, so that the active list stays relevant.
7. As a signed-out visitor, I want to be redirected to sign in before I can access customers, so that protected data is not exposed.
8. As a registered user from another tenant, I want to be unable to see another tenant's customers, so that customer data stays isolated.
9. As a registered station user, I want the system to reject invalid customer data before saving it, so that the database stays consistent.
10. As a registered station user, I want the customer form to show validation feedback, so that I can correct mistakes before submitting.
11. As a registered station user, I want the system to preserve archive history, so that I can recover the reason a customer stopped appearing in the active list.
12. As a registered station user, I want customer records to be linked to my tenant and creator identity, so that ownership is traceable.

## Acceptance Criteria

- Given I am signed in and registered, when I open the customers area, then I can only see customers for my own tenant.
- Given I am signed out, when I access the customers area, then I am redirected to sign in.
- Given I am signed in but not registered, when I access the customers area, then I am redirected to the registration flow.
- Given I submit a valid new customer, when the create action succeeds, then the customer is saved and linked to my tenant.
- Given I submit a valid new customer, when the record is stored, then the system records who created it.
- Given I edit a customer that belongs to my tenant, when the update succeeds, then the customer record is updated.
- Given I archive a customer that belongs to my tenant, when the archive succeeds, then the customer is excluded from the active list.
- Given another tenant has customers, when I query customers, then I cannot read or modify those records.
- Given a customer has been archived, when I browse the default customer list, then the archived customer does not appear unless the archived set is requested.
- Given I submit invalid customer data, when the form validates, then the request is blocked and validation messages are shown.

## Module Boundaries

### Customer route shell

Provides the authenticated entry point for customer management and composes the page-level layout, loading state, and empty state. It should not contain business logic beyond route composition.

### Customer list module

Owns the active customer table or list, row actions, archived indicator, and any list-level empty or loading states. It should consume server state through query hooks rather than fetch data directly.

### Customer form module

Owns create and edit forms, field-level validation messages, submit-state handling, and mapping between form values and service payloads.

### Customer service module

Owns Supabase query and mutation logic for customers, including create, update, archive, and list operations. All database interactions should stay here.

### Customer validation module

Owns the Zod schema and derived TypeScript types for customer input and update payloads.

### Customer access module

Owns the permission rules used by the UI and service layer to decide what the current user can view or mutate. The database remains the source of truth through RLS.

### Customer query module

Owns query keys and query invalidation rules so the feature can keep list and detail state consistent after mutations.

## Data Model Notes

- The feature should use the existing `customers` table shape described in the spec, including `name`, `is_business`, contact fields, address fields, coordinates, `tenant_id`, `created_by`, `created_at`, `updated_at`, and `deleted_at`.
- `tenant_id` is the primary ownership boundary for customer visibility.
- `deleted_at` should be used for archiving, not hard deletion, so customer history is preserved.
- The default customer experience should treat rows with a non-null `deleted_at` value as archived.
- The spec currently says `created_by` is a Clerk user ID, but the schema shown in the requirements uses an integer foreign key to `public.users(id)`. This PRD assumes the implementation stores the local app user record that corresponds to the authenticated Clerk identity. If the product truly wants raw Clerk IDs, the schema must change.
- `full_address` should be treated as a denormalized display field that can be assembled from the address parts when available.
- Latitude and longitude should remain optional and should preserve the precision defined by the schema.

## Validation Rules

- `name` is required and must not exceed the schema limit.
- `is_business` is optional in the form and defaults to `false` when omitted.
- `contact_number` is optional and must respect the schema length limit if provided.
- `facebook_url` is optional and, when present, must be a valid URL.
- `street_address`, `barangay`, `municipality`, `province`, `latitude`, `longitude`, and `full_address` are optional unless a future spec makes them required.
- `latitude` must be within the valid latitude range if provided.
- `longitude` must be within the valid longitude range if provided.
- Archived records must not be created through the archive path again as new records; archive should be an update to `deleted_at`, not a delete-and-reinsert flow.
- Server-side validation must mirror form validation. Client-side validation alone is not sufficient.

## Permissions

- Only authenticated users may access the customers feature.
- Only registered users may access the feature shell and data operations.
- Users may only read customers that belong to their own tenant.
- Users may only create, edit, or archive customers within their own tenant.
- RLS must enforce tenant isolation even if the UI or service layer is bypassed.
- The UI may hide unauthorized actions, but the server and database must remain authoritative.
- Signed-out users must be redirected to sign in.
- Signed-in but unregistered users must be redirected to complete registration before accessing customers.

## Edge Cases

- An empty active customer list should render a clear empty state instead of a blank table.
- An archived customer should not appear in the default active list.
- Editing a customer after it has been archived should be rejected unless the product later defines a restore flow.
- Attempting to access a customer from another tenant should fail even if the record ID is known.
- Duplicate customer names within the same tenant should be allowed unless a later rule explicitly forbids them.
- Partially filled address data should be accepted if it passes validation.
- Missing or invalid tenant context should block access rather than guess ownership.
- A failed create, update, or archive request should preserve the user's entered form values where possible.
- Validation errors from Supabase or RLS should be surfaced as user-friendly messages, not raw database errors.
- Archived data should remain queryable for future reporting or audit use, even if it is hidden from the default customer list.

## Out of Scope

- Customer search and filtering beyond the basic list experience.
- Customer import/export.
- Customer segmentation or tagging.
- Delivery scheduling tied to customers.
- Customer balance, invoicing, or payment history.
- Restoring archived customers unless a separate spec adds that flow.
