# Mobile Handoff

Scoping and reusability analysis for a first mobile version of the Water
Refilling Station Management System. Grounded in the actual domain language
in `CONTEXT.md`, the RLS/identity model in `docs/DATABASE.md`, and the code
read directly in this pass (service layer, Supabase client factory, Clerk
hooks, notifications realtime subscription). Cross-references
[`05-codebase-map.md`](./05-codebase-map.md) and
[`11-quality-and-improvements.md`](./11-quality-and-improvements.md) (Q03,
the document-storage gap, is a direct blocker for one mobile capability
below).

No mobile work exists in the repo today — no React Native/Expo/Capacitor
project, no `app.json`/`capacitor.config.ts`, no mobile-specific env vars.
Everything below is a from-scratch plan, not a description of existing code.

---

## Mobile scope

### Features essential for a first mobile version

Prioritized by the domain's own field-work shape (per `CONTEXT.md`):

1. **Delivery status updates in the field** — the core mobile use case. A
   delivery moves `pending → for_delivery → completed/failed` (`CONTEXT.md`
   Deliveries Domain); `for_delivery`/`completed` is exactly the window where
   a driver is physically at a customer's location, away from a desktop. The
   **current delivery queue** (today's/overdue occurrences plus each
   schedule's next occurrence) is the natural mobile home screen for Staff.
2. **Maintenance task completion in the field** — same shape:
   `pending → completed`, staff physically at the equipment (`CONTEXT.md`
   Maintenance Domain). Recurring schedules roll forward on completion
   (ADR 0006) — this must work correctly from a mobile client too.
3. **Push notifications for assignment/status events** — `notifications`
   already models "personal, per-user, real-time" events
   (`recipient_id`, `type`, `title`, `message`) triggered by
   `SECURITY DEFINER` DB triggers (ADR 0010) — e.g. a maintenance task
   assignment. This is the clearest existing feature to extend to mobile
   push (see "Push notifications" below for what actually has to change).
4. **Read access to customers** (contact, address, lat/long) for a driver
   navigating to a delivery — `customers.latitude`/`longitude` already exist
   (`docs/DATABASE.md`).

### Web-only (do not prioritize for mobile v1)

- **AquaFlow AI** — owner-only (ADR 0008), analytical/chat-oriented; not a
  field workflow. Fine to leave desktop-only initially.
- **Expenses, Products/Inventory management, Documents upload/approval** —
  owner-centric back-office work; better suited to a larger screen. (Staff
  *can* create products per `CONTEXT.md`, but this is not a field-blocking
  workflow the way delivery/maintenance status updates are.)
- **Dashboard/Sales/Reports** — owner-facing summaries; `sales` is not even
  built yet on web (`05-codebase-map.md` §3: stub placeholder).
- **Registration/onboarding** — could be mobile-supported eventually, but the
  edge-function-based flow (`CONTEXT.md` Authentication & Onboarding) is
  simple enough to defer; new stations will likely onboard from the web app
  first regardless of whether staff later use mobile.

### Roles needing mobile support

- **Staff** — primary mobile user. Field delivery/maintenance work is
  Staff's core described responsibility (`CONTEXT.md` User Roles).
- **Owner** — secondary. An owner benefits from push notifications
  (e.g. "delivery failed," "maintenance overdue") and a lightweight status
  glance, but the owner's actual described capabilities (revenue reports,
  staff management, expenses) are back-office and can stay web-first.

### Mobile-specific workflows worth designing explicitly

- Driver opens the app → sees today's delivery queue (reusing the existing
  "current delivery queue" domain concept) → taps a delivery → marks
  `for_delivery` (stock deducts, per the stock-out window rule) → completes
  or fails it (with remarks, required on failure per the `deliveries` CHECK
  constraint) → notification fires to relevant party.
- Maintenance staff opens the app → sees assigned tasks → marks complete →
  recurring schedule rolls its next occurrence forward automatically
  (existing DB-side behavior, no new mobile logic needed here beyond calling
  the same service operation).
- Push notification tap → deep-link straight to the specific
  delivery/maintenance record (the web bell already maps `type` → a route,
  e.g. `maintenance` → `/maintenances`; the mobile equivalent needs the same
  type → screen mapping plus a specific-record deep link, which the web
  version does not currently need since it just navigates to the list page).

### Offline needs

