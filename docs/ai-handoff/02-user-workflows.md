# User Workflows — AquaFlow

> Companion to [01-product-overview.md](./01-product-overview.md). Same
> confidence labels apply: **Confirmed** / **Inferred** / **Unknown** /
> **Potentially outdated** / **Requires validation**. Implementation status
> per workflow is judged by whether `src/features/<module>` contains real
> service/hook/component code (not just a spec) — see `docs/CODEBASE.md` for
> the reference module blueprint (`customers`) that every other module
> follows.
>
> Routes below are confirmed to exist as directories under
> `src/app/(protected)/` unless noted otherwise: `dashboard`, `customers`,
> `products`, `deliveries`, `maintenances`, `documents`, `expenses`,
> `ai-assistant`, `sales` (placeholder), `playground` (internal dev tool, not
> a customer-facing workflow — sends test emails; excluded below).

---

## 1. Registration / Onboarding

**Actors:** New Clerk-authenticated user (not yet an org member); becomes
Owner or Staff.

**Trigger:** First sign-in after Clerk sign-up, or any protected-route visit
while `sessionClaims.organization` / `sessionClaims.is_owner` are not both
set.

**Preconditions:** Valid Clerk session (`userId` present).

**Main flow:**
1. Middleware (`src/proxy.ts`) checks `isRegistered(sessionClaims)`
   (`organization != null && is_owner != null`); if false, redirects to
   `/complete-registration` for every route except sign-in/sign-up/legal pages.
2. User fills `complete-registration` form (React Hook Form + Zod), choosing
   Owner or Staff.
   - **Owner** submits `organization_name` (+ `name`/`email` from session
     claims) → calls Supabase edge function `create-aquaflow-organization`
     (`NEXT_PUBLIC_SUPABASE_EDGE_CREATE_ORG_URL`, axios POST, Bearer Clerk
     token). The function generates an `organization_code` and creates
     `organizations` / `organization_members` / `users` rows.
   - **Staff** submits `organization_code` + `contact_number` (+ `name`/
     `email` from claims) → calls `aquaflow-add-staff`
     (`NEXT_PUBLIC_SUPABASE_EDGE_ADD_STAFF_URL`), which resolves the org by
     code and creates the staff's `organization_members`/`users` rows.
3. Both functions write Clerk `public_metadata.organization` (org uuid) and
   `public_metadata.is_owner`.
4. Client force-refreshes the session token (`getToken({ skipCache: true })`)
   and navigates to `/dashboard`.

**Alternative flows:** Edge function fails to write a non-null
`organization`/`is_owner` → guard keeps bouncing the user back to
`/complete-registration` (never lets a partially-onboarded session through).

**Validation rules:** Zod schema branches by role; owner requires
`organization_name`; staff requires `organization_code` + `contact_number`
(+ optional `gender`, `phone_number` per the earliest brief — **requires
validation** against the current form fields, since the original context.md
brief and the later ADR-driven CONTEXT.md description differ slightly in
field list).

**Side effects:** Creates `organizations`, `organization_members`, `users`
rows; mutates Clerk `public_metadata`.

**Permissions:** No org membership required to reach this page; it is the
one route reachable by an authenticated-but-unregistered user.

**Routes:** `/complete-registration` (outside the `(protected)` group).

**DB entities:** `organizations`, `organization_members`, `users`.

**Source files:**
- `src/proxy.ts`
- `src/features/registration/registration.guards.ts`
- `src/features/registration/components/complete-registration-form.tsx`
- `src/features/registration/services/registration.service.ts`
- `src/features/registration/hooks/use-complete-registration.ts`

**Related spec:** `docs/specs/000-auth_workflow/context.md`, `docs/specs/000-auth_workflow/PLAN.md`

**Implementation status:** Implemented — **Confirmed**.

**Note:** `docs/specs/000-auth_workflow/context.md` (the original brief)
describes posting to a different edge function name
(`update-clerk-session-tokens`) with a different payload shape than what
`CONTEXT.md`'s "Authentication & Onboarding" section (the validated,
later-written source of truth) describes. Treat `CONTEXT.md` as authoritative
and the raw `context.md` brief as **Potentially outdated** —
Evidence: `docs/specs/000-auth_workflow/context.md` vs. `CONTEXT.md` ("Authentication & Onboarding").

---

## 2. Customer Management (create / edit / archive / view)

