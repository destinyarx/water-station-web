# Feature Map

> Companion to [`03-specification-status.md`](./03-specification-status.md) (spec
> traceability), [`05-codebase-map.md`](./05-codebase-map.md) (file-structure
> conventions and shared layer), [`06-technical-architecture.md`](./06-technical-architecture.md)
> (runtime architecture), and [`07-data-architecture.md`](./07-data-architecture.md)
> (schema detail — table/column/RLS specifics are not repeated here). Labels used
> on every non-trivial claim: **Confirmed** / **Inferred** / **Unknown** /
> **Potentially outdated** / **Requires validation**.
>
> File-level detail below was verified by opening `src/features/[feature]/`
> directly (not guessed from spec docs). Where a spec claims something the code
> does not do, that gap is called out in the feature's "Known limitations".

## Feature Inventory

| Feature | User roles | UI entry point | Core files | Server/API files | Database entities | External services | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Customers | Owner, Staff (own tenant) | `/customers` (`src/app/(protected)/customers/page.tsx`) | `customers.schema.ts`, `.types.ts`, `.constants.ts`, `.keys.ts`, `.mapper.ts`, `.guards.ts`, `components/*` (table, form, 3 dialogs), `hooks/*` (6 hooks) | `services/customers.service.ts` | `public.customers` | Clerk (identity), Supabase (DB+RLS) | **Implemented** |
| Products | Owner, Staff (creator or owner override) | `/products` | `products.schema.ts`, `.types.ts`, `.constants.ts`, `.keys.ts`, `.mapper.ts`, `.guards.ts`, `components/*`, `hooks/*` (7 hooks incl. `use-product-actor.ts`, `use-product-owner.ts`) | `services/products.service.ts` | `public.products` | Clerk, Supabase | **Implemented** |
| Expenses | Owner, Staff (own tenant) | `/expenses` | `expenses.schema.ts`, `.types.ts`, `.constants.ts`, `.keys.ts`, `.mapper.ts`, `.summary.ts` (dashboard cards), `.ui-meta.ts` (enum labels), `components/*`, `hooks/*` (5 hooks) | `services/expenses.service.ts` | `public.expenses` (+ `expense_category`, `payment_method` enums) | Clerk, Supabase | **Implemented** |
| Deliveries | Owner, Staff (shared org queue; archive is owner-only) | `/deliveries` | `deliveries.schema.ts`, `.types.ts`, `.constants.ts`, `.keys.ts`, `.mapper.ts`, `.pagination.ts`, `.recurrence.ts`, `.schedule-view.ts`, `.transitions.ts`, `components/*` (11 files), `hooks/*` (12 hooks) | `services/*` (10 service files: deliveries, delivery-counts, delivery-edit, delivery-history, delivery-materialize, delivery-queue, delivery-schedule, delivery-schedule-admin, delivery-schedule-list, delivery-status) | `public.delivery_schedules`, `public.deliveries`, `public.delivery_schedule_items`, `public.delivery_items`, `public.delivery_schedule_dates` (feature 010 custom-dates model — see RLS note below) | Clerk, Supabase | **Implemented** (largest, most-evolved module — 3 spec generations, see `03-specification-status.md`) |
| Maintenance | Owner, Staff (shared org queue; archive is owner-only) | `/maintenances` | `maintenance.schema.ts`, `.types.ts`, `.constants.ts`, `.keys.ts`, `.mapper.ts`, `.recurrence.ts`, `.view.ts`, `.guards.ts`, `components/*` (9 files incl. `multi-date-calendar.tsx`), `hooks/*` (8 hooks) | `services/maintenance.service.ts` | `public.maintenance_schedules`, `public.maintenance_tasks` | Clerk, Supabase | **Implemented** |
| Documents | Owner (sees all), Staff (own + `visibility=all`) | `/documents` | `documents.schema.ts`, `.types.ts`, `.constants.ts`, `.keys.ts`, `.mapper.ts`, `components/*` (6 files), `hooks/*` (6 hooks) | `services/documents.service.ts` | `public.documents` (**not documented in `docs/DATABASE.md`** — see gap below) | Clerk, Supabase | **Implemented** (metadata-only by design; no real file upload/storage — see limitations) |
| Notifications | Owner, Staff (personal, per-recipient) | Bell icon in `AppShell` header (all protected pages) | `notifications.schema.ts`, `.types.ts`, `.constants.ts`, `.keys.ts`, `.mapper.ts`, `components/notification-bell.tsx`, `components/notifications-provider.tsx`, `hooks/use-notifications.ts`, `hooks/use-notifications-realtime.ts` | `services/notifications.service.ts` | `public.notifications` (rows written only by `SECURITY DEFINER` triggers) | Clerk, Supabase (DB + Realtime/Postgres Changes) | **Implemented** (single trigger source today: maintenance assignment) |
| AquaFlow AI | Owner only (route + nav + RLS gated) | `/ai-assistant` | `aquaflow-ai.schema.ts`, `.types.ts`, `.constants.ts`, `.keys.ts`, `.mapper.ts`, `.guards.ts`, `components/*` (6 files), `hooks/*` (5 hooks) | `services/aquaflow-ai.service.ts`, `src/app/api/aquaflow-ai-mock/route.ts` | `ai_conversations`, `ai_messages` | Clerk, Supabase — **no real LLM provider wired** (see limitations) | **Partially implemented** (UI/data layer real; AI responses are a keyword-matched mock endpoint) |
| Registration / Onboarding | New Clerk users (pre-org) | `/complete-registration` | `registration.schema.ts`, `.types.ts`, `.constants.ts`, `.mapper.ts`, `.guards.ts`, `components/complete-registration-form.tsx`, `hooks/use-complete-registration.ts` | `services/registration.service.ts` (axios → 2 Supabase Edge Functions) | Writes `organizations`, `organization_members`, `users` rows (via Edge Functions, not client) + Clerk `public_metadata` | Clerk, Supabase Edge Functions (`create-aquaflow-organization`, `aquaflow-add-staff`) | **Implemented** |
| Legal (Privacy/Terms) | Public (signed-in or not) | `/privacy-policy`, `/terms-and-conditions` | `src/features/legal/` (`legal.ts`, `legal-markdown.tsx`, `legal-page-shell.tsx`, `legal-top-bar.tsx`) + `src/content/legal/*.md` | none (static markdown read server-side) | none (consent lives on the Clerk user, not Supabase — ADR 0009) | Clerk (sign-up legal-consent checkbox, Dashboard-configured) | **Implemented** |
| Dashboard | Owner, Staff | `/dashboard` | `src/app/(protected)/dashboard/page.tsx` renders `<DashboardPreview>` | — | — | — | **Not implemented as a real feature** — see limitations |
| Sales | (no nav entry; orphaned route) | `/sales` | `src/app/(protected)/sales/page.tsx` (heading only, ~10 lines) | — | — | — | **Stub / placeholder**, no spec |
| Landing (public marketing) | Signed-out visitors | `/` | `src/features/landing/components/*` (8 components), `hooks/use-reveal-on-scroll.ts` | — | — | — | **Implemented** |
| Playground | Internal dev-only (not customer-facing) | `/playground` | `src/features/playground/` (`playground.schema.ts`, `components/send-email-card.tsx`, `hooks/use-send-smooth-handler-email.ts`) | `services/playground.service.ts` | — | Email-sending test endpoint | **Implemented (internal tool)** — not a product feature |

