# Frontend & UX

Practical frontend map for AI agents. For the full design token/system spec,
see `docs/DESIGN.md` (not duplicated here — this file summarizes and links).
For the repo-wide file map, see
[`05-codebase-map.md`](./05-codebase-map.md). For risk analysis of the
patterns described below, see
[`10-security-and-risks.md`](./10-security-and-risks.md).

Root: `C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\water-station-web`

---

## 1. Route map

All routes discovered under `src/app`. **Confirmed** by reading each
`page.tsx`/`layout.tsx` listed.

| Route | Purpose | Roles | Main component | Data dependencies | Mobile relevance |
|---|---|---|---|---|---|
| `/` | Public marketing landing page | Public (unauthenticated + authenticated both see it — see §9 open question in `05-codebase-map.md` on whether `/` is actually gated) | `src/features/landing/*` sections composed in `src/app/page.tsx` | None (static marketing copy) | Landing-only responsive sections; not part of the app shell |
| `/sign-in/[[...sign-in]]` | Clerk sign-in | Public | Clerk `<SignIn/>` widget, themed via `authAppearance()` | Clerk | Renders inside `AuthShell`, full-screen, no sidebar |
| `/sign-up/[[...sign-up]]` | Clerk sign-up (incl. legal consent checkbox, ADR 0009) | Public | Clerk `<SignUp/>` widget | Clerk | Same `AuthShell` |
| `/complete-registration` | Post-signup onboarding form (owner creates station / staff enters invite code) | Authenticated, not-yet-registered | `CompleteRegistrationForm` (`src/features/registration`) inside `AuthShell` | Two Supabase edge functions (`CREATE_ORG_EDGE_URL`, `ADD_STAFF_EDGE_URL`) via `axios`, not the Supabase SDK | `AuthShell` layout, dark-mode themed (task 010) |
| `/privacy-policy` | Static legal page, always public | Public (even signed out) | `LegalPageShell` + `readLegalDoc('privacy-policy')` (`src/features/legal`) | Static markdown in `src/content/legal` | Simple content page |
| `/terms-and-conditions` | Static legal page, always public | Public | Same `LegalPageShell` pattern | Static markdown | Simple content page |
| `/dashboard` | App home after login | Owner + Staff | **`DashboardPreview`** — reused directly from `src/features/landing`, the same "mock dashboard" component shown on the marketing page | **None** — static/illustrative content, not wired to Supabase. **Confirmed** by reading `src/app/(protected)/dashboard/page.tsx` (`return <DashboardPreview />`, no data hooks). Treat the real dashboard as **not yet built**. | N/A (static) |
| `/customers` | Customer directory: CRUD, active/inactive status, archive | Owner + Staff (staff limited to records they created for edit/archive per RLS; see `docs/DATABASE.md`) | `CustomersPage` (`src/features/customers`) — reference/blueprint module | `useCustomers` (TanStack Query) → `customers.service.ts` → Supabase | Fixed-width CSS-grid table (`minWidth: 820px`), horizontal-scroll on narrow viewports, not a responsive card-list fallback |
| `/products` | Product/service catalog: refill vs stocked items, discontinue toggle | Owner + Staff | `ProductsPage` (`src/features/products`) | `useProducts` → Supabase | Card grid (`repeat(auto-fill,minmax(236px,1fr))`) — this one *does* reflow responsively, unlike the table-based modules |
| `/deliveries` | Delivery schedules + dated occurrences, rolling materialization | Owner + Staff (schedule archive is owner-only, ADR + `docs/DATABASE.md`) | `DeliveriesPage` (`src/features/deliveries`) | `useDeliveries`, materialization service → Supabase | Fixed-width grid table, horizontal scroll |
| `/maintenances` | Maintenance schedules + tasks, roll-forward recurrence | Owner + Staff (schedule archive owner-only) | `MaintenancePage` (`src/features/maintenance`) | `useMaintenanceSchedules`/tasks → Supabase | Flat card list (`maxWidth:1000px`), narrower single-column — reflows better than the grid-table modules |
| `/documents` | File/document registry with expiry & visibility (all-staff / just-me) | Owner + Staff (`only_me` docs hidden from other staff, see `document-row-actions.tsx` `is_owner` check) | `DocumentsPage` (`src/features/documents`) | `useDocuments` → Supabase; no actual file upload wired yet per DESIGN.md ("Drop zone... placeholder — no upload logic yet") | Widest fixed layout (`maxWidth:1200px`), 6-column CSS-grid table, horizontal scroll |
| `/expenses` | Expense tracking | Owner + Staff | `ExpensesPage` (`src/features/expenses`) | `useExpenses` → Supabase | Table + stat-card row pattern (reference for `StatCard`) |
| `/sales` | **Stub placeholder** — renders a bare `<h1>Sales</h1>`, no feature module | Whoever can reach it (no guard beyond registration) | Inline JSX in `src/app/(protected)/sales/page.tsx` | None | N/A — unbuilt |
| `/ai-assistant` | AquaFlow AI chat assistant (business insight Q&A) | **Owner-only**, server-enforced (ADR 0008) | `AquaflowAiPage` (`src/features/aquaflow-ai`) | `ai_conversations`/`ai_messages` tables (owner-only RLS) + mock reply endpoint `POST /api/aquaflow-ai-mock` | Two-pane chat shell (fixed 264px sidebar + flex message pane) — no evidence of a mobile/off-canvas variant |
| `/playground` | Internal dev/test tool — triggers a "Smooth Handler" Supabase edge function to send email | Any authenticated + registered user (no role gate, not in sidebar nav, but not excluded from the route matcher either) | `SendEmailCard` (`src/features/playground`) | Edge function via `axios` | Not designed for mobile; likely not meant for any end user — see security doc |

