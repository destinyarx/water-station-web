# Open Questions

Unresolved matters surfaced while writing this handoff package, aggregated
from every domain document. Do not attempt to silently resolve these — flag
them to the project owner, or verify against the live Supabase project /
running app before relying on an assumption.

One major question raised during drafting — *"is `src/proxy.ts` actually
wired as Next.js middleware?"* — was **resolved** during this pass via
runtime log evidence (`docs/specs/010-rebuild-ui-ux-deliveries-module/next-dev.log`)
and is not repeated here. See [`03-specification-status.md`](03-specification-status.md)
row 1.

## Product questions

| Question | Why it matters | Evidence or conflict | Suggested owner |
| --- | --- | --- | --- |
| Is there a real monetization/pricing model, or is "free" in the legal copy just placeholder framing? | Affects whether billing/subscription work belongs on any future roadmap. | `docs/specs/012-privacy-policy-and-terms-condition/*` mentions no pricing; no billing feature or Stripe-like dependency exists in `package.json`. | Product owner |
| Is there a timeline for the deferred Sales/Orders/Payments/Inventory-reporting/Settings/Team modules? | `/sales` is a bare stub with no feature module or spec; other roles mentioned in `CONTEXT.md` (staff/team management UI) don't have dedicated specs yet. | `src/app/(protected)/sales/page.tsx` (~10 lines); [`04-feature-map.md`](04-feature-map.md) row "Sales". | Product owner |
| Is there a timeline for a real file-storage backend for Documents? | Today `documents.service.ts` never calls Supabase Storage — uploads are metadata-only by design (`ponytail:` comment), blocking any real "view uploaded file" or mobile camera-capture use case. | [`11-quality-and-improvements.md`](11-quality-and-improvements.md) Q03. | Product owner |
| When (if ever) does AquaFlow AI get a real LLM instead of the keyword-matched mock, and what real business data would it be allowed to read? | Determines the shape of the eventual `/api/aquaflow-ai-mock` replacement and what RLS/authz guarantees it needs. | `src/app/api/aquaflow-ai-mock/route.ts`; `docs/specs/011-aquaflow-ai-feature/prd.md`. | Product owner |
| Which version of the registration/onboarding edge-function contract is current — the single-function description in `docs/specs/000-auth_workflow/context.md`, or the two-function description in `CONTEXT.md`? | An agent touching registration could implement against the stale description. | [`03-specification-status.md`](03-specification-status.md) row 2 flags `context.md` as **Potentially outdated**. | Product owner / whoever owns the Supabase Edge Functions |

## Business-rule questions

| Question | Why it matters | Evidence or conflict | Suggested owner |
| --- | --- | --- | --- |
| Should customer edit permission have an owner override (like products), or is creator-only intentional? | `customers.guards.ts:canEditCustomer` only checks `deletedAt`, no creator check — but `docs/DATABASE.md`'s documented UPDATE policy requires `created_by = jwt.sub`. If that policy is live, staff could see an Edit button that fails at submit. | [`03-specification-status.md`](03-specification-status.md) row "Customer edit permission (owner override)". | Product owner |
| Was deliveries' revert/reopen capability (ADR 0003: `completed→pending`, etc.) deliberately retired by feature 010, or is it a regression? | `DeliveryStatusMenu`/`delivery-history-dialog.tsx` still wire an `onReverted` callback that can never fire (`completed: []`, `failed: []` in `LEGAL_NEXT`) — dead UI, no ADR records the removal. | [`03-specification-status.md`](03-specification-status.md) row "Deliveries — stock-at-dispatch + reversible terminal states". | Product owner / deliveries feature owner |
| Is monthly delivery recurrence still planned, or should the schema fields (`day_of_month`, `interval_months`) be removed? | `dueDatesFor()` returns `[]` immediately for anything but `weekly` — the schema implies a working feature that doesn't exist. | [`03-specification-status.md`](03-specification-status.md) row "Deliveries — monthly recurrence". | Product owner |
| What is the actual RLS policy for `expenses`? | `docs/DATABASE.md`'s expenses section is a placeholder checklist, not real column/policy documentation — required by `docs/SECURITY.md`. | [`03-specification-status.md`](03-specification-status.md) row "Expenses RLS / ownership model"; [`11-quality-and-improvements.md`](11-quality-and-improvements.md) Q15. | Whoever owns the Supabase schema |

