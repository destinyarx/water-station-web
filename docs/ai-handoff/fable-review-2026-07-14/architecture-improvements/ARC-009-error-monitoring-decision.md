# ARC-009 — Production error monitoring (decision ticket — do not implement without vendor choice)

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P1 as a decision, implementation after | Module: repo-wide / observability | Effort: Low–Medium once decided

## Problem

There is no way to know a mutation is failing for a real tenant unless a user reports it. No Sentry/PostHog/LogRocket/structured logging exists; all error handling ends at console output and user-facing toasts (`src/stores/toast-store.ts`). (`docs/ai-handoff/11-quality-and-improvements.md` Q06)

## Why this is a decision ticket, not a task

`docs/AI-GUARDRAILS.md` forbids adding dependencies without justification, and the choice involves budget, vendor, and data-residency for a Philippines-based small-business SaaS (customer names/addresses could appear in error payloads — scrubbing rules matter under RA 10173 framing already used in the privacy policy).

## Owner decisions needed

1. Vendor (Sentry free tier is the conventional default for this stack; alternatives fine).
2. What may leave the region/vendor: enable PII scrubbing; never attach Supabase row data to events.
3. Environments: production only, or staging too.

## Implementation sketch (for the follow-up ticket, once decided — assuming Sentry)

1. `@sentry/nextjs` + the wizard-generated config (client + server + edge configs; note `src/proxy.ts` is middleware — verify the edge config covers it).
2. Wire the global TanStack Query `QueryCache`/`MutationCache` `onError` (in the app's QueryClient setup) to capture, so every failed query/mutation reports once, centrally — no per-hook changes.
3. Keep the user-facing behavior identical (same toasts, same friendly error constants).
4. DSN via env var; add to `.env.example` if/when one exists (see open questions — there is no `.env.example` today).

## Acceptance criteria

- When a mutation fails in production, the system shall record an event with the friendly error constant, route, and org context (org id only — no customer PII).
- User-visible behavior shall be unchanged.

## Breakage check

SDK init order in Next.js App Router matters (instrumentation file); follow the vendor's Next 16 guide exactly. Bundle-size impact is real but acceptable; measure `npm run build` output before/after.