---

## Customers

**What it does.** CRUD for customer profiles (name, business flag, contact,
address/geo fields) scoped to the current organization, with soft-delete
archive and a separate `is_active`/inactive toggle. **Confirmed** —
Evidence:
```markdown
- `src/features/customers/customers.schema.ts`
- `src/features/customers/hooks/use-set-customer-status.ts`
```

**Business rules.**
- `org_id`/`created_by` are derived server-side from the resolved Clerk
  identity (`use-customer-owner.ts`), never from form input. **Confirmed**.
- Archive (`deleted_at`) is distinct from `is_active` (inactive-but-listed) —
  ADR 0005. **Confirmed**.
- Edit is blocked once archived (`canEditCustomer` in `customers.guards.ts`
  returns `false` when `deletedAt !== null`). **Confirmed** — Evidence:
```markdown
- `src/features/customers/customers.guards.ts`
```

**Authorization.** Any org member may create/edit/archive any customer in
their org — there is no per-record creator restriction documented for
customers (unlike products). **Inferred** from the absence of an
owner-vs-creator branch in `customers.guards.ts`; **Requires validation**
against the live RLS policy text in `docs/DATABASE.md` (UPDATE policy there
says `created_by = jwt.sub`, which would actually restrict edits to the
creator — this is a discrepancy between the guard file and the documented
policy worth checking at the DB level).