## Architecture questions

| Question | Why it matters | Evidence or conflict | Suggested owner |
| --- | --- | --- | --- |
| Should Zustand be added as a real dependency, or should `CLAUDE.md`/`docs/ARCHITECTURE.md`/`docs/CODING_STANDARDS.md` be amended to describe the hand-rolled `useSyncExternalStore` stores actually in use? | An agent asked to "add a Zustand store" hits a documented-vs-actual conflict today. | [`11-quality-and-improvements.md`](11-quality-and-improvements.md) Q11; `zustand` absent from `package.json`. | Tech lead |
| Should TanStack Table be retrofitted onto list pages, or should the "always use TanStack Table" rule in `CLAUDE.md`/`docs/CODING_STANDARDS.md` be relaxed to match the shipped hand-rolled grids? | Same kind of doc/code drift, higher retrofit cost. | [`11-quality-and-improvements.md`](11-quality-and-improvements.md) Q10; `@tanstack/react-table` installed but unused per [`05-codebase-map.md`](05-codebase-map.md). | Tech lead / design owner |
| Are `/dashboard` (static mock) and `/sales` (empty stub) and `/playground` (internal dev tool) intentionally in their current state, or missing work? | Affects whether they should be hidden from nav, gated, or built out. | [`04-feature-map.md`](04-feature-map.md) rows Dashboard/Sales/Playground. | Product owner |
| What is the actual deployment target and pipeline? | No CI, no IaC, no Dockerfile found — only a `.gitignore` entry hints at Vercel. | [`12-testing-and-operations.md`](12-testing-and-operations.md); [`11-quality-and-improvements.md`](11-quality-and-improvements.md) Q05. | DevOps owner |
| How are dev/staging/production environments actually separated? | Only a single `.env` file exists in the repo; no `.env.example` or per-environment convention found. | [`08-api-and-integrations.md`](08-api-and-integrations.md). | DevOps owner |

## Security questions

| Question | Why it matters | Evidence or conflict | Suggested owner |
| --- | --- | --- | --- |
| Do the live `customers`/`products` tables use `integer org_id` (per `docs/DATABASE.md`) or `uuid org_id` (per ADR 0009 and the Zod schemas)? | The single most security-critical column in the schema is documented two contradictory ways. If the live column is still `integer`, code paths built against the uuid assumption would hard-fail at insert. | [`03-specification-status.md`](03-specification-status.md) row 8; [`07-data-architecture.md`](07-data-architecture.md) §5.1; [`10-security-and-risks.md`](10-security-and-risks.md) risk row. | Whoever has live Supabase dashboard access |
| Does the live database's RLS actually match what `docs/DATABASE.md` documents, for every tenant-owned table? | No `supabase/migrations` folder exists — schema is applied manually, so there is no version-controlled proof that documented policy matches deployed policy. | [`10-security-and-risks.md`](10-security-and-risks.md); [`07-data-architecture.md`](07-data-architecture.md). | Whoever has live Supabase dashboard access |
| What do the three Supabase Edge Functions (`create-aquaflow-organization`, `aquaflow-add-staff`, the "Smooth Handler" email function) validate server-side? | Their source lives outside this repo; the client only knows the public URL and payload shape. Determines whether client-supplied fields could be trusted incorrectly. | [`08-api-and-integrations.md`](08-api-and-integrations.md); [`10-security-and-risks.md`](10-security-and-risks.md). | Whoever owns the Supabase project's Edge Functions |
| Is `public.delivery_schedule_dates`'s RLS intentionally based on `auth.uid()` (native Supabase auth) rather than the `auth.jwt()` Clerk-claim pattern used everywhere else? | An inconsistent identity model on one table is either a bug or an intentional exception worth documenting. | [`03-specification-status.md`](03-specification-status.md), [`07-data-architecture.md`](07-data-architecture.md). | Whoever owns the Supabase schema |
| Has a git-history secret scan ever been run? | `.env` is gitignored today, but historic commits weren't audited during this pass. | [`10-security-and-risks.md`](10-security-and-risks.md). | Security owner |
| What do `private.is_org_member(org_id)` and `create_maintenance_notification()` actually do? | Referenced by RLS policies / triggers in `docs/DATABASE.md` but their function bodies are not committed anywhere in this repo. | [`07-data-architecture.md`](07-data-architecture.md). | Whoever has live Supabase dashboard access |

