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

- Implemented or actively specified: Authentication, Customers, Products, Expenses, Deliveries, Maintenance, Documents
- Planned modules: Orders, Payments, Inventory, Reports, Settings, Team/Staff Management

Agents must not treat planned modules as approved implementation scope unless a
feature spec under `docs/specs` exists for the requested work.

## Deliveries Domain (feature 004-deliveries-module)

**Delivery Schedule** — the *plan* for serving a customer: who is served, what
products/services are included, and when (a single one-time date, or a recurring
rule such as "every Mon/Thu"). A schedule does not itself have an operational
status. One schedule produces one or more Deliveries.
_Avoid_: confusing a schedule with an individual delivery run.

**Delivery** (a.k.a. delivery occurrence) — a single dated delivery event that
staff actually prepares and carries out. It is the thing that moves through the
status lifecycle (`pending` → `for_delivery` → `completed`/`failed`) on a
specific date. A one-time schedule has exactly one Delivery; a recurring
schedule has many.
_Avoid_: "delivery" meaning the recurrence rule.

**Delivery Item** — a product line on a Delivery (or schedule template),
preserving the product, quantity, and the unit price at the time of delivery so
later product price changes do not alter past delivery records.

**Guest / named delivery** — a Delivery Schedule not linked to a Customer
record, identified only by a display label (e.g. walk-in or one-off recipient).

**Current delivery queue** — the actionable working set shown on the main
deliveries page: all `pending`/`for_delivery` occurrences that are overdue
(`delivery_date < today`) or due today, **plus** each active schedule's single
nearest upcoming occurrence. The full materialization horizon still exists in
the database but is not part of the "current" queue until each row becomes the
nearest upcoming one.
_Avoid_: equating "current queue" with "everything materialized".

**Delivery History** — the modal datatable of terminal occurrences only
(`completed` + `failed`). Not editable except to send a row back to
`pending`/`for_delivery`, which returns it to the current queue.

**Recurring schedule list** — the modal datatable of parent `delivery_schedules`
recurrence rules (not dated occurrences); its only action is stop/resume.

**Stop / Resume (a schedule)** — _Stop_ sets a recurring schedule to `paused`
and soft-deletes its pending occurrences dated today or later (in-flight
`for_delivery` rows and terminal history are kept; overdue pending is kept).
_Resume_ sets it back to `active` and materialization continues forward from the
current date on the schedule's **original `start_date` anchor** — the paused gap
is not back-filled. Distinct from archiving (owner-only soft delete of the
schedule itself), which is deferred.
_Avoid_: treating Stop as deleting history or as archiving the schedule.

**Stock-out window** — a delivery's items are deducted from `products.stock`
exactly while its status is `for_delivery` or `completed` (stock-tracked
products only). Entering that window deducts (blocked if it would go negative);
leaving it restores. See `005` ADR 0003.

## Maintenance Domain (feature 008-build-maintenance-module)

**Maintenance Schedule** — the *plan* for keeping a piece of equipment in good
order: what task, on what equipment, at what priority, and on what rhythm
(`one_time` with one or more hand-picked dates, `everyday`, or `weekly` on 1–3
chosen weekdays). A schedule is the thing the user sets **inactive**. Backed by
`maintenance_schedules`. _Avoid_: confusing a schedule with a single occurrence.

**Maintenance Task** (a.k.a. occurrence) — a single dated upkeep job staff
actually perform; it moves `pending → completed`. A one-time schedule has one
task per chosen date; a recurring schedule keeps exactly **one** pending task
that **rolls forward** to the next due date when completed. Backed by
`maintenance_tasks`. _Avoid_: "task" meaning the recurrence rule. See ADR 0006.

**Weekly frequency** — Once / Twice / Thrice means the number of selected
weekdays (1/2/3). `times_per_week` always equals `array_length(weekdays)`.
_Avoid_: a frequency independent of the chosen days.