**Not supported today; likely required for v1** given the field-work
context (small-business water delivery routes in areas that may have patchy
connectivity). Nothing in the current stack (TanStack Query with default
config, Supabase JS client) persists a cache or queues mutations offline.
This is a genuine gap to design for, not an existing pattern to reuse — see
the reusability table and phased plan below.

### Push notification needs

The domain fit is strong (`notifications` is already "personal, per-user,
real-time," trigger-authored, consume-only — ADR 0010), but the **delivery
mechanism does not carry over as-is**:

- Today's mechanism is a **foreground-only Supabase Realtime (Postgres
  Changes) WebSocket subscription** (`use-notifications-realtime.ts`) — it
  only delivers events while the web tab is open and connected. There is no
  device push-token registration table, no APNs/FCM integration, and no
  server-side dispatch beyond the DB trigger writing a row.
- **True mobile push** (arriving when the app is backgrounded or killed)
  needs a new capability: a push-token registration column/table per user
  device, and a dispatch step (e.g. the same `SECURITY DEFINER` trigger, or a
  Supabase Edge Function invoked after insert, calling Expo's push API or
  FCM/APNs directly) triggered on the same notification-insert events.
- The **domain model itself is directly reusable** — `type`, `title`,
  `message`, `recipient_id` map cleanly onto a push payload; only the
  transport is new work.

### Camera / QR / location / biometric / file needs

- **Camera / photo capture**: no existing feature does this correctly today.
  `documents` has an image-picker UI (`upload-document-dialog.tsx`) but per
  Q03 in `11-quality-and-improvements.md`, **the file is never actually
  persisted to storage** on web — there is no working reference pattern to
  port. A mobile "proof of delivery" or "maintenance photo" feature must
  design the Storage integration essentially from scratch, and should
  probably do so for web and mobile at the same time rather than fixing it
  twice.