## Data questions

| Question | Why it matters | Evidence or conflict | Suggested owner |
| --- | --- | --- | --- |
| What are the full, current columns of `organizations` (does `organization_code` still exist alongside `id`)? | No single authoritative source describes the live `organizations` table shape. | [`07-data-architecture.md`](07-data-architecture.md). | Whoever has live Supabase dashboard access |
| Is `GEMINI_API_KEY` (present as an env var, unused anywhere in `src/`) already consumed by an undeployed edge function, or provisioned ahead of time for future use? | Clarifies whether the AquaFlow AI mock has a known real-LLM successor already in progress outside this repo. | [`08-api-and-integrations.md`](08-api-and-integrations.md). | Product owner |

## Deployment questions

| Question | Why it matters | Evidence or conflict | Suggested owner |
| --- | --- | --- | --- |
| What is the actual hosting platform and release process? | Only inferred from a `.gitignore` entry; no CI/CD config found in the repo. | [`12-testing-and-operations.md`](12-testing-and-operations.md). | DevOps owner |

## Mobile questions

| Question | Why it matters | Evidence or conflict | Suggested owner |
| --- | --- | --- | --- |
| Shared-package (monorepo) vs. duplicated-file strategy for reusing types/schemas/business logic in a mobile client? | Affects the very first structural decision of any mobile effort. | [`13-mobile-handoff.md`](13-mobile-handoff.md) "Proposed mobile migration plan". | Tech lead |
| Is offline support actually required for field workers (weak signal at delivery/maintenance sites), or is "online-only with retry" acceptable for v1? | Materially changes the mobile architecture recommendation and effort estimate. | [`13-mobile-handoff.md`](13-mobile-handoff.md). | Product owner |
| Should Capacitor be pursued in parallel with an Expo app, or skipped entirely in favor of the phased Responsive-PWA → Expo plan recommended in this pass? | Avoids splitting mobile effort across two native strategies without a clear reason. | [`13-mobile-handoff.md`](13-mobile-handoff.md) "Recommendation". | Product owner |

## Documentation conflicts

| Question | Why it matters | Evidence or conflict | Suggested owner |
| --- | --- | --- | --- |
| Reconcile `docs/DATABASE.md`'s `org_id` type contradiction (customers/products documented as `integer`, notifications/ai_conversations documented as `uuid`). | Same issue as the security question above, but as a pure documentation-hygiene fix once the live type is confirmed. | [`03-specification-status.md`](03-specification-status.md) row 8. | Whoever maintains `docs/DATABASE.md` |
| **Resolved 2026-07-15:** legal consent moved to ADR 0014 and organizations architecture to padded ADR 0003. | ADR 0009 now unambiguously identifies the organization UUID decision. | [`docs/adr/0014-legal-consent-via-clerk.md`](../adr/0014-legal-consent-via-clerk.md) | — |
| `docs/DATABASE.md` has no section at all for `public.documents`. | The Documents feature's schema is undocumented outside its original spec's migration SQL. | [`04-feature-map.md`](04-feature-map.md) Documents row. | Whoever maintains `docs/DATABASE.md` |

## Missing repository information

- No `supabase/migrations` folder — schema/RLS changes are applied manually in the Supabase dashboard; the only paper trail is `docs/DATABASE.md` plus per-spec SQL/markdown snapshots (some of which are already known to be stale — see the `org_id` conflict above).
- No `.env.example` — env var names had to be inferred from source code references rather than read from a documented template.
- No CI configuration (`.github/workflows`, `vercel.json`, Dockerfile) found anywhere in the repo.