**Actors:** Owner, Staff (both can manage customers per `CONTEXT.md`, though
the PRD's user stories are written generically as "registered station user").

**Trigger:** Navigating to `/customers`.

**Preconditions:** Registered session; org membership.

**Main flow:**
1. Page loads active customers (`deleted_at is null`) scoped to `org_id` via
   RLS + explicit service-layer filter.
2. Create: form (name required; `is_business` toggle; optional contact/
   Facebook URL/address/lat-lng) → confirm-before-save dialog → insert with
   `org_id`/`created_by` resolved from Clerk session (never form input).
3. Edit: same form pre-filled, update-confirm dialog → update row
   (`updated_at` stamped client-side).
4. Archive: confirm dialog → soft delete (`deleted_at = now()`); row
   disappears from active list.
5. Toggle `is_active` (in-file "inactive" vs. active-served) — a distinct,
   reversible, lower-friction action from archive (reactivating skips
   confirmation, deactivating requires it).

**Alternative flows:** Signed-out → redirected to sign-in. Signed-in,
unregistered → redirected to `/complete-registration`. Cross-org direct
query → RLS returns no row.

**Validation rules:** `name` required, ≤ schema limit; `facebook_url` valid
URL if present; lat/lng within valid ranges if present; server-side Zod
mirrors client-side.

**Failure states:** Raw Supabase/Postgres errors never surface — service
layer throws a friendly constant message; RHF shows field-level errors.

**Side effects:** None beyond the customer row itself (no linkage to
deliveries in this module — that linkage lives in the deliveries module).

**Permissions:** Org-scoped RLS on SELECT/INSERT/UPDATE; legacy hard-DELETE
policy exists but must not be used by UI flows (**Confirmed, flagged as
legacy-only** — Evidence: `docs/DATABASE.md` `public.customers` policies table).

**Routes:** `/customers`.

**DB entities:** `public.customers`.

**Source files:** `src/features/customers/**` (see `docs/CODEBASE.md` for
the full file-by-file blueprint — this module is the reference pattern for
every other feature).

**Related spec:** `docs/specs/001-customers-basic-feature/prd.md`,
`docs/specs/001-customers-basic-feature/ACCEPTANCE.md`

**Implementation status:** Implemented — **Confirmed**
(`src/features/customers` has full components/hooks/services/tests).

---

## 3. Product / Service Catalog Management

**Actors:** Owner (full override rights), Staff (create; edit/delete own).

**Trigger:** Navigating to `/products`.

**Preconditions:** Registered session; org membership.

**Main flow:**
1. Page loads active products (`deleted_at is null`), searchable by name.
2. Create: name (required, trimmed, ≤255), price (required, ≥0),
   `is_stock_tracked` (defaults true), stock (required + integer ≥0 iff
   stock-tracked, forced to 0 otherwise), description (optional, trimmed,
   ≤255). `org_id`/`created_by` resolved server-side.
3. Edit: confirm-before-save dialog; `created_at`/`created_by`/`org_id`
   preserved; `updated_at` stamped.
4. Soft delete ("discontinue from active catalog"): confirm dialog →
   `deleted_at`.
5. Row display: stock-tracked shows numeric stock; non-stock shows "Not
   tracked" instead of a number; prices formatted as currency.

**Alternative flows:** Staff attempting to edit/delete another staff
member's product → RLS blocks unless the actor is the owner. Owner can
override regardless of `created_by`.

**Validation rules:** See Main flow #2; enforced by Zod schema mirrored
server-side.

**Failure states:** Loading/error/empty/no-results states all explicitly
required by the PRD.

**Side effects:** None beyond the product row directly (stock is later
*mutated* by the Deliveries module on dispatch/return — products itself
does not deduct stock).

**Permissions:** Staff = create + edit/delete own; Owner = edit/delete any
org product. Cross-org access blocked by RLS regardless of role.

**Routes:** `/products`.

**DB entities:** `public.products`.

**Source files:** `src/features/products/**`.

**Related spec:** `docs/specs/002-products/prd.md`,
`docs/specs/007-remap-ui-products-customers/description.md` (UI remap pass).

**Implementation status:** Implemented — **Confirmed**.

---

## 4. Expense Recording

**Actors:** Owner, Staff (generic "registered station user" in the PRD — no
role-differentiated permission is documented for expenses, unlike products;
**requires validation** whether staff have full parity here or if this is
simply undocumented).

**Trigger:** Navigating to `/expenses`.

**Preconditions:** Registered session; org membership.

**Main flow:**
1. Page loads active expenses (`deleted_at is null`), sorted by
   `date_incurred` descending by default.
2. Summary cards computed from active expenses only: Total, This Month
   (current calendar month), Largest Category (highest total spend
   category), Recent (last 7 days count).
3. Create/edit via form: category and payment method are enum selects with
   an `other` option that requires a matching free-text field when chosen;
   `references_number` always optional.
4. Search by name/description/reference number; filter by category, payment
   method, optional date range.
5. Soft delete via confirm dialog.

**Alternative flows:** No-results state (filters/search active but nothing
matches) is explicitly distinct from the empty state (no data at all).

**Validation rules:** Required fields per form; conditional `other` text
inputs required only when `other` selected; positive amount check
(**inferred to mean amount > 0, not documented as ≥0 vs >0 explicitly** —
requires validation against `src/features/expenses/expenses.schema.ts`).

**Side effects:** None beyond the expense row (no linkage to deliveries or
products).

**Permissions:** Org-scoped RLS, same contract as other modules; no
staff-vs-owner distinction documented.

**Routes:** `/expenses`.

**DB entities:** `public.expenses` (columns not fully detailed in
`docs/DATABASE.md` at the time of this pass — **requires validation**;
`docs/DATABASE.md` itself notes expense docs must be kept in sync but its
own expenses section is a to-do list, not filled-in column data).

**Source files:** `src/features/expenses/**`.

**Related spec:** `docs/specs/003-expenses/prd.md`,
`docs/specs/003-expenses/ACCEPTANCE.md`

**Implementation status:** Implemented — **Confirmed**
(full components/hooks/services/tests present, including
`expenses.summary.ts` and `expenses.ui-meta.ts` for the card math and
enum-label mapping).

---

## 5. Delivery Planning & Lifecycle (one-time + recurring)

**Actors:** Owner, Staff — shared org queue; any member can act on any
occurrence or schedule except archiving a schedule (owner-only).

**Trigger:** Navigating to `/deliveries`.

**Preconditions:** Registered session; org membership; customer and/or
product catalog populated (delivery items reference products).

**Main flow (create):**
1. User opens the unified create dialog: Customer (existing customer **or**
   a guest/named label) → Schedule (one-time date, or recurring: weekly
   with `weekdays[]` + `interval_weeks`, or monthly with `day_of_month` +
   `interval_months`, optional `end_date`) → Products (repeatable line
   items with running total, price snapshotted at creation) → Notes.
2. On page load, a client-triggered, idempotent "top-up" materializes any
   missing occurrences for active recurring schedules within a rolling
   14-day horizon (unique on `(schedule_id, delivery_date)`).
3. **Current delivery queue** (main table, default tab) shows only:
   overdue `pending`/`for_delivery` rows (`delivery_date < today`), rows due
   today, plus each active schedule's single nearest upcoming occurrence —
   backed by the `v_current_deliveries` view.

**Main flow (status lifecycle):**
4. Row action menu offers only legal next statuses for the current status:
   `pending → for_delivery → completed | failed`, and reverse transitions
   (`completed`/`failed` are **reversible**, not terminal, per ADR 0003 — a
   deliberate change from the original 004 design).
5. Entering `for_delivery` auto-stamps `delivered_by` (Clerk user) and
   deducts stock for stock-tracked items (atomic, blocks going negative —
   zero-row update ⇒ rejected with a warning).
6. Entering `completed` stamps `completed_at`; entering `failed` requires
   `failure_remarks` (dialog-gated); leaving either state (revert) restores
   stock if it had been deducted.
7. A delivery is editable (items/notes/date) **only while `pending`** —
   other statuses must be reverted to `pending` first.

**Main flow (recurring schedule management):**
8. **Recurring schedule list modal**: shows recipient, recurrence, derived
   next-upcoming date; only action is **Stop** (sets `paused`, soft-deletes
   today+future `pending` occurrences, keeps in-flight/history, and hides every
   occurrence of the paused schedule from the main queue) or **Resume** (sets
   `active`, restores eligible main-queue visibility, continues from today on
   the original `start_date` anchor, and does not back-fill the paused gap).

**Main flow (history):**
9. **History modal**: `completed` + `failed` + `cancelled` occurrences,
   read-only except supported status reverts, most-recent first, with terminal
   reasons shown where applicable.

**Alternative flows:** Dispatch that would drive stock negative → blocked
with a warning, no partial deduction. Stopping a schedule does not mutate
in-flight or historical rows even though the paused schedule contributes no
rows to the main queue. Dropping a weekday from an active recurring
schedule (future spec, editing is out of scope for 005) does not retroactively
change already-materialized pending rows.

**Validation rules:** `failure_remarks` required iff status = `failed`
(DB CHECK + app-level); exactly one of Customer or guest label (DB CHECK);
weekly frequency (`times_per_week`) must equal `array_length(weekdays)`.

**Failure states:** Stock-guard rejection surfaces a friendly warning, not a
raw Postgres error.

**Side effects:** Mutates `products.stock` on dispatch/return; writes
`delivery_items` snapshot rows (product name + price at time of
materialization, immune to later product price changes).

**Permissions:** Any org member can create/read/update schedules and
occurrences; **only an owner can soft-delete (archive) a schedule**
(`delivery_schedules` UPDATE-to-`deleted_at` policy is owner-gated).

**Routes:** `/deliveries` (single page, tab/modal-based: Deliveries queue
default, Schedules/History as modals per 005's redesign — the 004 PRD's
"two tabs" description is superseded by 005's queue+modals shape, see note
below).

**DB entities:** `public.delivery_schedules`, `public.deliveries`,
`public.delivery_schedule_items`, `public.delivery_items`,
`public.v_current_deliveries` (view).

**Source files:** `src/features/deliveries/**` (largest module in the repo
by file count — see directory listing; notably
`deliveries.transitions.ts` for the pure `resolveStatusTransition` function,
`deliveries.recurrence.ts` for `dueDatesFor`, `deliveries.pagination.ts` for
`applyLimitPlusOne`).

**Related spec:** `docs/specs/004-deliveries-module/prd.md` (original
design, **partially superseded**), `docs/specs/005-deliveries-module-continuation/prd.md`
(current authoritative behavior — reversible statuses, stock deduction,
current-queue view, Stop/Resume), `docs/specs/005-deliveries-module-continuation/adr-0003-delivery-status-stock-and-revert.md`,
`docs/specs/010-rebuild-ui-ux-deliveries-module/context.md` (UI rebuild pass).

**Implementation status:** Implemented — **Confirmed** (extensive
services/hooks/components/tests present matching the 005 design). Note per
005's own PRD: "only issue 003 (one-time create + flat list) exists" was the
state *before* 005 landed — **the current repo state (post-005, per file
inventory) appears to have the full queue/history/schedule-list/stock
feature set built**, but this pass did not execute the app to confirm every
UI affordance renders — **requires validation** if precise UI behavior
matters (e.g., exact tab vs. modal layout).

**Note on "container pickup/return" workflow:** No distinct container
deposit/pickup/return tracking (e.g., a container-on-loan ledger) was found
as its own workflow — container-type products (5-gallon jugs, etc.) are
modeled as ordinary catalog products/delivery line items, not a separate
pickup/return domain object. **Confirmed absence** —
Evidence: no `container` table/feature found in `docs/DATABASE.md`,
`CONTEXT.md`, or `src/features/*`.

---

## 6. Maintenance Scheduling & Completion

**Actors:** Owner, Staff — shared org queue; only owner can archive a
schedule.

**Trigger:** Navigating to `/maintenances`.

**Preconditions:** Registered session; org membership; org has at least one
other `public.users` row to populate the assignee picker (else falls back
to "Unassigned").

**Main flow (create):**
1. User picks equipment (fixed list + "Others", which then requires
   `equipment_other` free text) and a recurrence: `one_time` (calendar
   pop-up, multiple dates selectable), `everyday`, or `weekly` (Once/Twice/
   Thrice = 1–3 selected weekdays, `times_per_week` must equal the weekday
   count).
2. Submitting creates one `maintenance_schedules` row + occurrence(s): one
   `maintenance_tasks` row per chosen date for `one_time`; a single
   `pending` occurrence at the start date for `everyday`/`weekly`.
3. Assignee picker lists only `public.users` in the caller's org (+
   "Unassigned"); stored per-occurrence so it can change per task.

