# Product Overview — AquaFlow (Water Refilling Station Management System)

> Written for AI coding agents picking up this repo cold. Labels on every
> non-trivial claim: **Confirmed** (directly stated in a spec/doc/code),
> **Inferred** (reasonably derived but not stated outright), **Unknown**
> (no evidence found), **Potentially outdated** (spec text contradicted by
> later docs/code), **Requires validation** (should be checked against the
> live system before being relied on).
>
> See [02-user-workflows.md](./02-user-workflows.md) for step-by-step flows,
> and `docs/CODEBASE.md` for the file-level module blueprint.

## Product Purpose

AquaFlow is a multi-tenant SaaS dashboard for small **water refilling
station** businesses (purified/mineral water refill shops with delivery
operations in the Philippines context). It replaces paper/spreadsheet
tracking of customers, product/refill catalogs, deliveries, expenses, and
equipment maintenance with a single web app. **Confirmed** —
Evidence:
- `CLAUDE.md` ("Project Context")
- `docs/specs/012-privacy-policy-and-terms-condition/context.md`

## Problem Being Solved

Station owners/staff currently track recurring refill customers, delivery
runs, product stock, expenses, and equipment upkeep manually ("on paper or
memory"), causing lost records of failed deliveries, no link between
deliveries/products/prices over time, and no single view of business health.
**Confirmed** —
Evidence:
- `docs/specs/004-deliveries-module/prd.md` ("Problem")
- `docs/specs/011-aquaflow-ai-feature/prd.md` ("Problem Statement")

## Target Users / Business Context

Small-to-medium water refilling station businesses — purified water,
mineral water, and water delivery operations. Likely Philippines-based
(peso currency symbol `₱` in Documents UI, Republic Act 10173 / National
Privacy Commission referenced for legal pages, "barangay/municipality/
province" address fields). **Inferred** (currency symbol, address schema,
legal references) / **Confirmed** (RA 10173 reference) —
Evidence:
- `docs/specs/012-privacy-policy-and-terms-condition/context.md` ("Republic Act No. 10173")
- `docs/DATABASE.md` (`customers` table: `barangay`, `municipality`, `province`)
- `src/features/documents/components/upload-document-dialog.tsx` (₱ symbol)

## User Roles

Two roles only, both scoped to one organization ("water station") per user:

| Role | Confirmed capabilities |
|---|---|
| **Owner** | Dashboard, customers, staff/team, products, orders, deliveries, payments, expenses, revenue/sales reports, AquaFlow AI assistant, owner-only actions (archiving delivery/maintenance schedules, approving documents, updating any org product). |
| **Staff** | Assigned deliveries, customer records (if allowed), products (create; edit/delete only what they created), order status updates, maintenance tasks. Cannot access owner-only financial summaries or AquaFlow AI. |

Evidence:
- `CLAUDE.md` ("The app has two main roles")
- `CONTEXT.md` ("User Roles")
- `docs/adr/0008-owner-only-route-level-gating.md`

There is no formal Team/Staff *management* module yet (inviting/removing
staff, assigning roles) beyond the join-by-organization-code flow at
registration. **Confirmed as planned, not built** —
Evidence:
- `CONTEXT.md` ("Planned modules: ... Team/Staff Management")

## Primary Use Cases (with implementation status — see workflows doc for detail)

| Use case | Status |
|---|---|
| Record and manage customers | Implemented |
| Manage product/service catalog (stock-tracked vs. non-stock/service) | Implemented |
| Record business expenses with category/payment-method filters and summary cards | Implemented |
| Plan and run one-time and recurring deliveries; track pending→for_delivery→completed/failed lifecycle; stock deduction on dispatch | Implemented |
| Schedule and complete recurring/one-time equipment maintenance tasks | Implemented |
| Upload/manage business documents (permits, receipts, certificates) with metadata | Partial — metadata only, no actual file storage upload wired yet |
| Real-time per-user notifications (bell) | Implemented (transport layer); only one event source (maintenance assignment) wired |
| Owner-only AquaFlow AI chat assistant for business Q&A | Implemented UI/persistence, but backed by a **mock** canned-response endpoint, not a real LLM |
| Sales tracking / sales reports | Planned only — route exists as an empty placeholder page, no feature module |
| Orders, Payments, Inventory (as distinct modules), Reports, Settings | Planned only — no spec, no code |

Evidence:
- `src/app/(protected)/sales/page.tsx` (placeholder content only)
- `CONTEXT.md` ("Core Modules")
- `src/features/documents/components/upload-document-dialog.tsx` (`ponytail` comment: "file is selected client-side only — storage upload isn't wired yet")
- `docs/specs/011-aquaflow-ai-feature/prd.md` ("Out of Scope: Real LLM integration")

## Value Proposition

A single tenant-scoped operations dashboard purpose-built for water-refill
station workflows (refill services vs. stock items, delivery status
lifecycle, container/product-price snapshotting, maintenance upkeep),
rather than a generic CRUD admin panel. **Confirmed (stated design intent)** —
Evidence:
- `CLAUDE.md` ("Do not treat this as a generic CRUD dashboard")

## Business Model

No pricing, billing, or subscription code, tables, or specs found.
`docs/specs/012-privacy-policy-and-terms-condition/context.md` describes the
app as "a free medium-sized SaaS-style business tool," but this is legal-page
framing, not a documented monetization model. **Unknown** (whether/how the
product will charge) —
Evidence:
- `docs/specs/012-privacy-policy-and-terms-condition/context.md` ("free medium-sized SaaS-style business tool")

## Key Business Rules

- **Multi-tenancy**: every organization-owned row carries `org_id`; RLS is
  the enforced isolation boundary, never just UI hiding. **Confirmed** —
  Evidence: `CLAUDE.md`, `docs/CONSTITUTION.md` (#3, #12, #13), `docs/DATABASE.md`.
- **Identity is never client-supplied**: `org_id`/`created_by` always derive
  from the Clerk session (JWT claims), never from form fields. **Confirmed** —
  Evidence: `docs/ARCHITECTURE.md` ("Auth Flow"), `docs/DATABASE.md` (every table section).
- **Soft delete vocabulary**: `deleted_at` = "archived" (hard removal from
  active views); this is **distinct** from operational on/off toggles like
  `is_active` (customers/maintenance schedules) or `is_active` (products,
  meaning "discontinued"). Conflating these is explicitly called out as a
  modeling mistake to avoid. **Confirmed** —
  Evidence: `CONTEXT.md` ("Record Status Vocabulary"), `docs/adr/0005-record-status-distinct-from-archive.md`.
- **Products split into two kinds**: stock-tracked (physical, counted
  inventory — bottled water, caps, containers, accessories) vs.
  non-stock-tracked (refill/service/fee items — refill service, delivery
  fee, cleaning fee) via `products.is_stock_tracked`, not a separate "type"
  column. **Confirmed** —
  Evidence: `CONTEXT.md` ("Important Product Rule"), `docs/specs/002-products/prd.md`.
- **Staff vs. owner product permissions**: staff can create products and
  edit/delete only what they created; owners can edit/delete any org
  product regardless of creator. **Confirmed** —
  Evidence: `CONTEXT.md` ("User Roles"), `docs/DATABASE.md` (`public.products` policies).
- **Deliveries are a shared org queue** (any member can act on any
  occurrence/schedule) except archiving a schedule, which is owner-only.
  Same shared-queue pattern for maintenance. **Confirmed** —
  Evidence: `docs/DATABASE.md` ("Deliveries are a shared org queue...").
- **AquaFlow AI is the one deliberate exception**: conversations are
  personal-per-user (not shared even within the same org) and the entire
  module is owner-only at nav, route, and RLS layers. **Confirmed** —
  Evidence: `docs/adr/0007-ai-chat-history-personal-not-shared.md`, `docs/adr/0008-owner-only-route-level-gating.md`.
- **Notifications are consume-only from the client**: all rows are written
  by `SECURITY DEFINER` DB triggers; the client only reads and flips
  `is_read`. **Confirmed** —
  Evidence: `docs/adr/0010-notifications-trigger-authored-consume-only.md`.
- **Stock movement**: a delivery's stock-tracked items are deducted from
  `products.stock` exactly while status is `for_delivery` or `completed`;
  leaving that window restores stock; negative stock is blocked. **Confirmed** —
  Evidence: `docs/specs/005-deliveries-module-continuation/adr-0003-delivery-status-stock-and-revert.md`, `CONTEXT.md` ("Stock-out window").
- **Legal responsibility split**: AquaFlow is the data *controller* for
  account data (owner/staff), but only a *processor* for customer records a
  station enters — the station itself is the controller of its customers'
  data. **Confirmed** —
  Evidence: `CONTEXT.md` ("Legal & Privacy"), `docs/adr/0009-legal-consent-via-clerk.md`.

## Domain Terminology

See the full glossary table at the end of this file for a compact index;
`CONTEXT.md` is the canonical, most detailed source and should be read in
full before naming anything in these domains.

## Product Boundaries

### Included (implemented or actively specced)
Authentication/onboarding, Customers, Products, Expenses, Deliveries,
Maintenance, Documents (metadata only), Notifications (transport +
maintenance event), AquaFlow AI (mock-backed), legal pages (Privacy
Policy/Terms). **Confirmed** — Evidence: `CONTEXT.md` ("Core Modules").

### Explicitly excluded / deferred from current specs
- Sales, Orders, Payments, Inventory (as a distinct module beyond product
  stock counts), Reports, Settings, Team/Staff management — all "Planned
  modules," not approved implementation scope. **Confirmed** —
  Evidence: `CONTEXT.md` ("Planned modules").
- Real file storage for Documents uploads (explicitly out of scope for spec
  009; a later spec is expected to add it). **Confirmed** —
  Evidence: `docs/specs/009-build-documents-module/description.md` ("EXCLUDES file upload implementation").
- Real LLM/business-data querying for AquaFlow AI (mock endpoint only,
  designed so the contract doesn't change when swapped for real). **Confirmed** —
  Evidence: `docs/specs/011-aquaflow-ai-feature/prd.md` ("Out of Scope").
- Delivery schedule editing and owner-only schedule archive UI, a
  `stock_movements` audit ledger, numbered/total-count pagination — deferred
  from feature 005. **Confirmed** —
  Evidence: `docs/specs/005-deliveries-module-continuation/prd.md` ("Out of Scope").
- Notification dismissal/clearing, pruning/retention, per-row deep-link
  column, Broadcast realtime transport — deferred from feature 013. **Confirmed** —
  Evidence: `docs/specs/013-realtime-notifications-features/context.md` ("Deferred").
- Customer search/filter beyond basics, import/export, segmentation/tagging,
  balance/invoicing/payment history, restore-from-archive flow — out of
  scope for feature 001. **Confirmed** —
  Evidence: `docs/specs/001-customers-basic-feature/prd.md` ("Out of Scope").

## Current Product Maturity

Actively developed, feature-by-feature spec-driven build with 13 numbered
spec folders (000–013) so far, each generally including a migration SQL/
markdown file for hand-applied Supabase changes (**no `supabase/migrations`
folder / migration tooling exists in this repo** — every migration is a
manual dashboard-applied SQL file living inside its spec folder).
**Confirmed** —
Evidence:
- `docs/specs/004-deliveries-module/004-deliveries-schema.md`, `docs/specs/008-build-maintenance-module/maintenance_migration.md`, `docs/specs/011-aquaflow-ai-feature/011-aquaflow-ai-schema.sql`, `docs/specs/013-realtime-notifications-features/013-notifications.sql`
- `docs/DATABASE.md` ("Migration to run in the Supabase dashboard (no `supabase/` folder in repo)")

Recent git history (per session context) shows active work on maintenance
notifications, dark mode/sidebar polish, legal pages, and registration
form/date logic — consistent with 013 being the most recently completed
numbered spec. **Inferred** —
Evidence: git log (`8f6e06e add notification features to maintenance`, etc., provided in session context, not re-verified here).

## Known Constraints

- No `supabase/` migrations folder; all schema changes are manual, HITL
  (human-in-the-loop) SQL applied via the Supabase dashboard, with the SQL
  committed to the spec folder for audit. **Confirmed** — Evidence: `docs/DATABASE.md`.
- Realtime notifications depend on the Supabase JS client correctly
  forwarding the Clerk-issued token to the Realtime socket; the spec calls
  this out as the single highest-risk, silently-failing integration point
  in the notifications feature and demands runtime verification. **Confirmed
  (documented risk, verification status of the *fix* itself not
  re-confirmed by this pass)** — Evidence: `docs/specs/013-realtime-notifications-features/context.md` ("HIGHEST-RISK ITEM").
- `docs/DATABASE.md` documents two different conventions for `org_id` across
  tables in the codebase's history: an integer FK to
  `organizations(organization_code)` (customers/products/expenses/
  deliveries/maintenance/AI) vs. a `uuid` FK to `organizations(id)`
  (notifications, per ADR 0009, and the auth session claim per `CONTEXT.md`
  "Authentication & Onboarding"). This suggests an in-flight migration of
  the org identity model that agents should **not** assume is fully
  reconciled across every table without checking the live schema.
  **Requires validation** —
  Evidence: `docs/DATABASE.md` (`public.customers`: "org_id integer (fk) → organizations(organization_code)"; `public.notifications`: "org_id uuid (fk) → organizations(id)"), `docs/adr/0009-org-id-is-organizations-uuid.md`, `CONTEXT.md` ("Authentication & Onboarding" — "Historically this claim was a numeric/invite-code value... it is now the org uuid").
- The earliest customer spec documents (`docs/specs/001-customers-basic-feature/REQUIREMENTS.md`, `ACCEPTANCE.md`) describe a `tenant_id`/`public.tenants` schema with `id UUID` primary keys, which contradicts the actual documented `public.customers` schema in `docs/DATABASE.md` (`org_id integer`, `id serial`). The PRD for the same feature explicitly flags this exact mismatch. **Potentially outdated (superseded spec content, kept for history)** —
  Evidence: `docs/specs/001-customers-basic-feature/REQUIREMENTS.md`, `docs/specs/001-customers-basic-feature/prd.md` ("Data Model Notes" — "The spec currently says `created_by` is a Clerk user ID, but the schema shown in the requirements uses an integer foreign key...").
- Documents module: file **metadata** is saved, but there is no storage
  bucket or file-path column wired — an uploaded image only exists as a
  client-side object URL and is never actually persisted. Building anything
  that assumes a retrievable document file today would be building on a gap.
  **Confirmed** — Evidence: `src/features/documents/components/upload-document-dialog.tsx` (`ponytail` comment), `src/features/documents/documents.types.ts` (no file-path/storage field on `Document`/`DocumentInsert`).
- AquaFlow AI has no real business-data grounding yet — any "insight" it
  currently produces is canned/keyword-matched, not computed from the
  org's actual deliveries/stock/expenses. **Confirmed** —
  Evidence: `docs/specs/011-aquaflow-ai-feature/prd.md` ("Out of Scope: Real business-data querying").

## KPIs / Metrics Documented in Specs

No product-level/company KPIs are documented (e.g., no growth, retention, or
revenue targets found). Only **in-app UI metric cards** are specified per
module:
- Expenses: total expenses, this-month total, largest category, recent
  (last 7 days) count — all computed from active (non-archived) rows only.
  **Confirmed** — Evidence: `docs/specs/003-expenses/prd.md`.
- Deliveries: Active (today's pending), Pending (backlog, previous 7 days),
  Completed (today) — all "today"-scoped, bounded head-count queries.
  **Confirmed** — Evidence: `docs/specs/005-deliveries-module-continuation/prd.md`.

## Open Product Questions

(Flagged here per instructions — not answered, for aggregation into a
separate open-questions doc.)

- Is the `org_id` type/FK-target inconsistency across tables (integer vs.
  uuid) intentional and mid-migration, or a documentation drift that needs
  reconciling in `docs/DATABASE.md` and/or the live schema?
- Is there an actual monetization/business model, or is "free" in the legal
  copy a placeholder pending a future pricing decision?
- Is there a plan (spec number, timeline) for the deferred Sales/Orders/
  Payments/Inventory/Reports/Settings/Team modules, or are they aspirational
  placeholders only?
- Is a real file-storage backend for Documents planned as its own spec, and
  is there a target date/spec number?
- Is there a plan to replace the AquaFlow AI mock endpoint with a real
  Gemini-backed Supabase Edge Function, and what real business data will it
  be allowed to read (all modules? owner-only subset?)?

---

## Glossary

| Term | Meaning | Evidence | Confidence |
|---|---|---|---|
| Organization / Water station | The tenant boundary; one business running the app. Stable id = `organizations.id` (uuid); human-facing `organization_code` used by staff to join. | `CONTEXT.md` ("Authentication & Onboarding") | Confirmed |
| Owner | Role that creates/owns a station (`is_owner = true`); full org-wide access incl. financials and AquaFlow AI. | `CLAUDE.md`, `CONTEXT.md` | Confirmed |
| Staff | Role that joins an existing station via organization code; day-to-day operational access, no financial summaries or AI. | `CLAUDE.md`, `CONTEXT.md` | Confirmed |
| Stock-tracked product | Physical, quantity-counted item (bottled water, caps, containers, dispensers, accessories). | `CONTEXT.md` ("Important Product Rule") | Confirmed |
| Non-stock-tracked product | Refill/service/fee item with no counted quantity (water refill service, delivery fee, cleaning fee). | `CONTEXT.md` | Confirmed |
| Delivery Schedule | The plan/recurrence rule for serving a customer (one-time or recurring); has `active/paused/ended` status, not an operational delivery status. | `CONTEXT.md` ("Deliveries Domain") | Confirmed |
| Delivery (occurrence) | A single dated delivery run with its own status lifecycle `pending → for_delivery → completed/failed`. | `CONTEXT.md` | Confirmed |
| Current delivery queue | Actionable working set: overdue/due-today occurrences + each active schedule's next upcoming occurrence. | `CONTEXT.md` | Confirmed |
| Delivery History | Terminal (`completed`/`failed`) occurrences shown in a read-only modal (revert is the only mutation). | `CONTEXT.md` | Confirmed |
| Stop / Resume | Pausing/reactivating a recurring delivery schedule; Stop soft-deletes today+future pending rows, Resume continues from the original anchor without back-filling. | `CONTEXT.md` | Confirmed |
| Stock-out window | The delivery statuses (`for_delivery`, `completed`) during which stock is considered "out" and deducted. | `CONTEXT.md`, ADR 0003 | Confirmed |
| Maintenance Schedule | The plan for an equipment upkeep task (one-time/everyday/weekly); user sets it inactive, not deleted. | `CONTEXT.md` ("Maintenance Domain") | Confirmed |
| Maintenance Task | A single dated occurrence of a maintenance schedule; recurring schedules keep exactly one pending task that rolls forward on completion. | `CONTEXT.md`, ADR 0006 | Confirmed |
| Active / Inactive (customer) | Operationally served vs. paused, independent of archive (`deleted_at`). | `CONTEXT.md` ("Record Status Vocabulary") | Confirmed |
| Active / Discontinued (product) | Still offered vs. retired from catalog, independent of archive. | `CONTEXT.md` | Confirmed |
| Archived | Soft-deleted via `deleted_at`; excluded entirely from active-list RLS-filtered reads. | `CONTEXT.md`, ADR 0005 | Confirmed |
| Document | A business file (permit, receipt, certificate, test result, etc.) with metadata; visibility `all`/`only_me`; owners always see everything. | `CONTEXT.md` ("Documents Domain") | Confirmed |
| AquaFlow AI | Owner-only chat assistant for business insights; currently mock-answered. | `CONTEXT.md` ("AquaFlow AI Domain") | Confirmed |
| Conversation / Message (AI) | A personal (not shared-org) chat thread and its turns; three optional structured card types (insight/flag/ranked). | `CONTEXT.md` | Confirmed |
| Ready-made prompt | A pre-written business question with a short displayed title and a longer hidden prompt body actually sent to the assistant. | `CONTEXT.md` | Confirmed |
| Notification | Personal, per-user, trigger-authored real-time message; not an org broadcast; client is consume-only (read + mark-read). | `CONTEXT.md` ("Notifications Domain") | Confirmed |
| Notification `type` | Free-form category string (not a DB enum, not a severity), e.g. `maintenance`, `info`. | `CONTEXT.md` | Confirmed |
| Session claims | Clerk JWT custom claims (`organization`, `is_owner`, `name`, `email`) sourced from `public_metadata`. | `CONTEXT.md` ("Authentication & Onboarding") | Confirmed |
| Registered | `sessionClaims.organization != null && sessionClaims.is_owner != null`; gates every protected route via middleware. | `CONTEXT.md`, `src/proxy.ts` | Confirmed |