**Known limitations.**
- The original PRD (`docs/specs/001-customers-basic-feature/prd.md`) and the
  file literally named `ACCEPTANCE.md` in that folder describe an **outdated
  schema** (UUID pk, `tenant_id → tenants(id)`, integer `created_by`) that
  does not match the implemented schema (serial pk, `org_id → organizations`,
  varchar `created_by → users(clerk_id)`). **Confirmed — Potentially
  outdated** spec content; do not use that schema block as a reference. See
  `03-specification-status.md`.
- `docs/DATABASE.md` documents a legacy hard-`DELETE` RLS policy on
  `customers` that "must not be used by normal UI flows" — dead/dangerous
  policy surface still present at the DB level per the docs. **Requires
  validation** (docs say it exists; not independently re-verified against
  live Supabase here).
- No restore-from-archive flow (explicitly out of scope per PRD).

**Tests.** `src/features/customers/tests/` — 10 files (schema, mapper, guards,
keys, service create/update/archive, form values, mutation-dialog hook).
**Confirmed**.

**Spec.** `docs/specs/001-customers-basic-feature/`

---

## Products

**What it does.** CRUD for the product/service catalog (stock-tracked vs.
non-stock-tracked items), organization-scoped, with `is_active`
(active/discontinued) and `deleted_at` (archive) as independent states.
**Confirmed** — Evidence:
```markdown
- `src/features/products/products.schema.ts`
- `src/features/products/products.guards.ts`
```

**Business rules.**
- Staff may update/soft-delete only products they created; owners may
  update/soft-delete any org product. Enforced in code by
  `canManageProduct()`: `actor.isOwner || product.createdBy === actor.userId`.
  **Confirmed** — this is the one module where the owner-override rule is
  explicit in a guard file, matching `CONTEXT.md`'s role rules verbatim.
