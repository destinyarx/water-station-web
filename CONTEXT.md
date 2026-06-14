# CONTEXT.md

## Business Domain

This app is for a water refilling station.

The business sells two types of products:

1. Stock-based products  
   These are physical products with inventory count, such as bottled water, caps, containers, and accessories.

2. Refillable/service-based products  
   These are daily delivery or refill products that do not need normal stock deduction. They represent a refill service or recurring delivery.

## User Roles

### Owner

Can manage:
- dashboard
- customers
- staff/team
- products
- orders
- deliveries
- payments
- expenses
- revenue reports
- sales reports

### Staff

Can manage:
- assigned deliveries
- customer records if allowed
- products
- order status updates
- maintenance tasks

Staff should not access owner-only financial summaries unless explicitly allowed.

Staff can create products and update or delete product records they created.
Owners can update and delete organization-owned product records even when they
were created by another staff member in the same station.

## Core Modules

- Authentication
- Customers
- Products
- Orders
- Deliveries
- Payments
- Expenses
- Inventory
- Reports
- Settings
- Team/Staff Management

## Important Product Rule

Products are classified by whether the station tracks their stock quantity.

**Stock-tracked product**:
A physical product whose available quantity is counted, such as bottled water, caps, containers, dispensers, and accessories.
_Avoid_: Inventory-tracked item

**Non-stock-tracked product**:
A refill, service, or fee product whose available quantity is not counted, such as water refill services, delivery fees, and cleaning fees.
_Avoid_: Service item, untracked inventory item

## Authentication & Onboarding (feature 000-auth_workflow)

- **Water station** — the organization an owner runs. Identified to staff by an **invite
  code** (the `organization` value in the registration payload and the Clerk
  `organization` session claim).
- **Owner** — creates/owns a station (`is_owner = true`). At registration the client sends
  `organization: null`; the edge function creates the station and assigns a **non-null**
  `organization` claim server-side.
- **Staff** — joins an existing station with its invite code
  (`is_owner = false`, `organization = inviteCode`).
- **Session claims** — custom Clerk session-token claims (`organization`, `is_owner`)
  written by the edge function. Declared in `src/types/globals.d.ts`.
- **Registration / onboarding** — required post-sign-up step at `/complete-registration`.
  Submits to the Supabase `update-clerk-session-tokens` edge function (axios POST, Bearer
  session token), which writes `is_owner` + `organization` into the session token.
- **Registered** — `sessionClaims.organization != null && sessionClaims.is_owner != null`
  (`isRegistered()` in `src/features/registration/registration.guards.ts`). Until then,
  middleware (`src/proxy.ts`) redirects every protected route to `/complete-registration`.
  See `docs/adr/0001-onboarding-gating-via-clerk-claims.md`.
- **`update-clerk-session-tokens`** — Supabase edge function
  (`NEXT_PUBLIC_SUPABASE_EDGE_REGISTRATION_URL`). Assumed deployed; the app only calls it.
  **Required guarantee:** for owners it must set a non-null `organization` claim, otherwise
  owners loop forever on `/complete-registration`.