**Main flow (complete / roll forward):**
4. Completing a one-time occurrence marks it Completed; when all of a
   one-time schedule's occurrences are done, the schedule's derived status
   reads "completed".
5. Completing a recurring (`everyday`/`weekly`) occurrence stamps
   `completed_at`/`completed_by` and creates exactly one new `pending`
   occurrence at the next due date (idempotent — completing twice does not
   duplicate `(schedule_id, due_date)`).

**Main flow (status/visibility):**
6. Card menu can set a schedule active/inactive (`is_active`); inactive
   schedules' occurrences are hidden from the list unless "Show inactive"
   is toggled (then shown, de-emphasized).
7. Owner-only: archive a schedule (`deleted_at`); staff attempt is
   RLS-rejected (and the action should be hidden client-side too).

**Alternative flows:** "Others" equipment with a blank description is
rejected. A weekly schedule requesting "Twice" but selecting 1 or 3
weekdays is rejected with a field error.

**Validation rules:** `equipment_other` required iff equipment = "Others";
`times_per_week` must equal `array_length(weekdays)`; one-time date
selection must be non-empty.

**Due-date label rules** (overrides the original HTML mockup, per
REQUIREMENTS R15): "Overdue Nd" (past), "Due today", "Tomorrow" (+1),
"In N days" only for +2/+3, otherwise the formatted date only for +4 or more.