**Equipment "Others"** — when the equipment is not in the known list, the user
picks *Others* and must describe it in `equipment_other`; a general `notes` field
further clarifies the task. _Avoid_: free-typing equipment outside the option set.

**Assignee** — the org staff member responsible for a task. Must be a real
`public.users` row in the caller's organization (or Unassigned); stored on the
occurrence so it can change per task. _Avoid_: free-text assignee names.

**Schedule status** — *active* (running), *inactive* (paused, hidden unless
"Show inactive"), or *completed* (one-time schedules only, all occurrences done;
recurring schedules are never "completed"). Inactive is distinct from **archive**
(`deleted_at`, owner-only). _Avoid_: equating inactive with archived/completed.

## Record Status Vocabulary

The app distinguishes a record being **operationally on/off** from it being
**removed**. These are independent.

**Active / Inactive (customer)** — an *active* customer is one the station still
serves; an *inactive* customer is kept on file but not currently served (e.g. a
household that paused service). Inactive customers still appear in the directory,
visually de-emphasised. Backed by `customers.is_active`. _Avoid_: treating
inactive as archived/deleted.

**Active / Discontinued (product)** — an *active* product is still offered;
a *discontinued* product is retired from the catalog but kept for history and
past records. Discontinued products still appear in the catalog, de-emphasised.
Backed by `products.is_active`. _Avoid_: treating discontinued as deleted.

**Archived** — a record soft-deleted via `deleted_at`. Archived records are
excluded from active lists entirely (the SELECT RLS policy filters
`deleted_at is null`). This is a separate, stronger action than setting a record
inactive/discontinued. _Avoid_: conflating archive with inactive/discontinued.

See `docs/adr/0005-record-status-distinct-from-archive.md`.

## Important Product Rule

Products are classified by whether the station tracks their stock quantity.

**Stock-tracked product**:
A physical product whose available quantity is counted, such as bottled water, caps, containers, dispensers, and accessories.
_Avoid_: Inventory-tracked item

**Non-stock-tracked product**:
A refill, service, or fee product whose available quantity is not counted, such as water refill services, delivery fees, and cleaning fees.
_Avoid_: Service item, untracked inventory item

## Documents Domain (feature 009-build-documents-module)

**Document** — a business file (permit, certificate, receipt, test result, or other record)
uploaded by staff or owner for compliance and record-keeping. Identified by title, category,
and optional document type. A document carries metadata (date, amount, expiry) but the file
itself is stored separately. Visibility controls whether other staff can see it; owners always
see all documents in the org.
_Avoid_: confusing a Document with a delivery receipt or an expense record — those are
separate domain objects.

**Document category** — the top-level grouping of a document. Fixed set: Business Permits,
Tax & BIR Documents, Water Quality Tests, Sanitary & Health, Sales & Customer Receipts,
Expenses & Supplier, Equipment & Maintenance, Delivery & Vehicle, Employee Documents, Other.
_Avoid_: free-typing a category outside this set.

**Document type** — a sub-classification within a category (e.g. "Mayor's Permit" under
"Business Permits"). Free text; validated at the form level, not enforced by the database.

**Approved (document)** — an owner has reviewed and marked the document as verified
(`is_approved = true`). Default is unreviewed (`false`). Not a workflow status; a single
boolean flag.
_Avoid_: treating approval as a multi-step lifecycle.

**Visibility (document)** — `all` means every org member can view the document; `only_me`
hides it from other staff (owners always see all documents regardless).
_Avoid_: treating `only_me` as hiding from owners.

## AquaFlow AI Domain (feature 011-aquaflow-ai-feature)

**AquaFlow AI** — an owner-only chat assistant module for business insights
(revenue, stock, deliveries, maintenance, expenses, customers). Not available
to staff sessions; see `docs/adr/0008-owner-only-route-level-gating.md`.
_Avoid_: treating this as a general-purpose chatbot open to all roles.