- **QR codes**: not present in the domain today. Plausible future use
  (scanning a container/product QR at pickup) is speculative — no spec
  exists; do not build ahead of a documented requirement per
  `docs/AI-GUARDRAILS.md` ("do not invent features not written in the
  spec").
- **Location**: `customers.latitude`/`longitude` already exist and are
  editable from the web form (`docs/DATABASE.md` `public.customers`). A
  mobile app can reuse this data directly for map/navigation purposes
  without any backend change. Live GPS tracking of a driver's current
  position is **not** part of the domain today — would need a new
  spec/table if wanted (e.g. "delivery en route" location pings).
- **Biometric**: not present anywhere today (web has no such concept). Clerk
  supports this on native via its Expo SDK's passkey/biometric session
  unlock, but it is a net-new integration, not a port of existing code.
- **File handling generally**: the entire file/attachment story
  (`documents` feature) needs the storage-wiring fix (Q03) before any mobile
  camera-capture feature can be built on top of it responsibly.

### App-store considerations

Only relevant if the "React Native/Expo" path (below) is chosen — a
Capacitor or PWA path has lighter/no store review requirements initially
(Capacitor still needs store submission for native builds; a PWA does not).
Given this is a **B2B operational tool for staff**, not a consumer app,
consider whether:

- Distribution via **Expo's internal distribution / TestFlight & Play
  internal testing** (no public store listing) is sufficient for staff-only
  use, at least initially — avoids public app-store review cycles and public
  visibility entirely.
- A public listing is only needed if owners are expected to install the app
  from a public store link rather than a distributed build/invite link.

### Deep-linking

Needed for: push-notification taps (→ specific delivery/maintenance
record), and potentially an owner sharing a "join my station" link
(`organization_code`, per `CONTEXT.md` Authentication & Onboarding — already
a human-facing code today, could become a deep-link parameter for a staff
invite flow on mobile). No deep-linking infrastructure exists today (web
routes are the only "links").

---

## Reusability assessment

| Existing area | Classification | Evidence | Mobile recommendation |
|---|---|---|---|
| Zod schemas (`*.schema.ts`) | **Directly reusable** | Pure Zod/TS, no DOM or React import (confirmed reading `customers.schema.ts`, `documents.schema.ts`, `deliveries` schemas) | Import unchanged in any mobile approach; if code isn't literally shared (see Capacitor/Expo notes), copy verbatim as the starting point — do not redesign validation rules. |
| Types (`*.types.ts`) | **Directly reusable** | Plain TS interfaces/`z.infer` types, no platform dependency | Same as above. |
| Mappers (`*.mapper.ts`) | **Directly reusable** | Pure functions (row↔display↔form↔insert), no I/O, confirmed in `customers.mapper.ts`/`documents.mapper.ts` reads | Reuse unchanged; this is the layer least likely to need any platform-specific fork. |
| Guards (`*.guards.ts`) | **Directly reusable** | Pure predicates, e.g. `canEditCustomer`, `isRegistered()` — no platform API used | Reuse unchanged. Note per Q08 (`11-quality-and-improvements.md`) that role-aware guards are thin today on web too — expanding them is shared work, not mobile-specific work. |
| Query key factories (`*.keys.ts`) | **Directly reusable** | Plain arrays/functions, framework-agnostic, confirmed `customers.keys.ts` | Reuse unchanged with `@tanstack/react-query`, which runs identically in React Native. |
| Service layer (`services/*.service.ts`) | **Directly reusable** (Capacitor) / **Reusable with extraction** (Expo/RN) | Functions take an already-authenticated `SupabaseClient` as their first argument and use only `@supabase/supabase-js` calls — no browser-only API referenced in any service file read this pass (`customers.service.ts`, `documents.service.ts`) | `@supabase/supabase-js` works unchanged in React Native (it's a plain JS/fetch-based client). The functions themselves need zero changes; only the *caller* (the hook that constructs the client) differs per platform. |
| Supabase client factory (`src/lib/supabase/client.ts`) | **Reusable with extraction** | `createClerkSupabaseClient(getToken)` is a plain function taking a token-getter callback — but it contains a `typeof window === 'undefined'` SSR guard (`client.ts:26`) written for Next.js's server-prerendering of client components. React Native has no `window` global by default either, so this guard would need re-evaluating (it currently returns `null` whenever `window` is undefined — in RN that could permanently block auth unless the guard is changed to something RN-safe, e.g. a platform check or simply removing the guard for the RN build target) | Extract into a shared package/module; adjust or parameterize the SSR guard per platform before reuse in Expo/RN. Directly reusable as-is inside a Capacitor webview (still literally running in a browser context). |
| Clerk auth hook (`src/hooks/use-clerk-supabase.ts`) | **Reusable with extraction** | Imports `useAuth` from `@clerk/nextjs` (web-only package) | For Expo/RN: swap to `@clerk/clerk-expo`'s `useAuth()`, which exposes the same `getToken({ template })` shape — the *hook body* is otherwise portable line-for-line. For Capacitor: no change needed (still `@clerk/nextjs` inside the webview). |
| Auth (Clerk) end-to-end | **Reusable conceptually only** (Expo/RN) / **Directly reusable** (Capacitor, with caveats) | Clerk has an official Expo SDK (`@clerk/clerk-expo`) with the same session-claim/JWT-template model (`CONTEXT.md` Authentication & Onboarding describes `organization`/`is_owner` claims flattened by a JWT template — that template config lives in Clerk, not in this repo's code, so it is inherently portable) | For Capacitor, an embedded webview running Clerk's web components has known friction with OAuth-style redirect flows in some native webview contexts — **Requires validation** before committing to Capacitor if social sign-in is ever added; email/password and the existing edge-function-based onboarding likely work fine. |
| DB access / RLS model | **Reusable conceptually only** | RLS policies (`docs/DATABASE.md`) are enforced server-side against the JWT regardless of which client (web or native) sends the request — no policy changes needed for mobile | The *contract* — `org_id`/`created_by` resolved from Clerk claims via a `use-*-owner`-shaped hook, never from client input — must be preserved by whatever mobile auth hook replaces `use-clerk-supabase`. This is a rule to carry forward, not code to port. |
| `use-*-owner.ts` hooks (org/creator resolution) | **Reusable with extraction** | Same shape as `use-clerk-supabase.ts` — depends on `@clerk/nextjs`'s `useAuth()`/session claims | Same swap as the Supabase auth hook: portable logic, different Clerk package import per platform. |
| Query hooks (`use-<feature>.ts`, `use-create/update/archive-<feature>.ts`) | **Reusable with extraction** | Built on `@tanstack/react-query`, which runs unchanged in React Native; hook bodies only depend on the (swappable) client hook + the (directly reusable) service function | Very little actual logic needs rewriting — mostly a matter of re-pointing the client-construction import. |
| UI components (shadcn/ui, Tailwind) | **Web-specific** | shadcn is Radix + Tailwind, both DOM-only; confirmed as the UI layer for every feature's dialogs/forms | Not portable to React Native at all — RN needs a native component library (e.g. React Native Paper, Tamagui, NativeWind if committing to Tailwind-like styling in RN). Directly reusable, unchanged, inside a **Capacitor** webview. |
| TanStack Table | **Web-specific** (as currently used) | `@tanstack/react-table` is a headless table logic library, technically portable, but the *rendering* is 100% web `<table>`/`<div>` markup today (and per Q10 in `11-quality-and-improvements.md`, most list pages don't even use it yet, favoring hand-rolled grids) | Mobile "tables" are almost always better as scrollable card lists, not literal tables — do not try to port the web table UI; design a native list UI against the same underlying data/query hooks. |
| React Hook Form + Zod | **Directly reusable** (logic) / **Web-specific** (the `<form>`/`<input>` markup) | RHF + `zodResolver` work in React Native unchanged; only the JSX (native `TextInput` vs. `<input>`) differs | Reuse the Zod schema and RHF wiring pattern; rewrite only the field components. |
| State management (`src/stores/*` hand-rolled pub/sub) | **Reusable with extraction** | Plain JS module-level state + `useSyncExternalStore`, no DOM dependency for `toast-store.ts`'s state logic itself; `theme-store.ts` persists to `localStorage` (web-only API); `sidebar-store.ts`'s concept (collapsible desktop sidebar) doesn't map to mobile navigation at all | Toast *state* logic is portable; the *renderer* (`components/app/toast.tsx`) needs a native equivalent. Theme persistence needs `AsyncStorage`/`expo-secure-store` instead of `localStorage`. Sidebar concept should be replaced by a native tab/drawer navigator, not ported. |
| Notifications (realtime bell + subscription) | **Reusable conceptually only** | `useNotificationsRealtime`'s subscription *logic* (Supabase Realtime channel, `postgres_changes` filter, cache patching) is plain JS/React-Query and would run in RN, but it only delivers events while the app is foregrounded and connected — it is not push | The domain model and RLS/consume-only contract (ADR 0010) carry over untouched; the *delivery mechanism* for background/killed-app notifications is new work (see "Push notification needs" above), not a port. |
| File handling (`documents` upload) | **Requires further investigation / must be rewritten** | Web version doesn't persist files at all yet (Q03) — there is no working pattern to reuse for either platform | Design Supabase Storage integration once, shared conceptually between web file-picker and mobile camera capture (same bucket, same row shape, same mapper), rather than solving it twice. |
| Caching (TanStack Query defaults) | **Reusable with extraction** | Same library, same default config works in RN; no offline persistence configured anywhere today (web or hypothetical mobile) | Add `@tanstack/query-async-storage-persister` (or equivalent) for mobile offline support — genuinely new work, but it's an *addition* to the existing query-hook layer, not a replacement of it. |
| Tests (Vitest, schema/mapper/service) | **Reusable conceptually only** | Tests exercise pure-TS logic (schemas/mappers/services) with no platform dependency, so they'd continue to pass if the same source files are imported by a mobile app in a shared package/workspace | Vitest itself doesn't run inside a React Native/Expo app's own runtime, but the *code under test* is shared, so keeping tests green in the web repo continues to validate the logic mobile depends on — **as long as the mobile app actually imports the same modules** rather than duplicating them. |

---

## Mobile architecture options

Three realistic options for this stack (Next.js App Router web app + Clerk +
Supabase + TanStack Query). All three are relevant here — none skipped.

| Dimension | Responsive Web / PWA | Capacitor (wraps the web app) | React Native / Expo (separate app) |
|---|---|---|---|
| **Reusability of existing code** | Total — it *is* the existing app, made responsive | Very high — same web bundle runs in a native shell; UI layer (shadcn/Tailwind) needs zero changes | Moderate — schemas/types/mappers/guards/keys/services/query-hook-logic are directly or near-directly reusable (see table above); UI layer must be rebuilt natively |
| **Effort to first mobile-usable version** | Low — mostly responsive-layout/Tailwind breakpoint work on existing pages, plus a web manifest | Low-Medium — wrap the existing Next.js build, add native plugins for camera/push/geolocation as needed | High — new project, new UI kit, new navigation, though business logic ports fast |
| **Performance (native feel)** | Lowest — still a browser tab/PWA shell, scrolling/gestures feel web-like | Medium — native shell around a webview; UI still renders as web content, so same web-perf ceiling | Highest — genuinely native rendering and gestures |
| **Native capability access (camera, push, biometric, background location)** | Weakest — Web Push has real gaps on iOS (only reliable from iOS 16.4+ and only for installed/home-screen PWAs), no true background push, `getUserMedia` camera works but with more permission friction than a native camera picker, no biometric API | Strong — official Capacitor plugins exist for camera, push (via FCM/APNs), geolocation, biometric; requires native build/store distribution (or ad-hoc/internal distribution) even though the UI is web | Strongest — first-class Expo modules for all of camera, push (`expo-notifications`), geolocation, biometric (`expo-local-authentication`), and offline storage |
| **Auth impact (Clerk)** | None — same Clerk web SDK, same session model | Low — same Clerk web SDK inside the webview; **Requires validation** for any OAuth/social-login redirect flows in an embedded webview (email/password and the existing edge-function onboarding are lower-risk) | Moderate — swap to `@clerk/clerk-expo`; same underlying session-claim/JWT-template model (`CONTEXT.md`), officially supported, but it is a distinct SDK integration to set up and test |
| **Deployment impact** | None beyond adding a web manifest/service worker to the existing Next.js deploy | Adds a native build pipeline (Xcode/Android Studio or Expo/EAS-style build service) on top of the existing web deploy; the web app deploy is otherwise unaffected | Fully separate build/release pipeline (Expo/EAS or bare RN), independent of the Next.js web deploy; doubles the surfaces to release and version |
| **Maintenance burden long-term** | Lowest — one codebase, one deploy target | Medium — one UI codebase, two build/release targets (web + native shell), native plugin versions to track | Highest — two UI codebases (web + native) sharing only the non-UI layers, two full release cycles, two sets of platform-specific bugs |
| **Risk** | Low, but may not satisfy "field app" needs (offline, reliable push, camera) well enough for the driver/maintenance workflows above | Medium — a real native app ships, but perf/feel ceiling is capped by the webview; native plugin integration in a Next.js/Turbopack app that isn't built for static export needs upfront investigation (Capacitor typically wants a static/exported web build, and this app currently has `force-dynamic` client-rendered pages, which is compatible with a static shell pointed at a hosted URL rather than a bundled static export — **Requires validation** of which Capacitor deployment mode fits) | Highest effort/risk to *start*, lowest long-term risk for the specific field-worker capabilities this domain actually needs (offline, camera, reliable background push, biometric) |
| **Suitability for this domain** | Good stopgap for owners checking status on the go; **not sufficient** for the driver/maintenance field-update workflows given push/offline/camera gaps | Good middle ground if a fast native-feeling app is wanted without a UI rewrite, and push/camera/offline can be added incrementally via plugins | Best fit if the driver/maintenance field app becomes a real product priority — the domain's actual needs (reliable push when backgrounded, camera for proof-of-work, possible offline queueing, biometric quick-unlock) line up with what only a true native runtime does well |

### Recommendation

**Phased, not single-choice**: ship a **responsive/PWA improvement to the
existing web app first** (cheapest, benefits all roles immediately, and
forces the responsive-table/mobile-layout gap flagged in `docs/DESIGN.md`'s
"Tables must remain readable on small screens" rule to actually get done).
In parallel or shortly after, invest in a **React Native/Expo app scoped
narrowly to the Staff field-worker workflows** (delivery + maintenance status
updates, push, camera for proof-of-work once the storage gap is fixed) —
this is where the domain's real mobile needs (reliable background push,
camera, potential offline) live, and Expo's reuse of the schema/mapper/
service/query-hook layers (see reusability table) keeps the incremental cost
lower than starting from zero. **Capacitor is a reasonable fallback** if
product priorities shift toward "ship *something* installable fast" over
"build the right field-worker tool," but it inherits the web UI's current
gaps (Q04's client-side pagination, Q10's table drift, Q03's broken file
upload) rather than forcing them to be fixed, and its native-capability
ceiling is lower than Expo's for this domain's actual needs.

---

## Phased migration plan

Each phase lists dependencies on prior phases, the main risks, and what
"done" looks like.

### Phase 0 — Prep / decoupling

- Fix the blockers that would otherwise be inherited by *any* mobile
  approach: Q03 (document storage not wired), Q04 (client-side-only list
  pagination — matters more on mobile's smaller viewports/slower networks),
  Q01 (confirm auth middleware is actually active — a mobile client hitting
  the same Supabase project inherits the same RLS/auth contract regardless,
  but the *web* onboarding-redirect assumption should be understood before
  designing a parallel mobile onboarding flow).
- Extract genuinely platform-agnostic modules (`*.schema.ts`, `*.types.ts`,
  `*.mapper.ts`, `*.guards.ts`, `*.keys.ts`, `services/*.service.ts`) into a
  clearer "core" boundary per feature if not already clean — audit for any
  accidental `window`/`document`/DOM references inside a service or mapper
  file before assuming it's portable (none found in the files read this
  pass, but this should be a repo-wide check before Phase 2).
- **Dependencies**: none — can start immediately.
- **Risks**: doing real feature fixes (Q03/Q04) under the banner of "mobile
  prep" risks scope creep; keep these as their own tracked changes with
  their own tests, not bundled into a "mobile" branch.
- **Acceptance criteria**: Q01 verified either way (documented, not
  necessarily fixed), Q03 has a designed (if not yet shipped) storage
  schema, no service/mapper/schema file found to reference a browser-only
  global.

### Phase 1 — Shared contracts

- Decide the code-sharing mechanism: a monorepo workspace package (e.g.
  `packages/core` consumed by both the Next.js app and a future Expo app) vs.
  duplicated files kept in sync manually. Given the volume of directly-
  reusable pure-TS modules (schemas/types/mappers/guards/keys), a shared
  package pays for itself quickly.
- Move (or newly publish) `*.schema.ts`, `*.types.ts`, `*.mapper.ts`,
  `*.guards.ts`, `*.keys.ts` per feature into the shared package; update the
  Next.js app's imports to consume it, with the existing Vitest suite as the
  regression check (all 208 tests should still pass unchanged, since these
  files have no platform dependency).
- **Dependencies**: Phase 0's audit (confirms nothing platform-specific is
  hiding in these files).
- **Risks**: import-path churn across the whole web app; do this as its own
  reviewed change, verified by the full test suite plus `lint`/`typecheck`,
  before any mobile code exists to consume it.
- **Acceptance criteria**: web app builds, lints, typechecks, and passes all
  208 existing tests after the move, with zero behavior change.

### Phase 2 — API/service readiness

- Extend the service-layer signatures flagged in Q04 (server-side
  search/pagination) — needed by both a redesigned responsive web UI and any
  mobile client, since neither should fetch unbounded row sets on a mobile
  network.
- Design and ship the Supabase Storage integration for `documents` (Q03),
  shared conceptually between "web file picker" and "mobile camera capture."
- **Dependencies**: Phase 1 (shared service layer is the thing being
  extended).
- **Risks**: as noted in Q04/Q03's entries in the quality doc — do
  incrementally per feature, not as one big migration.
- **Acceptance criteria**: at least the `customers`/`deliveries` list reads
  accept filter/pagination params; documents round-trip an actual file
  through Storage end-to-end (upload → persisted path → later retrieval).

### Phase 3 — Auth strategy

- Stand up `@clerk/clerk-expo` in a throwaway/spike Expo project against the
  same Clerk instance and JWT template (`water-station`) already used by web
  — confirm `organization`/`is_owner` claims arrive identically.
- Port `use-clerk-supabase.ts`'s logic to use `@clerk/clerk-expo`'s
  `useAuth()`; resolve the `typeof window` SSR-guard question in
  `createClerkSupabaseClient` for the RN runtime.
- **Dependencies**: Phase 1 (the Supabase client factory needs to already be
  in the shared package to adjust it once, for both platforms).
- **Risks**: this is the phase most likely to surface an unexpected Clerk/
  Expo integration gap — treat the spike as throwaway/exploratory before
  committing the real app to it.
- **Acceptance criteria**: a signed-in Expo session successfully performs an
  RLS-scoped Supabase read (e.g. fetch the signed-in user's org's active
  deliveries) end-to-end.

### Phase 4 — Mobile MVP (Staff field app)

- Build the delivery-queue and maintenance-task screens using the shared
  service/query-hook layer, native list/card UI (not a ported table), and
  native forms (RHF + Zod reused, native inputs).
- Wire the existing status-transition service calls
  (`delivery-status.service.ts`, maintenance task completion) — no new
  backend logic needed here beyond what Phase 2 already covers.
- **Dependencies**: Phases 1–3.
- **Risks**: Q12 (non-transactional status/edit services) matters more here
  — a mobile driver with a flaky connection retrying a status update is
  exactly the concurrent-write scenario that risk describes; consider
  prioritizing Q12's fix before or during this phase rather than after.
- **Acceptance criteria**: a Staff user can view today's queue, mark a
  delivery `for_delivery` then `completed`/`failed` with remarks, and mark a
  maintenance task complete — all reflected correctly in the same Supabase
  tables the web app reads, verified by loading the web app afterward and
  confirming state matches.

### Phase 5 — Native integrations

- Camera capture for proof-of-delivery/maintenance photos, built on the
  Phase 2 Storage integration.
- Push notifications: add a device-token registration table/column, extend
  the notification-insert trigger path (or add an Edge Function) to dispatch
  via Expo's push service; update the mobile app to register its token on
  sign-in.
- Location: surface `customers.latitude`/`longitude` for map/navigation
  (read-only reuse of existing data — no schema change needed).
- Biometric quick-unlock via `expo-local-authentication`, gating access to an
  already-established Clerk session (not replacing Clerk auth itself).
- **Dependencies**: Phase 4 (MVP screens to attach these capabilities to);
  push specifically depends on Phase 2's understanding of the notification
  trigger path.
- **Risks**: push dispatch reliability (token expiry/rotation, delivery
  failures) needs its own monitoring — ties into Q06 (no error reporting
  today) in the quality doc; consider standing up basic error reporting
  before shipping push to avoid silent failures being invisible on both
  platforms.
- **Acceptance criteria**: a photo taken in-app is retrievable from the same
  document/record on web; a push notification arrives when the app is fully
  backgrounded/killed, not just foregrounded.

### Phase 6 — Testing

- Add tests for any new mobile-only glue code (the Expo auth hook, the push
  registration logic) following the existing Vitest hand-mocked-Supabase-
  client convention where the code is pure-enough to unit test; genuinely
  native-only code (camera/biometric plugin calls) will need either manual
  QA or an Expo/Detox-style E2E setup, which does not exist in this repo
  today and would be new tooling.
- Re-run the full existing web Vitest suite after every shared-package
  change (Phase 1 onward) as the regression gate for the reused logic.
- **Dependencies**: Phases 1–5 producing code to test.
- **Risks**: none of the existing test tooling runs *inside* Expo/RN itself;
  don't assume `npm run test` covers mobile-only code paths.
- **Acceptance criteria**: shared-package tests stay green; new mobile-only
  logic has at least schema/mapper-equivalent unit coverage where it's pure
  enough to unit test.

### Phase 7 — Release and monitoring

- Decide internal-distribution vs. public app-store listing (see "App-store
  considerations" above) based on whether owners, not just staff, need to
  self-install.
- Stand up basic crash/error reporting for the mobile app before general
  rollout — there is no equivalent on web today either (Q06), so this phase
  is a good forcing function to finally add it for both platforms.
- **Dependencies**: Phase 6 passing; a decision from Phase 0/Q06 on a
  monitoring vendor.
- **Risks**: shipping push notifications and offline sync without any error
  visibility (per Q06) risks silent failures that are hard to diagnose after
  the fact — do not skip monitoring to hit a release date.
- **Acceptance criteria**: a released (even if internally-distributed) build
  exists that a real Staff user can install and use for at least the Phase 4
  MVP workflows, with crash/error visibility in place.

---

## Unresolved mobile questions (for later aggregation — not answered here)

- Monorepo/shared-package vs. duplicated-file strategy for Phase 1 — needs a
  tooling decision (Turborepo/Nx/plain npm workspaces) not covered by
  anything in the current repo.
- Whether offline support is a Phase 4 MVP requirement or a later addition —
  depends on how poor real-world field connectivity actually is for target
  stations (needs a product/ops decision, not inferable from the codebase).
- Whether Capacitor should be built as a stopgap in parallel with the Expo
  track, or skipped entirely in favor of going straight to Expo.
- Whether the `sales`/`playground` routes (unbuilt/scratch on web per
  `05-codebase-map.md`) have any mobile relevance at all, or are purely
  future/web-only.