**Failure states:** Friendly error on create/update failure; submit button
disabled while pending.

**Side effects:** None outside the two maintenance tables (no stock/product
interaction).

**Notifications:** Assigning/reassigning a task (`maintenance_tasks` INSERT,
or UPDATE OF `assigned_to`) fires a `SECURITY DEFINER` trigger
(`create_maintenance_notification()`) that inserts a row into
`public.notifications` targeted at the new assignee — this is the **only**
notification event source wired as of this pass.

**Permissions:** Shared org queue for schedules/tasks; owner-only archive.

**Routes:** `/maintenances`.

**DB entities:** `public.maintenance_schedules`, `public.maintenance_tasks`.

**Source files:** `src/features/maintenance/**`
(`maintenance.recurrence.ts`, `maintenance.view.ts` for due-label/derived
status logic, `multi-date-calendar.tsx` for the one-time multi-date picker).

**Related spec:** `docs/specs/008-build-maintenance-module/description.md`,
`docs/specs/008-build-maintenance-module/REQUIREMENTS.md`,
`docs/specs/008-build-maintenance-module/ACCEPTANCE.md`,
`docs/adr/0006-maintenance-roll-forward-occurrences.md`.

**Implementation status:** Implemented — **Confirmed** (full
components/hooks/services present; `maintenance.test.ts` exists though the
per-unit test file naming here diverges from the `tests/` subfolder
convention used by customers/products/expenses/deliveries — **minor
inconsistency, not a functional concern**).