**Conversation** — one AI chat thread, owned by a single user (`created_by`),
not a shared org record. Backed by `ai_conversations`. See
`docs/adr/0007-ai-chat-history-personal-not-shared.md`. _Avoid_: assuming any
org member can see any conversation, unlike deliveries/maintenance.

**Message** — a single turn in a Conversation, either `role = user` or
`role = assistant`. Backed by `ai_messages`. An assistant message's content is
either plain text or one of three structured card types (insight, flag,
ranked) — see `docs/specs/011-aquaflow-ai-feature/`. _Avoid_: assuming all
assistant replies are plain text.

**Ready-made prompt** — a pre-written, business-tailored question with a short
**title** shown on its card (e.g. "Analyze my sales") and a separate, longer
**prompt body** with the actual prompt-engineered instructions sent to the AI.
Clicking one creates a user Message whose displayed text is the title but
whose actual content (what's sent/stored) is the full prompt body. _Avoid_:
assuming the displayed chat text and the sent prompt are the same string.

---

## Authentication & Onboarding (feature 000-auth_workflow)

- **Water station** — the organization an owner runs. Its stable identity is the
  `organizations.id` **uuid**; it is also labelled by a human-facing
  **organization code** (`organizations.organization_code`) that staff use to join.
- **Owner** — creates/owns a station (`is_owner = true`). After onboarding the
  `organization` session claim holds the new station's **uuid** (`organizations.id`).
- **Staff** — joins an existing station by its **organization code**; after
  onboarding their `organization` claim also holds that station's **uuid**.
- **`organization` session claim** — the current user's **`organizations.id` uuid**.
  This uuid is the `org_id` written on every tenant-owned row. (Historically this
  claim was a numeric/invite-code value matched against `organization_code`; it is
  now the org uuid — see task `009`.)
- **Session claims** — custom Clerk session-token claims sourced from the user's
  Clerk `public_metadata` and flattened to top level by the JWT template:
  `organization` (uuid string), `is_owner` (boolean), plus `name` and `email`.
  Read via `sessionClaims.organization` / `.is_owner` / `.name` / `.email`.
  Declared in `src/types/globals.d.ts`.
- **Registration / onboarding** — required post-sign-up step at `/complete-registration`.
  The form branches on the chosen role and calls one of two Supabase edge functions
  (axios POST, `Authorization: Bearer <clerk session token>`):
  - **Owner** → `create-aquaflow-organization`
    (`NEXT_PUBLIC_SUPABASE_EDGE_CREATE_ORG_URL`).
    Body `{ organization_name, name, email }` — `organization_name` from the form;
    `name`/`email` from the session claims. The function generates the
    `organization_code` and creates the `organizations`, `organization_members`,
    and `users` rows for the owner.
  - **Staff** → `aquaflow-add-staff`
    (`NEXT_PUBLIC_SUPABASE_EDGE_ADD_STAFF_URL`).
    Body `{ organization_code, contact_number, name, email }` — `organization_code`
    and `contact_number` from the form; `name`/`email` from the session claims. The
    function resolves the org by `organization_code` and creates the staff's
    `organization_members`/`users` rows.
  Both functions write the caller's Clerk `public_metadata` with
  `organization` (the resolved `organizations.id` uuid) and `is_owner`. After a
  successful call the client force-refreshes the session token
  (`getToken({ skipCache: true })`) and navigates to `/dashboard`.
- **Registered** — `sessionClaims.organization != null && sessionClaims.is_owner != null`
  (`isRegistered()` in `src/features/registration/registration.guards.ts`). Until then,
  middleware (`src/proxy.ts`) redirects every protected route to `/complete-registration`.
  See `docs/adr/0001-onboarding-gating-via-clerk-claims.md`.
- **Onboarding edge-function guarantee** — both functions **must** write a non-null
  `organization` uuid (and `is_owner`) into `public_metadata`. If they do not, the
  user is bounced back to `/complete-registration` by the guard. The guard is never
  weakened to let an org-less/owner-less session through; the failure mode is a
  stable landing on `/complete-registration`, not a bypass and not an infinite loop.
