# Deliveries Module Context

## Purpose

The Deliveries module helps a water refilling station plan, track, and complete customer deliveries. It covers both one-time deliveries and recurring refill schedules, which are common for households, offices, stores, and other regular customers.

This module should not be treated as a generic calendar or task list. It should reflect how water stations actually operate: preparing refill orders, assigning delivery work, tracking delivery status, recording failed attempts, and keeping delivery records tied to customers, products, and organization ownership.

## Business Context

Water stations often serve customers who need regular refills on predictable days. Some customers order only when needed, while others expect daily, weekly, or recurring deliveries.

The system should support both cases:

- A one-time delivery for a specific future date.
- A recurring delivery schedule for repeated service.
- A delivery connected to an existing customer.
- A delivery without an existing customer, using a delivery name or similar display label.

A delivery may include refill services, bottled water, accessories, delivery fees, or other products already managed in the Products module.

## Core Behavior

A user should be able to create a delivery schedule with enough information for staff to understand what needs to be delivered, when it should be delivered, and what products or services are included.

A delivery should support:

- Customer attachment when the customer already exists.
- Guest or named delivery details when no customer record exists.
- One-time scheduling using a date from today onward.
- Recurring scheduling for repeated delivery patterns.
- Product line items with quantity and price.
- Notes or description for normal delivery context.
- Status tracking through the delivery workflow.

Delivery statuses should describe the operational state of the delivery:

- `pending`: scheduled or recorded but not yet prepared for delivery.
- `for_delivery`: ready or currently out for delivery.
- `completed`: successfully delivered.
- `failed`: delivery was attempted or could not be completed.

When a delivery is marked as failed, the system should require failure remarks. Normal notes may exist on any delivery, but failure remarks should be specific to failed deliveries.

## Scheduling Context

The module needs to support two scheduling modes.

For one-time deliveries, the user selects a single date from today onward.

For recurring deliveries, the user defines a repeated schedule. The current idea is to let the user choose how many times per week the delivery occurs and then choose the matching weekdays. This area needs careful review because the interaction can become inconsistent if the selected frequency does not match the selected weekdays.

The future planning or grilling pass should clarify:

- Whether users should choose frequency first or weekdays first.
- How the system should prevent mismatches between frequency and weekday selection.
- Whether monthly recurring schedules are required for the first version.
- Whether recurring schedules generate future delivery records immediately or only store the recurrence rule.
- How far into the future recurring deliveries should appear in operational views.

## Data And Security Context

The deliveries table does not exist yet, so this module requires a Supabase PostgreSQL migration plan.

Delivery records must follow the project's multi-tenant rules:

- Every organization-owned delivery must include `org_id`.
- `org_id` must come from the current Clerk organization/session metadata.
- `created_by` must come from the authenticated Clerk user ID.
- Users must never manually enter `org_id` or `created_by` in forms.
- Users must never access deliveries from another organization.
- RLS policies must protect all delivery records.
- If `deleted_at` is included, active delivery lists should exclude soft-deleted rows.

The schema should account for both one-time and recurring deliveries without forcing unrelated data into the same fields. It should also represent delivery product line items clearly enough to support quantity, price, and future reporting.

## Product Relationship

Deliveries should attach products from the existing Products module. The agent implementing this module should inspect the current product schema and documentation before designing delivery line items.

Product line items should preserve the product, quantity, and price used for the delivery. This matters because product prices may change later, while past delivery records should still reflect the price at the time they were created.

## Roles And Workflow

Owners should be able to manage and monitor organization-wide deliveries.

Staff should be able to handle day-to-day delivery operations, such as creating delivery records, updating delivery statuses, and recording failure remarks when a delivery cannot be completed.

Any owner/staff differences should follow the project's existing role and RLS conventions. The feature spec should not invent new role behavior unless it is explicitly approved.

## Expected Spec Output

The delivery module spec should explain the feature clearly before implementation. It should focus on:

- Delivery workflow context.
- One-time and recurring scheduling behavior.
- Customer and guest delivery support.
- Product line item behavior.
- Status lifecycle.
- Failure remarks.
- Multi-tenant Supabase data rules.
- Required migration planning.
- Open questions that need grilling before implementation.
- deliveries tables schema in postgresql (save this in a markdown file since i will executing this in my supabase dashboard)
- table schema can be varies and should be fit with the implementation and behavior (it can also be two or more as long as it follows the context and behavior
The future implementation agent must read `AGENTS.md` and all required project docs before coding. The feature should follow the project's spec-driven workflow and should not jump directly to implementation.

## Important notes 
- since table schema is made for postgresql (not inside the working folder) 
-  before testing the functionality i need the migration script to execute in my supabase dashboard before you can do the testing phase