---

## 7. Document Upload & Management

**Actors:** Owner (sees/approves all org documents), Staff (uploads;
visibility-scoped).

**Trigger:** Navigating to `/documents`.

**Preconditions:** Registered session; org membership.

**Main flow:**
1. User opens "Upload document" dialog: picks/drops an image (PNG/JPG/WEBP/
   GIF, client-side only, max 2MB per UI copy), fills title (required),
   description, category (required, fixed set: Business Permits, Tax & BIR
   Documents, Water Quality Tests, Sanitary & Health, Sales & Customer
   Receipts, Expenses & Supplier, Equipment & Maintenance, Delivery &
   Vehicle, Employee Documents, Other), document type (free text,
   category-dependent options), optional document date/amount/expiry date,
   and a visibility toggle (`all` vs. `only_me`).
2. Submitting **saves only the metadata row** — `org_id`/`created_by`
   resolved from Clerk session — no file bytes are ever sent to storage.
3. Owner can mark a document `is_approved = true` via
   `use-approve-document.ts`. Default is unreviewed (`false`).
4. Edit/soft-delete via dialogs, same pattern as other modules.

**Alternative flows:** `only_me` visibility hides the row from other staff
in the same org, but **owners always see all documents regardless of
visibility**.

**Validation rules:** Title required; category required (from fixed enum);
document type validated at form level only (not DB-enforced); amount/dates
optional.

**Failure states:** Standard friendly-error pattern (implied by consistency
with other modules — **inferred**, not separately re-verified this pass).

**Side effects:** None — no actual file storage side effect exists yet (see
Known Constraints in the overview doc).

