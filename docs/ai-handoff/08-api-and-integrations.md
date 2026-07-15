# APIs and Integrations

> Written for AI coding agents picking up this repo cold. Labels on every
> non-trivial claim: **Confirmed** (directly stated in a spec/doc/code),
> **Inferred** (reasonably derived but not stated outright), **Unknown**
> (no evidence found), **Potentially outdated** (spec/doc text contradicted
> by later docs/code), **Requires validation** (should be checked against
> the live system before being relied on).
>
> See [07-data-architecture.md](./07-data-architecture.md) for the schema
> these integrations read/write, and [01-product-overview.md](./01-product-overview.md)
> for product context.

## 0. The Governing Rule — **Confirmed**

`docs/ARCHITECTURE.md` ("Data Flow") mandates:

```
UI -> validation -> hook/action -> feature service -> Supabase SDK -> RLS -> response
```

> "Do not create `*.api.ts` files or raw `fetch('/api/...')` request helpers
> for normal Supabase database queries. Use the Supabase SDK inside feature
> services."

Consequently, **this repo has almost no custom internal REST API surface.**
Every CRUD operation for customers, products, expenses, deliveries,
maintenance, and documents goes straight from a React hook, through a
`*.service.ts` file, to the Supabase JS client, relying on RLS for
authorization — never through a `src/app/api/*` route. The two subsections
below (§1 internal routes, §2 Supabase Edge Functions) are the **exceptions**
to that rule, and each exists for a specific reason documented inline.

## 1. Internal Next.js API Routes (`src/app/api/*`)

Exactly **one** route exists in the entire repo:

### `POST /api/aquaflow-ai-mock`

- **File**: `src/app/api/aquaflow-ai-mock/route.ts` (test:
  `src/app/api/aquaflow-ai-mock/route.test.ts`)
