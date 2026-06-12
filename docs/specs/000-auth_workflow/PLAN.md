# Plan: AquaFlow Landing Page + Authentication Flow

## Context

Next.js 16 (App Router) + Clerk + Supabase project for **AquaFlow**, a water-refilling-station
management system (PH market). Today the app shows the Create-Next-App starter; Clerk is wired
into the proxy middleware (`src/proxy.ts`) and the root layout, but there is no real frontend,
no auth pages, and no post-signup onboarding. This plan delivers the two linked items in
`docs/specs/000-auth_workflow/`:

1. **Landing page** — public marketing page built exactly to
   `docs/specs/000-auth_workflow/landing-page-ui-ux.md` (AquaFlow design system).
2. **Authentication flow** — Clerk sign-up / sign-in + a `/complete-registration` onboarding form
   (owner vs staff) that POSTs to the Supabase edge function `update-clerk-session-tokens` with the
   Clerk session token, then gates app access until onboarding is complete.

Decisions (confirmed via grilling): claim-based gating, client-side axios submit, `/dashboard`
placeholder as post-registration target, build both + restructure layout, gender enum
`male | female | other`.

## Domain language (promote into a new `CONTEXT.md` during implementation)

- **Water station** — the organization an owner runs; identified to staff by an **invite code**
  (the `organization` value in the edge-function payload).
- **Owner** — creates/owns a station (`is_owner = true`); the edge function assigns the station's
  `organization` claim server-side.
- **Staff** — joins an existing station via its invite code (`is_owner = false`,
  `organization = inviteCode`).
- **Registration / onboarding** — required post-signup step that writes `is_owner` + `organization`
  into the Clerk session token.

## Gating contract (key decision — record as ADR `0001-onboarding-gating-via-clerk-claims.md`)

A user is **registered** iff:
```ts
sessionClaims?.organization != null && sessionClaims?.is_owner != null
```
Required edge-function guarantee: for owners, the function CREATES the station and sets a non-null
`organization` claim (client sends `null`, server fills it). If either claim is missing/null, the
middleware always redirects the signed-in user to `/complete-registration`. This is the access gate
to every app feature.

---

## Implementation

### 1. App-wide setup

- **`.env`** — add (Clerk reads `NEXT_PUBLIC_*` automatically):
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/complete-registration`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`
  - `NEXT_PUBLIC_SUPABASE_EDGE_REGISTRATION_URL=https://yiguiyjnuvxrhqjyyykv.supabase.co/functions/v1/update-clerk-session-tokens`
- **`src/app/providers.tsx`** (new, client) — `QueryClientProvider` (TanStack Query is mandated for
  mutations and not yet set up).
- **`src/app/layout.tsx`** — remove the global Clerk `<header>` (it clashes with the landing navbar
  and authenticated shells); add `Sora` + `Manrope` via `next/font/google` exposing
  `--font-sora` / `--font-manrope`; update `metadata` to AquaFlow; wrap `{children}` in
  `<Providers>` inside `<ClerkProvider>`.
- **`src/app/globals.css`** — add the aqua palette + fonts. Put raw hex tokens from the spec §2.2 in
  `:root` and register them in `@theme inline` (e.g. `--color-aqua-deep`, `--color-aqua-mid`,
  `--color-aqua-bright`, `--color-aqua-light`, `--color-aqua-mist`, `--color-ink`, `--color-slate`,
  `--color-fog`, plus `--font-sora`, `--font-manrope`) so Tailwind v4 utilities like
  `bg-aqua-mid` / `font-sora` work.

### 2. Middleware gating — `src/proxy.ts`

Convert `clerkMiddleware()` to the callback form (keep the `proxy` export + matcher as-is):
- `createRouteMatcher` for **public** routes: `/`, `/sign-in(.*)`, `/sign-up(.*)`.
- Logic with `const { userId, sessionClaims } = await auth()`:
  - public route → allow.
  - no `userId` → `auth.protect()` / redirect to sign-in.
  - signed in + **not** registered + not already on `/complete-registration` → redirect to
    `/complete-registration`.
  - signed in + registered + on `/complete-registration` → redirect to `/dashboard`.
- Centralize the predicate in a shared helper, e.g. `src/features/registration/registration.guards.ts`
  exporting `isRegistered(sessionClaims)` so the same check is reused in the form hook.

### 3. Clerk auth pages (Clerk default components)

- `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` → `<SignIn />`.
- `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` → `<SignUp />`.
- Optional `(auth)/layout.tsx` for a centered aqua-themed wrapper.

### 4. Registration feature — `src/features/registration/`