Route protection mechanics (proxy/middleware, registration gating, owner-only
gating) are covered in `05-codebase-map.md` §3 and §13 and in
[`10-security-and-risks.md`](./10-security-and-risks.md) — not repeated here.

---

## 2. Layout structure

- **Root layout** (`src/app/layout.tsx`): loads Poppins via `next/font/google`,
  injects an inline pre-paint script that reads `localStorage.aqua-theme` and
  toggles the `dark` class before first paint (avoids a flash of wrong theme),
  wraps everything in `Providers` (`ClerkProvider` → `QueryClientProvider` →
  children → `<Toaster />`).
- **`(auth)` layout** (`src/app/(auth)/layout.tsx`): wraps sign-in/sign-up in
  `AuthShell` — a full-screen ocean-gradient background (`OceanBackdrop`) with
  no sidebar/header. `complete-registration` (outside both route groups) reuses
  the same `AuthShell` directly rather than through a layout file.
- **`(protected)` layout** (`src/app/(protected)/layout.tsx`): wraps children
  in `NotificationsProvider` (mounts the realtime notification subscription
  once) then `AppShell`. `AppShell` (`src/components/layout/app-shell.tsx`) is
  the canonical app frame:

  ```
  <div style="display:flex; height:100vh; overflow:hidden">
    <AppSidebar />          /* sticky, flex-none, 252px/78px */
    <div style="flex:1; display:flex; flex-direction:column">
      <AppHeader />         /* 62px */
      <main style="flex:1; overflow-y:auto">
        {children}
      </main>
    </div>
  </div>
  ```

  Full spec in `docs/DESIGN.md` → Layout. Every protected `page.tsx` is a thin
  wrapper (`export const dynamic = 'force-dynamic'` + render the feature's
  `*Page` component) — no business logic lives in route files, per
  `docs/ARCHITECTURE.md`.

---

## 3. Navigation (sidebar)

`src/components/layout/app-sidebar.tsx` — a hard-coded `NAV_ITEMS` array (no
CMS/config-driven nav), one entry per module: Dashboard, Customers, Products,
Deliveries, Maintenance, Documents, Expenses, and AI Assistant (`ownerOnly:
true`, carries a `New` badge). **Notably absent from nav**: Sales (stub) and
Playground (dev tool) — both reachable only by typing the URL directly.

Role-based filtering: `navItems.filter((item) => !item.ownerOnly ||
isOwner)`, where `isOwner` comes from `canAccessAquaflowAi(sessionClaims)`
(`src/features/aquaflow-ai/aquaflow-ai.guards.ts`) reading the Clerk
`is_owner` claim via `useAuth()`. This is a **client-side UX convenience
only** — per ADR 0008, the real security boundary for owner-only routes is
the server-side page guard + RLS, not the nav hide. Sidebar also renders a
collapse/expand toggle (state in `src/stores/sidebar-store.ts`, width
`252px` ↔ `78px`, `transition: width 0.2s ease`), the station name/user
name/role line, and Clerk's `<UserButton />`.