- **Purpose**: Mock backend for the AquaFlow AI chat assistant. Returns
  canned, keyword-matched, business-shaped replies (revenue/stock/deliveries/
  maintenance/expenses/customers) in the **exact response contract** a real
  Gemini-backed Supabase Edge Function is expected to use later, so the
  frontend/persistence layer needs no change when swapped. **Confirmed** —
  file header comment, `docs/ai-handoff/01-product-overview.md` ("mock
  canned-response endpoint, not a real LLM").
- **Calling feature**: `aquaflow-ai`. Called from
  `requestAssistantReply()` in
  `src/features/aquaflow-ai/services/aquaflow-ai.service.ts:176`, via
  `useSendAiMessage` (`src/features/aquaflow-ai/hooks/use-send-ai-message.ts`).
  The URL is not hardcoded — it's `AI_ENDPOINT_URL`
  (`src/features/aquaflow-ai/aquaflow-ai.constants.ts`), which defaults to
  `/api/aquaflow-ai-mock` and is overridable by
  `NEXT_PUBLIC_SUPABASE_EDGE_AQUAFLOW_AI_URL` — that env var is **not set**
  in the local `.env` today, so the mock route is what actually runs.
  **Confirmed**.
- **Method**: `POST` only (no `GET`/other handlers exported).
- **Auth requirement**: **Indirect only, via `src/proxy.ts` Clerk
  middleware**, not an explicit check inside the route handler itself. The
  middleware's matcher config includes `/(api|trpc)(.*)`, so every request
  to this route passes through `clerkMiddleware`: an unauthenticated caller
  is redirected to `/sign-in`; an authenticated-but-not-`isRegistered()`
  caller is redirected to `/complete-registration`. Only a signed-in,
  registered user's request reaches the route handler. **Confirmed** —
  `src/proxy.ts`.
- **Authz requirement**: **None at the route level.** AquaFlow AI is
  documented as owner-only (`docs/adr/0008-owner-only-route-level-gating.md`),
  but that gate is enforced at the **nav** (hidden for non-owners) and
  **page/route** layer (`/ai-assistant` redirects non-owners) and at the
  **Supabase RLS** layer for `ai_conversations`/`ai_messages` — **not**
  inside this API route. A registered **staff** session could still `POST`
  directly to `/api/aquaflow-ai-mock` and get a canned reply back (it just
  couldn't persist the conversation, since RLS blocks the
  `ai_conversations`/`ai_messages` writes for non-owners). **Requires
  validation / potential gap**: this is a low-severity issue today (the mock
  route does nothing sensitive — no DB read, no real AI, no cost) but if
  this route is swapped for the real Gemini-backed edge function without
  adding an explicit `is_owner` check at that layer too, a staff session
  could invoke real LLM calls (cost/abuse surface) even though the UI hides
  the entry point. Flag this when implementing the real endpoint.
- **Request shape** (validated on the client before send, not re-validated
  server-side): `{ conversationId: number | null, message: string, history:
  { role: 'user' | 'assistant', content: string }[] }` per
  `assistantRequestSchema` in `src/features/aquaflow-ai/aquaflow-ai.schema.ts`.
  **The route handler itself only reads `message`** — `conversationId` and
  `history` are accepted by the shared contract/schema but **ignored** by
  the current mock implementation (`craftReply(message)` is keyword-matching
  on `message` alone). **Confirmed** — `route.ts` body-parsing block only
  destructures `message`.
- **Server-side input validation**: minimal and defensive, not schema-based.
  The handler `try`/`catch`-wraps `request.json()`, checks `body &&
  typeof body === 'object' && 'message' in body`, and falls through to an
  empty-string default on any parse failure or wrong shape — it does
  **not** run `assistantRequestSchema` (or any Zod schema) server-side.
  **Confirmed** (`route.ts:96-105`). This is a real gap relative to
  `docs/SECURITY.md` ("Validate server-side inputs... Every mutation must
  validate its input before sending data") — low risk today only because
  the handler does nothing with the input except string-match it (no DB
  write, no injection surface), but should be fixed if this route grows.
- **Response shape**: `AssistantReply` — `{ content: string, cardType?:
  'insight' | 'flag' | 'ranked', cardData?: unknown[] }`, always
  `NextResponse.json(...)` with an implicit 200. Validated **client-side**
  after fetch via `assistantReplySchema.safeParse(json)` in
  `aquaflow-ai.service.ts` (throws a user-facing error if the shape doesn't
  match — this is where the "shared contract" guarantee actually gets
  enforced, not server-side).
- **Side effects**: none — no DB write, no external call. Purely
  computes a canned string from keyword matches in `craftReply()`.
- **Error behavior**: the route itself never returns a non-200 status (no
  `try`/`catch` around a failure path that would 4xx/5xx) — a malformed body
  degrades to the generic fallback reply, not an error response. The
  **caller** (`requestAssistantReply`) treats a non-`res.ok` HTTP status or a
  `fetch`/JSON-parse throw as `AI_REPLY_ERROR` ("The assistant is
  unavailable right now. Please try again."), and a schema-mismatch on the
  response as the same error — but neither path is currently reachable from
  this specific handler's code (it always returns 200 with a valid shape).
  **Inferred** this defensive client code is written for the *future* real
  edge function, which can genuinely fail/error, not for the mock.
- **Artificial delay**: `await new Promise(resolve => setTimeout(resolve,
  700))` before responding, so the UI's typing indicator has something to
  show. **Confirmed** — remove or adjust when swapping to a real backend
  with genuine latency.

No other `src/app/api/*` routes exist in this repo (**Confirmed** — full
glob of `src/app/api/**/*` returns only this one route's two files).

## 2. Supabase Edge Functions (external to this Next.js app)

These are **not** in this repository — they run on Supabase's own
infrastructure and are called from the frontend via `axios`/`fetch`/the
Supabase Functions client. They are documented here because the frontend
code that calls them lives in `src/`, and future agents need to know these
contracts exist and are load-bearing, even though the function
implementations themselves are out of scope for this repo.

### `create-aquaflow-organization` (owner onboarding)

- **Called from**: `src/features/registration/services/registration.service.ts`
  (`submitRegistration`), via `axios.post`.
- **URL env var**: `NEXT_PUBLIC_SUPABASE_EDGE_CREATE_ORG_URL`.
- **Auth**: `Authorization: Bearer <Clerk session token>` header, no
  Supabase anon key involved in this call. **Confirmed**.
- **Request body** (`OwnerRegistrationPayload`):
  `{ organization_name: string, name: string, email: string }` —
  `organization_name` from the registration form; `name`/`email` from the
  Clerk session claims (never user-typed for those two). **Confirmed** —
  `src/features/registration/registration.types.ts`, `CONTEXT.md`
  ("Authentication & Onboarding").
- **Side effects (server-side, inferred from ADR/CONTEXT, not visible in
  this repo)**: generates an `organization_code`, creates the
  `organizations`, `organization_members`, and `users` rows for the caller,
  and writes `public_metadata.organization` (the new org's `organizations.id`
  uuid) + `public_metadata.is_owner = true` onto the caller's Clerk user.
  **Confirmed** per `CONTEXT.md`, `docs/adr/0001-onboarding-gating-via-clerk-claims.md`.
- **Critical invariant** (`docs/adr/0001`): this function **must** write a
  non-null `organization` claim for owners even though owners have no invite
  code — if it doesn't, the client's `isRegistered()` gate never passes and
  the user loops back to `/complete-registration` forever. This is an
  external-system correctness dependency the frontend cannot verify or fix.
- **Client-side follow-up**: after a successful call, the form hook forces
  a fresh token (`getToken({ skipCache: true })`) and hard-navigates
  (`window.location.assign('/dashboard')`) so `src/proxy.ts` middleware
  re-reads the now-updated claims — a normal client-side route transition
  would still see the stale cached token. **Confirmed** — ADR 0001.
- **Failure/retry behavior in the frontend**: `axios.post` with no explicit
  retry logic found; a rejected promise propagates as a mutation error shown
  to the user (via the form's error state — exact toast/message text not
  traced further here). **Inferred**, not fully verified.
- **Idempotency**: unknown from this repo (server-side concern). If a user
  double-submits, whether the edge function is safe to call twice is
  **Unknown / Requires validation**.

### `aquaflow-add-staff` (staff onboarding)

- **Called from**: same file/mechanism as above (`submitRegistration`),
  different branch.
- **URL env var**: `NEXT_PUBLIC_SUPABASE_EDGE_ADD_STAFF_URL`.
- **Auth**: same Bearer-token pattern.
- **Request body** (`StaffRegistrationPayload`):
  `{ organization_code: string, contact_number: string, name: string, email:
  string }` — `organization_code` and `contact_number` from the form;
  `name`/`email` from session claims. **Confirmed**.
- **Side effects (inferred, server-side)**: resolves the target
  organization by `organization_code`, creates the staff's
  `organization_members`/`users` rows, and writes `public_metadata`
  (`organization` uuid + `is_owner = false`) onto the caller.
- Same client-side token-refresh/hard-navigate and error-propagation
  behavior as the owner path.

### `aquaflow-welcome-email` (demo/playground feature — not part of the core product)

- **Called from**: `src/features/playground/services/playground.service.ts`
  (`sendSmoothHandlerEmail`), via the **Supabase Functions client**
  (`client.functions.invoke('aquaflow-welcome-email', { body: { email,
  name } })`) — **not** `axios`/raw `fetch` like the two registration
  functions above. This is the only place in the repo that uses
  `supabase-js`'s `functions.invoke` API rather than a direct HTTP call.
  **Confirmed**.
- **Purpose**: appears to be a demo/QA feature for sending a "smooth
  handler" welcome email — gated behind a `src/features/playground` feature
  with its own form (`send-email-card.tsx`), not linked from any core
  workflow found in the main nav/routes. **Inferred** this is a
  dev/demo/testing surface, not a customer-facing product feature —
  **Requires validation** with the team on whether this should ship to
  production or is dev-only scaffolding.
- **Request body**: `{ email: string, name: string }`, validated
  client-side by `sendEmailSchema` (Zod: valid email, non-empty name)
  before invoke.
- **Auth**: the invoking Supabase client is the same Clerk-authenticated
  client used everywhere (`useClerkSupabase()`), so the function receives
  whatever the Supabase Functions client forwards from that client's
  configured `accessToken` — i.e., the Clerk JWT, same as a DB call.
  Whether the function itself checks/requires that token is
  **Unknown** (external code).
- **Error handling**: distinguishes `FunctionsHttpError` (reads a
  `{error}`/`{message}` JSON body from the function's error response),
  `FunctionsRelayError` ("Supabase could not relay..."), and
  `FunctionsFetchError` ("Could not reach the email service...") into
  distinct user-facing messages. This is the most careful error-handling
  code for any external call in the repo — **Confirmed**, worth using as
  the model if wiring up the real AquaFlow AI edge function later.
- **Idempotency/retry**: none found — single invoke, no retry wrapper.

### AquaFlow AI real backend (planned, not yet built)

- **Env var reserved but unset locally**: `NEXT_PUBLIC_SUPABASE_EDGE_AQUAFLOW_AI_URL`
  (referenced in `aquaflow-ai.constants.ts`, absent from the committed
  `.env`). When set, `requestAssistantReply()` posts to it instead of
  `/api/aquaflow-ai-mock`, using the identical request/response contract
  (`assistantRequestSchema` / `assistantReplySchema`) — **Confirmed** by
  design (constants file comment: "a future spec swaps this env var for the
  real Supabase Edge Function URL with no code change").
  - **Requires validation**: whether the real function will require an
    explicit `is_owner` check server-side (see the §1 authz gap noted
    above) and how it will be authenticated (Bearer header like
    registration, or the Supabase Functions client like the welcome email —
    two different existing patterns in this repo to choose between).
- **`GEMINI_API_KEY`** exists in the committed `.env` but is **not
  referenced anywhere in `src/`** (confirmed by grepping `process.env.*` —
  it doesn't appear). **Inferred**: this key is provisioned for use
  *inside* the future Supabase Edge Function (which runs outside this
  Next.js codebase, likely as a Deno function calling Google's Gemini API
  directly), not for any code in this repository. Consistent with the mock
  route's comment referring to "a real Gemini-backed Supabase Edge
  Function." Do not wire this key into any Next.js server code without
  confirming that's actually the intended architecture — as of today
  nothing in `src/` consumes it.

## 3. External Services Summary

| Service | Purpose | Integration files | Auth model |
|---|---|---|---|
| **Clerk** | Authentication, session/JWT issuance, user profile, legal-consent capture (Terms/Privacy checkbox at sign-up) | `src/proxy.ts` (`clerkMiddleware`), `src/hooks/use-clerk-supabase.ts`, `src/types/globals.d.ts` (custom claims), `src/app/(auth)/*` | Clerk-managed sessions; publishable key client-side, secret key server-side (SDK-managed, not read via explicit `process.env` in app code) |
| **Supabase (Postgres + RLS + Realtime + Edge Functions)** | Primary datastore, tenant-isolation enforcement, realtime notification delivery, onboarding/email/AI edge functions | `src/lib/supabase/client.ts`, every `src/features/*/services/*.service.ts`, `src/features/notifications/*` (realtime) | Clerk JWT forwarded as the Supabase client's `accessToken` (via the `water-station` Clerk JWT template) — **not** Supabase's own auth/session system. RLS reads `auth.jwt()` claims that are really Clerk claims. |
| **Google Gemini** (planned, external to any code in this repo) | Intended real backend for AquaFlow AI once the mock endpoint is replaced | none yet — `GEMINI_API_KEY` reserved in `.env`, unused in `src/` | Unknown/external (would live inside the future edge function) |

No other third-party SDKs were found in `package.json` (no email provider
SDK like Resend/SendGrid, no analytics SDK, no payment SDK, no file-storage
SDK beyond what `@supabase/supabase-js` itself provides). **Confirmed** —
full `dependencies`/`devDependencies` review: `@clerk/nextjs`,
`@clerk/themes`, `@supabase/ssr`, `@supabase/supabase-js`,
`@tanstack/react-query`, `@tanstack/react-table`, `axios`,
`class-variance-authority`, `clsx`, `lucide-react`, `next`, `radix-ui`,
`react`/`react-dom`, `react-hook-form`, `react-markdown`, `remark-gfm`,
`shadcn`, `tailwind-merge`, `tw-animate-css`, `zod` — plus dev deps
(`tailwindcss`, `eslint`, `typescript`, `vitest`). Note `@supabase/ssr` is a
dependency but no server-side Supabase client (`createServerClient`, route
handler, or middleware Supabase usage) was found being used from it in
`src/` — **Requires validation** whether it's actually wired up anywhere or
just installed/unused.

## 4. Environment Variables (names only — see `.env`/`.env.example` for values, never quote values in docs)

No `.env.example` file exists in this repo (**Confirmed** — only `.env`
itself was found). Names below are transcribed from the committed `.env`
(values redacted) and cross-checked against `process.env.*` references in
`src/`:

| Variable | Client/Server | Referenced in `src/`? | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (client) | Yes — `src/lib/supabase/client.ts` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public (client) | Yes — `src/lib/supabase/client.ts` | Supabase anon/publishable key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public (client) | Implicit (Clerk SDK convention; no direct `process.env` read found in `src/`) | Clerk publishable key |
| `CLERK_SECRET_KEY` | **Server-only** | Implicit (Clerk SDK convention) | Clerk secret key — must never reach client bundles (`docs/SECURITY.md`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Public (client) | Implicit (Clerk SDK convention) | Clerk sign-in route config |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Public (client) | Implicit (Clerk SDK convention) | Clerk sign-up route config |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | Public (client) | Implicit (Clerk SDK convention) | Post-sign-up redirect |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Public (client) | Implicit (Clerk SDK convention) | Post-sign-in fallback redirect |
| `NEXT_PUBLIC_SUPABASE_EDGE_CREATE_ORG_URL` | Public (client) | Yes — `src/features/registration/registration.constants.ts` | Owner-onboarding edge function URL |
| `NEXT_PUBLIC_SUPABASE_EDGE_ADD_STAFF_URL` | Public (client) | Yes — `src/features/registration/registration.constants.ts` | Staff-onboarding edge function URL |
| `NEXT_PUBLIC_SUPABASE_EDGE_AQUAFLOW_AI_URL` | Public (client) | Yes — `src/features/aquaflow-ai/aquaflow-ai.constants.ts` | Real AI edge function URL (unset locally; falls back to the mock route) |
| `GEMINI_API_KEY` | **Server-only** (present in `.env` but unused in this repo) | No — not read anywhere in `src/` | Reserved for the future Gemini-backed edge function (external to this repo) |

Per `docs/SECURITY.md`, the only variables ever allowed in frontend/browser
code are the public Supabase URL, public Supabase anon/publishable key, and
public Clerk publishable key — matches the `NEXT_PUBLIC_*` set above.
`CLERK_SECRET_KEY` and `GEMINI_API_KEY` must never be exposed client-side;
no evidence was found of either being misused in `src/` (neither is
referenced by any client component).

## 5. Local-Dev Requirements

To run this app locally an agent/developer needs, at minimum:
- A Clerk application configured with the `water-station` JWT template
  (referenced by `useClerkSupabase()` — `getToken({ template:
  'water-station' })`) that surfaces `organization`, `is_owner`, `name`,
  `email` (and optionally `organization_name`, `organization_role`) as
  top-level session claims from `public_metadata`. **Confirmed** —
  `src/hooks/use-clerk-supabase.ts`, `src/types/globals.d.ts`.
- A Supabase project with the schema described in
  [07-data-architecture.md](./07-data-architecture.md) manually applied
  (no automated migration to run), RLS policies in place, the
  `create-aquaflow-organization` / `aquaflow-add-staff` / (optionally)
  `aquaflow-welcome-email` Edge Functions deployed, and `notifications`
  added to the `supabase_realtime` publication if testing that feature.
- Clerk's **legal consent** dashboard toggle enabled if testing sign-up end
  to end (`docs/adr/0014-legal-consent-via-clerk.md`) — this is a Clerk
  Dashboard setting, not anything in this repo.
- Without `NEXT_PUBLIC_SUPABASE_EDGE_AQUAFLOW_AI_URL` set, AquaFlow AI works
  fully against the local mock route with no external dependency — useful
  for local dev/testing of that feature without a real Supabase Edge
  Function or Gemini key.

## Open API/Integration Questions

(Flagged here per instructions — not answered, for aggregation into a
separate open-questions doc.)

- Should `/api/aquaflow-ai-mock` (and its eventual real replacement) enforce
  an explicit `is_owner` check server-side, given that today only
  nav/route/RLS gate the feature and a staff session could technically
  invoke the mock endpoint directly?
- Should the mock route validate its request body with
  `assistantRequestSchema` server-side instead of the current ad-hoc
  `'message' in body` check, per `docs/SECURITY.md`'s "validate server-side
  inputs" rule?
- Is `src/features/playground` (and its `aquaflow-welcome-email` call) a
  shipped product feature or dev/demo scaffolding that should be removed or
  gated before release?
- Is `@supabase/ssr` actually used anywhere (server-side Supabase client),
  or is it an installed-but-unused dependency?
- What auth pattern will the real AquaFlow AI edge function use — Bearer
  token via `axios`/`fetch` (like the two registration functions) or the
  Supabase Functions client (`functions.invoke`, like the welcome email)?
  The two existing precedents differ, and this decision affects error
  handling and retry design.
- Is there a retry/idempotency story for the two onboarding edge functions
  if a user double-submits the registration form (e.g., network blip after
  the org was created but before the client saw the response)?
- Is `GEMINI_API_KEY` actually consumed by an existing (undeployed-to-this-repo)
  Supabase Edge Function today, or is it provisioned ahead of that function
  being built?