- `is_stock_tracked = false` forces `stock` to `0` and displays "Not
  tracked". **Confirmed** per `products.schema.ts`/`products.mapper.ts`
  (not independently re-read line-by-line in this pass, but corroborated by
  `docs/DATABASE.md`'s column notes).

**Authorization.** Owner-override read via `use-product-owner.ts` +
`use-product-actor.ts` (two separate hooks — one resolves identity, one
resolves actor-permission shape passed to `canManageProduct`). **Confirmed**.

**Known limitations.** None found that contradict the spec; this module's
spec (`002-products/description.md`) and implementation appear closely
aligned (unlike customers' outdated PRD).

**Tests.** `src/features/products/tests/` — 5 files (guards, keys, mapper,
schema, service). **Confirmed**.

**Spec.** `docs/specs/002-products/`

---

## Expenses

**What it does.** CRUD for operating-expense records with category/payment-method
enums (each with an `other` + free-text escape hatch), search, category/payment
filters, and four summary cards (total, this-month, largest-category, recent-7-day
count) computed from active (non-deleted) rows only. **Confirmed** — Evidence:
```markdown
- `src/features/expenses/expenses.summary.ts`
- `src/features/expenses/services/expenses.service.ts`
```

**Business rules.**
- Default sort: `date_incurred` descending. Summary cards ignore soft-deleted
  rows (`.is('deleted_at', null)` in the service). **Confirmed**.
- `category_other`/`payment_method_other` required only when the matching
  enum value is `'other'` — spec requirement, corroborated by the schema file
  naming (`expenses.schema.ts`) and the DESCRIPTION.md validation section.

**Authorization.** Standard org-scoped shared read/write; no owner-vs-creator
split described in the spec or found in the feature (unlike products).
**Inferred** — no `expenses.guards.ts` file exists in the feature (confirmed
by directory listing), meaning permission logic, if any beyond RLS, is not
factored into a guard module the way customers/products/maintenance do it.

**Known limitations.**
- `docs/specs/003-expenses/ACCEPTANCE.md` and `REQUIREMENTS.md` are both
  **empty (1 line)** — all acceptance/requirement content actually lives in
  `prd.md` and `DESCRIPTION.md` instead. **Confirmed**. No formal
  checklist exists to mark criteria as verified for this module.
- Vendor name and receipt URL are explicitly out of scope (schema doesn't
  have the columns).

**Tests.** `src/features/expenses/tests/` — 4 files (schema, mapper, service,
summary). **Confirmed**.

**Spec.** `docs/specs/003-expenses/`

---

## Deliveries

**What it does.** The largest module: manages both one-time and recurring
refill/delivery schedules for customers or guests, materializes dated
occurrences on a rolling basis, and tracks each occurrence through a status
lifecycle with stock effects. **Confirmed** — Evidence:
```markdown
- `docs/adr/0002-deliveries-two-entity-rolling-materialization.md`
- `src/features/deliveries/deliveries.transitions.ts`
```

**Business rules (evolved across 3 spec generations — see
`03-specification-status.md` for the full lineage).**
- Two-entity model: `delivery_schedules` (plan) + `deliveries` (dated
  occurrence), with snapshot `delivery_items` preserving product name/price at
  materialization time (ADR 0002).
- Status lifecycle `pending → for_delivery → completed/failed`, plus a later
  addition of `cancelled` (from `pending`/`for_delivery` only).
- **Correction to an earlier draft of this document:** spec `005` (ADR 0003)
  added **reversible terminal states** (`completed`/`failed` revert back to
  `pending`/`for_delivery`), which at the time superseded spec `004`'s
  original "terminal, no revert" acceptance criteria (A-15/A-16 in
  `004/ACCEPTANCE.md`). However, **reading `src/features/deliveries/deliveries.transitions.ts`
  directly shows `completed: []` and `failed: []` in the current
  `LEGAL_NEXT` table — none of ADR 0003's five revert edges exist in the code
  today.** Revert is **not currently implemented**, despite `DeliveryStatusMenu`
  and `delivery-history-dialog.tsx` still wiring an `onReverted` callback (a
  dead code path — `legalNextStatuses('completed')` returns `[]`, so the menu
  has nothing to render). No ADR documents this regression from 005's
  reversible design. **Confirmed by direct code read — treat "revert from
  history" as broken/removed, not working**, until a future agent either
  restores it or writes an ADR amendment retiring it on purpose. See
  `03-specification-status.md` for the full unresolved-decision writeup.
- Editing an occurrence's items/notes/date is allowed only while `pending`.
- Feature `010` replaced the split "New Schedule" / "New Delivery" creation UX
  with one unified form, added a real `assigned_to` staff picker
  (distinct from `delivered_by`, the audit-stamp field), and introduced
  `custom_dates` as a new non-recurring recurrence type (multiple hand-picked
  dates sharing one schedule, replacing `one_time` as the primary creation
  path while keeping `one_time` readable for backward compatibility).
  **Confirmed** in `deliveries.types.ts` (`recurrence_type: 'one_time' |
  'custom_dates'`, plus weekly/monthly types elsewhere) and by the presence
  of `assigned_to` fields across schedule/occurrence types.
- Materialization horizon: rolling 14 days, client-triggered, idempotent on
  `(schedule_id, delivery_date)`.
- **Monthly recurrence is schema-present but not generator-wired.**
  `deliveries.recurrence.ts`'s `dueDatesFor()` hard-returns `[]` for any
  `recurrenceType` other than `'weekly'` (confirmed by direct code read,
  with an inline comment acknowledging "monthly can join later"). The
  `day_of_month`/`interval_months` columns and types still exist, which
  could mislead an agent into thinking monthly schedules materialize
  occurrences — they never do today. **Confirmed — contradicts
  `004-deliveries-module/ACCEPTANCE.md` A-07.**

**Authorization.** Shared org queue — any member can operate on any
occurrence/schedule regardless of creator; only schedule **archive** is
owner-only (`docs/DATABASE.md`, corroborated by `deliveries.guards`-equivalent
logic in the schedule-admin service). **Confirmed** per `docs/DATABASE.md`.

**Known limitations.**
- This is the module with the most spec churn; anyone reading
  `docs/specs/004-deliveries-module/` alone will get an incomplete/partially
  superseded picture. Always cross-reference `005` and `010` before trusting
  `004`'s ACCEPTANCE.md line-items.
- **`public.delivery_schedule_dates` (added by feature 010) uses a different
  RLS identity pattern than every other table in the schema.** Per
  `07-data-architecture.md`, its policy is written against a
  `public.users`/`org_id` join keyed on `auth.uid()`, whereas every other
  organization-owned table in this app (customers, products, expenses, the
  other three delivery tables, maintenance, documents, notifications,
  aquaflow-ai) authorizes via `auth.jwt() ->> 'sub'` / the Clerk-claims
  pattern (ADR 003/0009). **Requires validation** — confirm whether this
  migration was actually applied as-written and whether `auth.uid()`
  resolves correctly given this app's Clerk-JWT-forwarding setup; if not
  reconciled, this table could silently fail open or closed. This is an
  **unresolved decision**, not a confirmed bug.
- `docs/specs/010-.../next-dev.err.log` and `next-dev.log` are dev server log
  files accidentally left in the spec folder — not documentation, safe to
  ignore/clean up.

**Tests.** `src/features/deliveries/tests/` — 16 files, the most thorough
coverage in the repo (mapper, pagination, recurrence, schedule-view, schema,
service, transitions, plus one test file per service module). **Confirmed**.

**Spec.** `docs/specs/004-deliveries-module/`,
`docs/specs/005-deliveries-module-continuation/`,
`docs/specs/010-rebuild-ui-ux-deliveries-module/`

---

## Maintenance

**What it does.** Manages equipment upkeep schedules (one-time hand-picked
dates, everyday, or weekly on 1-3 chosen weekdays) and their dated task
occurrences, using a **roll-forward** model instead of deliveries' rolling
materialization — a recurring schedule keeps exactly one `pending` occurrence
that advances to the next due date on completion (ADR 0006). **Confirmed**.

**Business rules.**
- `equipment = 'Others'` requires `equipment_other` to be filled (DB CHECK
  constraint per `docs/DATABASE.md` and the migration doc).
- `times_per_week` must equal `array_length(weekdays, 1)` for weekly
  schedules (DB CHECK).
- Assignee (`assigned_to`) must be a real org staff member (or unassigned) —
  scoped via `hooks/use-org-users.ts`, not free text.
- Schedule status is derived, not stored independently for recurring
  schedules: *active*/*inactive* via `is_active`; *completed* only applies to
  `one_time` schedules once all occurrences are done.

**Authorization.** Shared org queue; archive is owner-only —
`canArchiveSchedule(isOwner)` in `maintenance.guards.ts` returns `isOwner`
directly. **Confirmed** — Evidence:
```markdown
- `src/features/maintenance/maintenance.guards.ts`
```

**Known limitations.**
- Test file is `src/features/maintenance/maintenance.test.ts` at the feature
  root, **not** inside a `tests/` subfolder — this deviates from
  `docs/TESTING.md`'s explicit placement rule and from every sibling module's
  convention (customers/products/expenses/deliveries/aquaflow-ai all use
  `tests/`). **Confirmed** by directory listing.
- Only one test file total, versus multiple per-concern files in
  deliveries/customers — thinner automated coverage relative to the module's
  complexity (recurrence + roll-forward logic).

**Tests.** `src/features/maintenance/maintenance.test.ts` (single file, root
placement — see limitation above).

**Spec.** `docs/specs/008-build-maintenance-module/`

---

## Documents

**What it does.** Business-file **metadata** management (permits, tax docs,
water-quality tests, receipts, etc.) with category enum, free-text document
type, owner-approval flag, and per-document visibility (`all` vs `only_me`,
with owners always seeing everything). **Confirmed** — Evidence:
```markdown
- `src/features/documents/documents.schema.ts`
- `src/features/documents/components/visibility-toggle.tsx`
```

**Business rules.**
- The module is **deliberately metadata-only** — the spec explicitly says not
  to implement Supabase Storage upload in this pass; a comment in
  `upload-document-dialog.tsx` confirms the file field is client-side-only
  with no storage bucket wired yet. This is a scoped exclusion, not a bug.
- `is_approved` is a single boolean review flag, not a multi-step workflow.
- Soft delete via `deleted_at`, same pattern as every other module.

**Authorization.** Owners always see all documents in the org regardless of
`visibility`; staff only see `all`-visibility documents plus their own
`only_me` documents. **Confirmed** per `CONTEXT.md` domain glossary and the
migration's RLS policy.

**Known limitations.**
- **`public.documents` is entirely absent from `docs/DATABASE.md`** — no
  column table, no RLS policy table, nothing — despite the feature being
  fully implemented with an authoritative migration
  (`docs/specs/009-build-documents-module/documents_table_migration.sql`).
  This violates `docs/SECURITY.md`'s own rule that "every policy must be
  documented in `docs/DATABASE.md`". **Confirmed — documentation gap**,
  flagged in `03-specification-status.md` as an action item.
- **No automated tests at all** — `src/features/documents/tests/` does not
  exist. **Confirmed**.
- Real file upload/storage is future work (see business rules above).

**Tests.** None. **Confirmed** (no `tests/` directory).

**Spec.** `docs/specs/009-build-documents-module/`

---

## Notifications

**What it does.** Personal, real-time, per-recipient notifications (bell icon
in the app header) delivered by `SECURITY DEFINER` database triggers — the
client never inserts a notification, and can only flip `is_read` (enforced by
a column-level `GRANT`, not an RLS policy, since RLS can't diff old-vs-new
columns). **Confirmed** — ADR 0010, `docs/DATABASE.md`.

**Business rules.**
- `type` is a free-form category string, not a DB enum or a severity —
  extensible without a migration.
- Realtime transport is Supabase **Postgres Changes** (not Broadcast),
  filtered client-side by `recipient_id=eq.<clerkId>`; the RLS SELECT policy
  is the actual security boundary on the stream, the filter is only a
  bandwidth optimization.
- Only one trigger source exists today: maintenance task assignment. The
  architecture supports more (deliveries, etc.) but none are wired yet.

**Authorization.** `recipient_id = jwt.sub AND private.is_org_member(org_id)`
for SELECT; no INSERT policy at all for authenticated clients. **Confirmed**.

**Known limitations.**
- **No automated tests** — `src/features/notifications/tests/` does not
  exist. **Confirmed**.
- The Realtime auth path (Supabase's `accessToken` option carrying the Clerk
  token to the Realtime connection) is a **runtime-only** correctness
  concern — a code comment in the realtime hook acknowledges this was
  deliberately not double-guarded with manual `setAuth()`. **Requires
  validation** against the live environment; static analysis cannot confirm
  tokens actually reach the Realtime socket in production.
- Unread count is derived from a capped fetch (documented as undercounting
  past a threshold in a code comment) — a known, accepted limitation, not a
  bug to silently "fix" without revisiting the fetch limit.

**Tests.** None. **Confirmed**.

**Spec.** `docs/specs/013-realtime-notifications-features/`

---

## AquaFlow AI

**What it does.** An owner-only chat assistant for business-insight questions
(revenue, stock, deliveries, maintenance, expenses, customers), with
ready-made prompt cards (short title shown in the chat bubble, long
prompt-engineered body actually sent) and three structured response card
types (`insight`, `flag`, `ranked`) in addition to plain text. **Confirmed**.

**Business rules / authorization.** First whole-page, three-layer,
owner-only-gated route in the codebase (ADR 0008): nav item hidden for staff
in `app-sidebar.tsx`, the route itself redirects non-owners
(`canAccessAquaflowAi()` check in the page), and RLS independently requires
the `is_owner` claim on both `ai_conversations`/`ai_messages` — so even a
direct Supabase call from a staff session is rejected. Conversations are
personal-per-user, not a shared org queue (ADR 0007, a deliberate deviation
from every other module's shared-queue pattern). **Confirmed**.

**Dependencies / important implementation note.** **There is no real LLM
integration.** `src/app/api/aquaflow-ai-mock/route.ts` keyword-matches the
user's message against revenue/stock/delivery/maintenance/expense/customer
topics and returns a canned structured reply after an artificial delay. A
grep across `src/` for `anthropic`/`openai`/`gemini`/`ANTHROPIC_API_KEY`/
`OPENAI_API_KEY` returns no hits outside this mock route. The endpoint URL is
read from `NEXT_PUBLIC_SUPABASE_EDGE_AQUAFLOW_AI_URL` and falls back to the
mock path, so swapping in a real AI backend (Supabase Edge Function calling
an actual model) is an environment-variable change plus a new edge function —
not a code rewrite. **Confirmed** — this matches the feature's own PRD, which
explicitly scopes real LLM integration as out-of-scope for this pass; it is
a deliberate phased build, not an oversight.

**Known limitations.**
- Message history is fully retained (no pruning), but the context sent to the
  mock/future-AI backend is capped at a constant (`AI_CONTEXT_MESSAGE_LIMIT`,
  documented as 20 in `docs/DATABASE.md`).
- No restore/undo for deleted conversations (hard delete, cascades to
  messages).

**Tests.** `src/features/aquaflow-ai/tests/` — 4 files (guards, mapper,
schema, service). **Confirmed**.

**Spec.** `docs/specs/011-aquaflow-ai-feature/`

---

## Registration / Onboarding

**What it does.** Post-sign-up gate: a Clerk user must submit
`/complete-registration` (owner creates a station; staff joins one by
organization code) before any protected route is reachable. **Confirmed** —
`src/proxy.ts`, ADR 0001.

**Business rules.**
- "Registered" = `sessionClaims.organization != null && sessionClaims.is_owner
  != null` — a single predicate (`isRegistered()`) reused by middleware and
  the client hook.
- Owner submission calls the `create-aquaflow-organization` edge function;
  staff submission calls `aquaflow-add-staff` — **two** edge functions, each
  writing `organization` (an `organizations.id` **uuid**, per ADR 0009 — not
  the older invite-code-as-claim design) and `is_owner` into Clerk
  `public_metadata`. **Confirmed** — Evidence:
```markdown
- `src/features/registration/registration.constants.ts` (`CREATE_ORG_EDGE_URL`, `ADD_STAFF_EDGE_URL`)
- `src/features/registration/services/registration.service.ts`
```
- After a successful submit, the client force-refreshes the Clerk token
  (`getToken({ skipCache: true })`) and hard-navigates, so middleware re-reads
  fresh claims instead of a stale cached token.

**Known limitations.**
- `docs/specs/000-auth_workflow/PLAN.md` describes an **older, superseded**
  design: a single edge function (`update-clerk-session-tokens`), the
  `organization` claim as a raw invite code, and gender/phone-number fields —
  none of which match the current implementation or `CONTEXT.md`'s current
  Authentication & Onboarding section. **Confirmed — Potentially outdated**;
  treat `CONTEXT.md` and ADR 0009 as authoritative over `PLAN.md`. See
  `03-specification-status.md`.
- The three registration test files
  (`registration.guards.test.ts`, `registration.mapper.test.ts`,
  `registration.schema.test.ts`) sit directly beside their source files at
  the feature root, **not** inside `registration/tests/` — a deviation from
  `docs/TESTING.md`'s placement rule. **Confirmed**.

**Tests.** 3 files, feature-root placement (see limitation above).

**Spec.** `docs/specs/000-auth_workflow/`

---

## Legal (Privacy Policy / Terms & Conditions)

**What it does.** Publicly accessible static legal pages, rendered from
markdown content files, plus sign-up-time consent captured entirely by
Clerk's built-in legal-consent checkbox — **not** stored in Supabase.
**Confirmed** — ADR 0014 (`0014-legal-consent-via-clerk.md`;
there are two independent ADRs both numbered `0009` in this repo — see
`03-specification-status.md`).

**Business rules.**
- AquaFlow is the data **controller** for account data (owner/staff
  identity), but only the **processor** for customer records a station
  enters — this is why the customer form has no customer-facing consent
  notice.
- `src/proxy.ts` explicitly short-circuits legal routes before any auth
  check, so both pages are reachable signed-in or signed-out.

**Known limitations.**
- The spec's literal required BDD error string ("Please agree to the Terms
  and Conditions and acknowledge the Privacy Policy before continuing.") is
  **not** implemented — Clerk's own consent-checkbox wording is used
  instead, and the checkbox itself is enabled in the **Clerk Dashboard**, not
  in this repo's code. This is a documented, deliberate trade-off (ADR 0009),
  not a bug to "fix" by adding a custom checkbox.
- No consent audit table/history — if versioned consent tracking is ever
  needed, ADR 0009 says this decision must be explicitly revisited.

**Tests.** None found in `src/features/legal/`.

**Spec.** `docs/specs/012-privacy-policy-and-terms-condition/`

---

## Dashboard (gap worth flagging)

**What it does today.** `src/app/(protected)/dashboard/page.tsx` renders
`<DashboardPreview />` — the **same marketing mockup component** used on the
public landing page (`src/features/landing/components/dashboard-preview.tsx`)
to advertise the product to signed-out visitors. It is static illustrative
markup (hardcoded fake numbers/icons), not a data-driven widget fetching real
customers/deliveries/stock/expense figures. **Confirmed** by reading both
files — Evidence:
```markdown
- `src/app/(protected)/dashboard/page.tsx`
- `src/features/landing/components/dashboard-preview.tsx`
```

**Why this matters.** `CONTEXT.md` lists "dashboard" as one of the Owner's
manageable areas, and the sidebar has a working nav link to it, so an agent
or reviewer could reasonably assume it's a real feature. It is currently a
placeholder reusing marketing collateral. No spec folder exists for a real
authenticated dashboard. This is the single largest "implemented nav item,
unimplemented feature" gap in the app — see `03-specification-status.md`.

---

## Sales (stub, no spec)

`src/app/(protected)/sales/page.tsx` is a ~10-line page rendering only a page
heading ("Sales"). It has **no nav entry** in `app-sidebar.tsx` (orphaned
route — reachable only by direct URL), **no `src/features/sales/` folder**,
and **no spec folder** under `docs/specs/`. `CONTEXT.md` mentions "sales
reports" as an Owner capability and lists "Reports" among planned modules,
but never names a dedicated Sales module as in-scope. **Confirmed** — this is
scaffolding left over from an early route list, not a tracked feature.

---

## Landing (public marketing page)

Public, signed-out marketing page at `/`, composed from
`src/features/landing/components/` (navbar, hero, problem section, features,
dashboard preview, CTA band, FAQ accordion, footer) plus a scroll-reveal hook.
Originally built to `docs/specs/000-auth_workflow/landing-page-ui-ux.md`,
visually redone under spec `006`'s design system. **Implemented**. No
dedicated tests found.

---

## Playground (internal dev tool)

`src/features/playground/` is a single-purpose internal utility (send a test
email via a Supabase-backed handler) with its own schema/service/hook. It is
explicitly **not** a customer-facing feature — ADR 0004 calls it out as the
one surface intentionally left out of the dark-mode rollout, and it has no
entry in `CONTEXT.md`'s module list. Treat it as developer tooling, not
product scope, when planning new work.