Follows AGENTS.md feature structure (kebab-case files, single quotes in TS, explicit return types,
no `any`, Zod validation, TanStack mutation, service holds the network call):
```
registration.schema.ts     # z.discriminatedUnion('isOwner', [ownerSchema, staffSchema])
registration.types.ts      # z.infer types
registration.constants.ts  # GENDERS = ['male','female','other'] as const; edge URL key
registration.mapper.ts     # toEdgePayload(input): owner->organization:null, staff->organization:inviteCode,
                           #   conditionally include gender / phone_number
registration.guards.ts     # isRegistered(sessionClaims)
services/registration.service.ts   # submitRegistration(input, token): axios.post(edgeUrl, payload, {Authorization: Bearer token})
hooks/use-complete-registration.ts # useMutation: getToken() via useAuth() -> service; onSuccess refresh+redirect
components/complete-registration-form.tsx  # 'use client'; RHF + zodResolver; isOwner toggle reveals branch fields
index.ts
```
- **Schema**: owner = `{ isOwner: true, waterStationName: string().min(1) }`; staff =
  `{ isOwner: false, name, phoneNumber, gender: z.enum(['male','female','other']), inviteCode }`.
- **Submit (client, axios direct)** matches `context.md`: `getToken()` from `useAuth()`, axios POST
  to the edge URL with `Authorization: Bearer <token>`; RHF+Zod validate first; handle loading /
  error / disabled-while-pending states.
- **Claim-refresh gotcha**: after the edge function updates claims, the cached session token is stale.
  On success call `getToken({ skipCache: true })` (and/or `window.location.assign('/dashboard')` for a
  hard navigation) so the middleware re-evaluates with fresh `is_owner` / `organization` claims.

### 5. Routes that use the feature

- `src/app/complete-registration/page.tsx` — renders `<CompleteRegistrationForm />` (protected; gated
  by middleware to signed-in, not-yet-registered users).
- `src/app/dashboard/page.tsx` — minimal authenticated placeholder (greeting + `<UserButton />`),
  protected by middleware; the post-registration landing target.

### 6. Landing page — build to spec, replace starter

- `src/app/page.tsx` composes presentational sections from `src/features/landing/components/`:
  `landing-navbar`, `landing-hero`, `problem-section`, `features-section`, `dashboard-preview`,
  `cta-band`, `faq-accordion`, `landing-footer`.
- Implement the spec exactly: aqua tokens only (no purple), Sora+Manrope, glassmorphism navbar +
  cards, radial gradient mesh hero, peso `₱` mockup, FAQ accordion (one panel open, vanilla state),
  responsive `≤640 / 641–1024 / ≥1025`, page-load stagger + `IntersectionObserver` scroll reveals
  honoring `prefers-reduced-motion` (small `use-reveal-on-scroll` client hook).
- Navbar **Sign In** → `/sign-in`, **Sign Up** → `/sign-up` (Clerk routes). Landing stays public.

### 7. Tests — Vitest

- `registration.schema.test.ts` — owner valid; staff valid; missing branch fields rejected; wrong
  gender rejected.
- `registration.mapper.test.ts` — owner → `organization: null`; staff → `organization: inviteCode`;
  `gender`/`phone_number` included only when present.
- `registration.guards.test.ts` — `isRegistered` true only when both claims non-null.

---

## Files (representative)

- Modify: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/proxy.ts`, `.env`
- New (app): `src/app/providers.tsx`, `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`,
  `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`, `src/app/complete-registration/page.tsx`,
  `src/app/dashboard/page.tsx`
- New (features): `src/features/registration/**`, `src/features/landing/components/**`,
  `src/features/landing/hooks/use-reveal-on-scroll.ts`
- New (docs): `CONTEXT.md` (glossary), `docs/adr/0001-onboarding-gating-via-clerk-claims.md`

## Out of scope

Real dashboard widgets, the Supabase edge function itself (assumed deployed; we only call it),
Supabase DB tables/RLS (this feature does no direct DB queries), and the customers/products/
deliveries features.

## Verification

1. `npm run lint`, `npx tsc --noEmit`, `npx vitest run`, `npm run build` — all green.
2. `npm run dev`: `/` renders the AquaFlow landing (check colors/fonts/responsive/FAQ/animations,
   no horizontal scroll on mobile).
3. Sign Up → redirected to `/complete-registration`; submit **owner** and **staff** branches; on
   success land on `/dashboard`.
4. Sign out, sign in: a registered user reaches `/dashboard`; manually clear/withhold claims to
   confirm an unregistered user is forced back to `/complete-registration` (gate works).
5. Confirm no secret keys in client bundle; `CLERK_SECRET_KEY` stays server-only.