**Permissions:** Visibility flag controls staff-to-staff read scope; owner
bypasses it; approval is owner-only in intent (**the `is_approved` mutation
hook exists in the file tree but this pass did not verify an RLS/UI
owner-only gate on it — requires validation**).

**Routes:** `/documents`.

**DB entities:** `public.documents` (schema captured in
`docs/specs/009-build-documents-module/documents_table_migration.sql`, not
yet cross-referenced into `docs/DATABASE.md`'s policy tables as of this
pass — **requires validation**: `docs/DATABASE.md` has no `public.documents`
section at all).

**Source files:** `src/features/documents/**`.

**Related spec:** `docs/specs/009-build-documents-module/description.md`.

**Implementation status:** Partial — **Confirmed**. Metadata CRUD, category/
visibility/approval logic implemented; actual file upload to storage
explicitly excluded from spec 009 and not present in code (see the
`ponytail` comment in `upload-document-dialog.tsx`).

---

## 8. Real-Time Notifications (Bell)

**Actors:** Any authenticated org member (personal, per-recipient).

**Trigger:** Any DB event from a wired trigger (currently: maintenance task
assignment); app is open (live) or the user opens the bell dropdown
(fetch-on-demand).

**Preconditions:** Registered session; `NotificationProvider` mounted in
`src/app/(protected)/layout.tsx`.

**Main flow:**
1. On mount, provider fetches latest 30 notifications
   (`ORDER BY created_at DESC LIMIT 30`) for the current user and subscribes
   to Postgres Changes (`INSERT`/`UPDATE`) filtered
   `recipient_id=eq.<clerkUserId>`.
2. A wired module (currently only maintenance-assignment) inserts a row via
   a `SECURITY DEFINER` trigger — the client never inserts.
3. New INSERT while the app is open → prepended to the in-memory list and
   surfaced via the existing toast component (not a new toast system).
4. Clicking a notification optimistically sets `is_read = true`, persists a
   single-column UPDATE (only `is_read` is grantable — column-level GRANT,
   not a policy, enforces this), and routes by `type` (e.g. `maintenance` →
   `/maintenances`; unknown type → no navigation).
5. "Mark all as read" issues one bulk UPDATE
   `WHERE recipient_id = sub AND is_read = false`.

**Alternative flows:** If the Supabase Realtime socket does not inherit the
Clerk token, RLS silently drops every event (documented as the single
highest-risk failure mode of this feature — see overview doc's Known
Constraints).

**Validation rules:** N/A (client never writes rows other than `is_read`).

**Failure states:** No error UI documented beyond default loading state; a
silent-zero-notifications failure mode is explicitly flagged as a risk to
verify at runtime, not something this documentation pass re-verified.

**Side effects:** None beyond `is_read` flips.

**Permissions:** Strict per-recipient RLS (`recipient_id = jwt.sub`); no
INSERT policy at all for authenticated clients.

**Routes:** Bell UI lives in the shared header (`src/components/layout/app-header.tsx`), not a dedicated route; clicking routes to the source module's page.

**DB entities:** `public.notifications`.

**Source files:** `src/features/notifications/**`.

**Related spec:** `docs/specs/013-realtime-notifications-features/context.md`,
`docs/adr/0010-notifications-trigger-authored-consume-only.md`.

**Implementation status:** Implemented (transport layer + UI) — **Confirmed**
by file inventory (`notifications-provider.tsx`, `use-notifications-realtime.ts`,
`notification-bell.tsx`). Only one event-producing trigger
(`create_maintenance_notification`) is confirmed wired; other modules
(deliveries, documents, expenses) have **no notification trigger** as of
this pass — **Confirmed absence**, since 013's spec explicitly frames itself
as "plumbing only," with each module responsible for wiring its own trigger
separately, and only maintenance's was called out as "already-deployed."

---

## 9. AquaFlow AI Assistant (Chat)

**Actors:** Owner only (staff cannot see nav item, route redirects away,
RLS rejects even direct calls).

**Trigger:** Navigating to `/ai-assistant`.

**Preconditions:** Registered session; `sessionClaims.is_owner === true`.