`AppHeader` (`src/components/layout/app-header.tsx`) shows a breadcrumb
derived from a hard-coded `ROUTE_LABELS` map keyed by pathname (falls back to
`'AquaFlow'` for unmapped routes — e.g. `/sales`, `/ai-assistant`,
`/playground` all show the fallback label, not their own name), the
notification bell, dark-mode toggle, and `<UserButton />`. `initTheme()` is
called exactly once here (and once more in `LandingNavbar` for the public
site) — `docs/DESIGN.md` explicitly warns against calling it in more than one
place per surface.

---

## 4. Design system

Full spec lives in `docs/DESIGN.md` — token tables (`--lp-*` / `--app-*`),
dark mode scope and mechanism, stat-card shell, dialogs, toast system, and
per-module pattern notes (features 007–011). **Not duplicated here.** Key
points an agent needs before touching UI:

- Two independent token namespaces: `--lp-*` (public landing) and `--app-*`
  (authenticated app interior). Dark mode is scoped only to landing + app
  shell + the modules explicitly listed in DESIGN.md's Dark Mode section
  (customers, products, documents, deliveries, maintenance,
  complete-registration, expenses). **Sign-in/sign-up and `/playground` are
  light-only** — confirmed by DESIGN.md's explicit callout.
- Tailwind v4 CSS-variable shorthand (`bg-(--app-surface)`) is the
  **preferred** styling approach for new/edited code, but the earlier
  redesigned surfaces (landing, sidebar, header, expenses, and most of
  features 007–011) were built with inline `style` props before this guidance
  existed and have not been retrofitted. **A new agent should not assume one
  styling approach from reading a single file** — check which era the file
  belongs to (DESIGN.md's "Styling Approach" section names the exceptions).
- shadcn/ui primitives that actually exist: `button`, `dialog`,
  `dropdown-menu`, `input`, `label`, `table` (`src/components/ui/*`) — a small
  set relative to the number of data-heavy modules (see §8, TanStack Table).

---

## 5. Shared UI components

- `src/components/app/app-modal.tsx` — generic modal shell (overlay + card +
  header badge) underlying every feature create/edit dialog.
- `src/components/app/confirm-dialog.tsx` + `save-confirm-dialog.tsx` +
  `use-submit-confirm.ts` — the shared "review before save" two-step
  confirmation pattern, reused across features (destructive variant for
  archive/delete flows, a non-destructive green variant for e.g. maintenance
  "Complete").
- `src/components/app/toast.tsx` — renders the toast queue (see
  `docs/DESIGN.md` → Toast Notifications). Fire-and-forget, separate from
  `ConfirmDialog` (which blocks on a decision).
- `src/components/layout/*` — `AppShell`, `AppSidebar`, `AppHeader`,
  `AuthShell`, `OceanBackdrop` — chrome only, no business logic.
- `src/components/ui/*` — shadcn primitives listed above.

---

## 6. Forms (React Hook Form + Zod)

Confirmed pattern, consistent across features inspected (customers,
documents, playground, registration): `useForm<T>({ resolver:
zodResolver(schema), defaultValues })`, submit handler calls a mutation hook
(`mutation.mutate(values, { onSuccess, onError })`), submit button disabled
via `mutation.isPending`, inline field errors rendered from
`formState.errors`. Zod schema lives in `<feature>.schema.ts`; form value
types are inferred (`z.infer`), never hand-written — matches
`CLAUDE.md`/`docs/CODING_STANDARDS.md`. Supabase calls are kept out of form
components — they live in the mutation hook → service layer, per
`docs/ARCHITECTURE.md`'s data-flow rule.

`org_id`/`created_by` are never form fields — every create flow resolves
them via a per-feature `use-<feature>-owner.ts` hook reading `useAuth()`
(`userId`, `sessionClaims.organization`), e.g.
`src/features/customers/hooks/use-customer-owner.ts`. **Confirmed**
consistent with `docs/SECURITY.md`'s identity contract.

---

## 7. Loading / error / empty states

**Confirmed by reading actual components**, not assumed from convention:

- `src/features/customers/components/customers-page.tsx` — explicit
  four-way branch: `isPending` → loading UI, `isError` → `ErrorState
  message={error.message}`, `customers.length === 0` → empty state,
  `filtered.length === 0` (search/filter yields nothing) → a distinct
  "no results" state. All four states are handled, not just the happy path.
- `src/features/notifications/hooks/use-notifications.ts` — surfaces
  `loading` from `query.isLoading`; mutation errors call
  `toast.error(error.message)` **and** `query.refetch()` to reconcile state
  after an optimistic patch fails (see §11).
- Service-layer errors are never raw Postgres messages — every
  `<feature>.service.ts` function catches `{ error }` and throws a
  pre-written, user-safe string from `<feature>.constants.ts` (e.g.
  `CUSTOMERS_LOAD_ERROR`). This is consistent across every feature checked.

No blanket claim is made that *every* module follows this exactly (not every
feature's page component was read line-by-line), but the pattern is
consistent everywhere it was checked, and it matches `docs/TESTING.md`'s
explicit manual-verification requirement ("loading, error, empty, and
populated UI states").

---

## 8. Responsive behavior, pagination, and tables — **desktop-first, not confirmed mobile-ready**

This is the most load-bearing finding for a later mobile-handoff doc.

- **Tailwind responsive prefixes (`sm:`/`md:`/`lg:`/`xl:`) appear in only 8
  files** repo-wide (**Confirmed** by grep across `src/**/*.tsx`). The bulk of
  the app (sidebar, header, every data-table module) is built with fixed pixel
  values in inline `style` props — e.g. the sidebar is always `252px` or
  `78px` wide, never off-canvas/hidden on narrow viewports; there is no
  hamburger menu or mobile nav drawer anywhere in the codebase (**Confirmed**,
  no such component found).
- **Table-based modules** (customers, deliveries, expenses, documents) render
  a CSS-grid "table" with an explicit `minWidth` (e.g. `820px` for customers,
  wider for documents) inside an `overflow-x: auto` wrapper — the mitigation
  for narrow screens is **horizontal scrolling**, not a responsive card
  fallback.
- **Card-grid modules** (products: `repeat(auto-fill,minmax(236px,1fr))`) and
  the **maintenance task list** (single-column, `maxWidth:1000px`) *do*
  reflow naturally and would behave reasonably on a narrower viewport, in
  contrast to the table modules.
- **Pagination is client-side array slicing**, not server-side/cursor-based:
  the full active/non-deleted result set is fetched in one query, then
  filtered/sorted/sliced in a `useMemo` in the page component (`PER_PAGE = 6`
  customers / `8` products, per `docs/DESIGN.md`). This is a known,
  documented scaling gap — see `05-codebase-map.md` §6 — not something to
  copy into a new large-dataset module without reconsidering.
- **TanStack Table (`@tanstack/react-table`) is a declared dependency but is
  never actually imported or used anywhere in `src`** (**Confirmed** — zero
  matches for `useReactTable`/`getCoreRowModel`/`tanstack/react-table` imports
  outside `package.json`). Every module's "table" is a hand-rolled CSS-grid of
  `div`s, not the shadcn `Table`/`TanStack Table` primitives, despite
  `CLAUDE.md` stating "Use TanStack Table for every module's data table, not
  just complex ones" as a hard rule. This is a real, current drift between
  documented convention and shipped code — flag it rather than silently
  copying the hand-rolled pattern into a new module, and rather than silently
  introducing real TanStack Table usage that would look inconsistent with
  every sibling module. See `05-codebase-map.md` §9/§20 for the same flag
  from the codebase-map pass.

---

## 9. Accessibility

No dedicated a11y audit was performed (that would require a running browser +
axe/lighthouse pass, out of scope for static inspection). Surface-level
observations: `aria-label` is used on icon-only buttons where checked (e.g.
`AppHeader`'s sidebar-toggle and theme-toggle buttons), and 37 files
repo-wide contain some `aria-*`/`role=` attribute. Dialog/dropdown primitives
come from Radix (`radix-ui` package, which shadcn's `dialog`/`dropdown-menu`
wrap), so focus trapping/`aria-modal` semantics on those specific components
are likely reasonable by default — but this was not independently verified.
Heavy use of inline `style` + raw `<div>` grids for "tables" (§8) means those
surfaces likely lack proper `<table>`/`role="table"`/`role="row"` semantics
for screen readers — **Requires validation** with an actual accessibility
tool before relying on this assessment.

---

## 10. Internationalization

**Confirmed: no i18n library or pattern exists.** No `next-intl`, `i18next`,
`react-intl`, or locale-routing found. The only "locale" hits in the codebase
are `Array.prototype.localeCompare`/`toLocaleDateString`-style calls used for
plain string/date sorting (`deliveries-page.tsx`, `maintenance-page.tsx`),
not translation infrastructure. All UI copy is hard-coded English (with
Philippine-peso `₱` formatting in a few places, e.g. documents/expenses),
consistent with the product being built for Philippine small-business water
stations. Do not assume any translation seam exists when adding copy.

---

## 11. Client state vs. server state

- **Server state**: TanStack Query, exclusively. Every feature has a
  `<feature>.keys.ts` query-key factory (`all` → `lists()`/`list(filters)` →
  `details()`/`detail(id)`, arrays only) matching `CLAUDE.md`'s required
  shape. Query functions live in `services/<feature>.service.ts`; hooks in
  `hooks/use-<feature>.ts`. Global `QueryClient` defaults
  (`src/app/providers.tsx`): `staleTime: 60_000`, `refetchOnWindowFocus:
  false`.
- **Client/UI state**: three module-level pub/sub singletons built on
  `useSyncExternalStore`, **not** the `zustand` package (it is not a
  dependency in `package.json` — **Confirmed**, checked directly):
  `src/stores/sidebar-store.ts`, `theme-store.ts`, `toast-store.ts`, each
  paired with a `use-*.ts` React-facing hook. This is a working, deliberate
  substitute (each file is commented "no external dep needed") but is a real
  discrepancy against `CLAUDE.md`/`docs/ARCHITECTURE.md`'s explicit "Use
  Zustand" instruction — see `05-codebase-map.md` §9 for the same finding.
  When adding new global client/UI state, follow this existing pub/sub
  pattern for consistency rather than introducing the real `zustand` package
  unilaterally (`docs/AI-GUARDRAILS.md` disallows unjustified new
  dependencies).
- **Form state**: local to React Hook Form instances, not global state.
- **Dialog/wizard state**: local `useState` in the owning feature component,
  sometimes with a small adapter hook (e.g. customers'
  `use-mutation-dialog.ts`).

---

## 12. Optimistic updates

Confirmed in two places:

- `src/features/notifications/hooks/use-notifications.ts` — `markOne`/`markAll`
  mutations patch the TanStack Query cache directly in `onMutate` (marking
  `isRead: true` before the server responds), and on `onError` show a toast
  **and** call `query.refetch()` to reconcile if the optimistic patch was
  wrong. Realtime Postgres Changes (see `docs/DATABASE.md` →
  `public.notifications`) also patch the same cache key independently.
  Realtime subscription auth uses the Clerk-forwarded JWT through the same
  Supabase client's `accessToken` option.
  - `src/features/deliveries/services/delivery-status.service.ts` also
  references optimistic-style handling for delivery status transitions
  (not read in full for this pass — **Requires validation** if editing that
  file).

Most other mutations (create/update/archive across customers, products,
etc.) follow the simpler pattern: mutate → `onSuccess` invalidates the
relevant query-key list → TanStack Query refetches — no optimistic cache
write, just an invalidate-and-refetch round trip. This matches
`CLAUDE.md`'s "mutations invalidate affected queries" rule but is not
optimistic UI in the strict sense.

---

## 13. Lazy loading

No explicit `next/dynamic`, `React.lazy`, or route-level code-splitting
configuration was found in the files inspected. Next.js App Router performs
automatic per-route code splitting by default, so each route's JS is already
separated at the framework level; there is no evidence of additional
manual lazy-loading (e.g. deferring a heavy chart library or the AI chat
pane). **Requires validation** if a future feature needs this — do not
assume an existing lazy-loading convention to copy.

---

## 14. Role-based UI (Owner vs. Staff)

Two distinct patterns coexist, per ADR 0008 — do not conflate them:

1. **Per-record ownership within a shared module** (customers, products,
   expenses, deliveries, maintenance, documents): every role can open the
   page; a `use-<feature>-owner.ts` hook and/or `<feature>.guards.ts`
   determine whether the *current user* may edit/archive a *specific record*
   (owner can override `created_by`, staff generally limited to their own
   records — see `docs/DATABASE.md` per-table policy tables for the exact
   rule per feature). This is the older, more common pattern.
2. **Whole-page, role-gated route** (AI Assistant only, so far): nav item
   hidden for staff (`ownerOnly: true` in `app-sidebar.tsx`), the route itself
   independently re-checks `is_owner` server-side and redirects non-owners
   (`src/app/(protected)/ai-assistant/page.tsx`), and RLS on
   `ai_conversations`/`ai_messages` also requires the owner claim. Three
   layers, all independently enforced — the nav hide is UX only. ADR 0008
   states this is the required shape for any *future* owner-only module.

`sessionClaims.organization_role` (a display-only optional claim, falling
back to `is_owner ? 'Owner' : 'Staff'`) is shown in the sidebar user card but
is **not** used anywhere as an authorization check — only `is_owner` is.

---

## 15. Known UX inconsistencies

- **`/dashboard` is not a real dashboard** — it renders the same static
  marketing "mock dashboard" component (`DashboardPreview`) used on the
  public landing page, with zero data wiring. Any agent asked to "add a
  dashboard widget" should first confirm whether the user means building the
  real dashboard from scratch. **Confirmed** by reading the page file.
- **`/sales` is an unbuilt stub** (`<h1>Sales</h1>` only), despite `CLAUDE.md`
  listing sales as a core workflow and having a sidebar-adjacent presence in
  spirit (it's not even in the nav today).
- **`/playground` is a leftover dev tool**, not linked in nav, reachable by
  any authenticated+registered user regardless of role, and triggers a
  real edge function (email send) — see security doc for risk framing.
- **Header breadcrumb map is incomplete**: `ROUTE_LABELS` in `app-header.tsx`
  has no entries for `/documents`, `/ai-assistant`, `/sales`, or
  `/playground` — those routes show the generic "AquaFlow" fallback instead
  of their own name in the header breadcrumb.
- **Styling era split**: pre-Tailwind-guidance inline-style modules (landing,
  sidebar, header, expenses, and most of features 007–011) coexist with a
  documented "Tailwind-first for new/edited code" rule — an agent must check
  which era a file belongs to before assuming a styling convention (see §4).
- **TanStack Table dependency vs. hand-rolled grids** — see §8. A hard,
  repeated documented rule (`CLAUDE.md`) that the shipped code does not
  follow in any module.
- **Zustand named as the state library but not installed** — see §11.

---

## 16. Areas tightly coupled to desktop/web behavior (flag for mobile handoff)

- Fixed-pixel sidebar (`252px`/`78px`) with no off-canvas/mobile variant —
  the single biggest desktop-coupling in the shell.
- Table modules rely on horizontal scroll at a `minWidth` floor rather than a
  responsive card layout — customers, deliveries, expenses, documents.
- Two-pane AI Assistant chat shell (fixed `264px` conversation sidebar +
  flex message pane) has no evident collapsed/mobile layout.
- Dialogs anchor to the top of viewport with fixed max-widths (e.g.
  `maxWidth:lg` for the documents upload dialog) — likely fine on mobile
  widths but not verified against small viewports or on-screen-keyboard
  overlap.
- No `next/dynamic`/route-level lazy loading and no evidence of bundle-size
  tuning for a mobile network profile (§13).
- No PWA manifest, no `next.config.ts` image/device-size configuration
  beyond defaults (`next.config.ts` only sets `turbopack.root` — **Confirmed**
  per `05-codebase-map.md` §18).

---

## Unresolved frontend/UX questions (for later aggregation, not answered here)

- Is `/dashboard` intended to stay a static preview indefinitely, or is a
  real data-wired dashboard planned/in-progress elsewhere?
- Is `/sales` intentionally unbuilt, and should it be removed from routing
  entirely until built, given it isn't in nav?
- Is `/playground` meant to ship to production at all, and if so, should it
  be gated to owners/admins the way `/ai-assistant` is?
- Should the TanStack Table rule in `CLAUDE.md` be enforced going forward for
  new modules, or should the docs be amended to match the hand-rolled
  CSS-grid pattern already shipped everywhere?
- Is the mismatch between "Zustand" in the docs and the hand-rolled
  `useSyncExternalStore` stores intentional long-term, or should one side be
  changed to match the other?
- Is there a mobile-app or responsive-web requirement on the roadmap that
  should drive fixing the fixed-width sidebar/tables now rather than later?
- Was an accessibility audit (axe/Lighthouse) ever run against this app? None
  is referenced in the repo.