**Main flow:**
1. Sidebar conversation list loads the owner's own conversations only
   (never another owner/staff account's, even in the same org).
2. New/empty conversation shows a row of ready-made prompt cards (5–10
   static entries with a short title + long hidden prompt body, e.g.
   "Analyze my sales").
3. Clicking a prompt card immediately creates a `role=user` message where
   `display_text` = title (shown in the bubble) and `content` = the full
   prompt body (what's actually sent); or the user free-types their own
   message.
4. Send control disables while pending; a typing/thinking indicator shows.
5. Request posts to `src/app/api/aquaflow-ai-mock/route.ts` (env-configurable
   URL, same request/response contract a future real Supabase Edge Function
   would use) with the conversation id, a bounded recent-message-history
   window (`AI_CONTEXT_MESSAGE_LIMIT`, most-recent N, oldest-first), and the
   new message text.
6. Mock endpoint keyword-matches (revenue/stock/deliveries/maintenance/
   expenses/customers) and returns, after an artificial delay,
   `{ content, displayText?, cardType?: 'insight'|'flag'|'ranked', cardData? }`.
7. Assistant message renders as plain text, or as one of three card types
   (insight = metric label/value/trend; flag = title/subtitle/colored
   badge; ranked = rank/name/value/share list).
8. Full message history stays scrollable/readable in the UI even though
   only the bounded recent window is sent as AI context.
9. User can delete a conversation (hard delete, cascades to its messages).

**Alternative flows:** Staff session hitting `/ai-assistant` directly →
server-side redirect (independent of the nav-hide). Direct Supabase call
from a non-owner or cross-org session → RLS rejects on both tables.

**Validation rules:** Zod validates the send-message input and the mock
response shape (valid `cardType`+`cardData` combinations).

**Failure states:** Not deeply specified beyond loading/typing/error/empty
states listed as manual-verification items — **requires validation** for
exact error-state UI copy.

**Side effects:** Writes `ai_conversations`/`ai_messages` rows only; **no
real business-data read** occurs (mock is fully canned) — anything it
"analyzes" is not actually pulled from the org's deliveries/stock/expenses.

**Permissions:** Three-layer gate (nav hide, route redirect, RLS) — see ADR
0008. All ops require `is_owner` claim even at the RLS layer.

**Routes:** `/ai-assistant`.

**DB entities:** `public.ai_conversations`, `public.ai_messages`.

**Source files:** `src/features/aquaflow-ai/**`,
`src/app/api/aquaflow-ai-mock/route.ts`.

**Related spec:** `docs/specs/011-aquaflow-ai-feature/prd.md`,
`docs/adr/0007-ai-chat-history-personal-not-shared.md`,
`docs/adr/0008-owner-only-route-level-gating.md`.

**Implementation status:** Implemented (UI + persistence + mock endpoint)
— **Confirmed** by file inventory including a full `tests/` folder and the
mock route's own test. **Explicitly not implemented:** real LLM/business-
data querying — this is a deliberate, documented scope boundary, not a gap.

---

## 10. Product Sales / Sales Reporting

**Status: Planned only, effectively unbuilt.**

`/sales` route exists but renders only a static heading ("Sales") with no
data, form, or feature module behind it. There is no `src/features/sales`
directory, no PRD/spec folder for sales, and `CONTEXT.md` explicitly lists
"Orders," "Payments," "Reports" (which would presumably include sales
reporting) under "Planned modules" that **must not** be treated as approved
implementation scope absent a spec. **Confirmed** —
Evidence:
- `src/app/(protected)/sales/page.tsx` (full file content is an empty heading section)
- `CONTEXT.md` ("Planned modules: Orders, Payments, Inventory, Reports, Settings, Team/Staff Management")

No workflow detail can be documented because none exists yet. Any agent
asked to "build sales" should treat this as new-feature work requiring a
spec folder under `docs/specs/`, not an extension of an existing module.

---

## Cross-Cutting Notes for Future Workflow Work

- Every implemented module follows the same 12-file feature-folder shape
  documented in full in `docs/CODEBASE.md` (types/schema/constants/mapper/
  guards/keys/services/hooks/components/index.ts/tests) — use it as the
  template for any new workflow, including a hypothetical Sales module.
- Every workflow's identity fields (`org_id`, `created_by`, and any
  `delivered_by`/`assigned_to`/`completed_by`-style actor stamps) are
  resolved server-side from the Clerk session and never accepted from form
  input — true across all nine implemented workflows above without
  exception in the specs reviewed.
- Soft-delete (`deleted_at`) is universal for archival across every module
  with a delete/archive action, except `ai_conversations` (hard-deleted by
  design, ADR 0007) and `public.notifications` (no delete/dismiss at all in
  v1).
