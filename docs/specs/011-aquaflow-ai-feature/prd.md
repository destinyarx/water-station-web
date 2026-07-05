# PRD — AquaFlow AI Assistant

## Problem Statement

A water station owner has to piece together how the business is doing —
revenue trend, low stock, today's deliveries, overdue maintenance, biggest
expenses, quiet customers — by opening several different modules and eyeballing
tables. There's no single place to ask a plain-language question ("how's
revenue trending?") and get a business-tailored answer back.

## Solution

Add an owner-only **AquaFlow AI** chat module: a ChatGPT-style interface with a
conversation sidebar, a message thread, and a set of ready-made,
business-tailored prompts (e.g. "Analyze my sales"). For this spec, the
assistant's "intelligence" is a placeholder — a local mock endpoint returns
canned, business-shaped answers (plain text, or one of three structured card
types: insight, flag, ranked list) — but the full pipeline (persistence, RLS,
UI, request/response contract) is real, so a later spec can swap the mock URL
for a real Supabase Edge Function calling Gemini without touching the
frontend.

Scope is limited to the AquaFlow AI module. No real business-data querying, no
real LLM call, no streaming — see Out of Scope.

## User Stories

1. As an owner, I want to see a dedicated "AI Assistant" item in the sidebar nav, so that I can find AquaFlow AI without hunting for it.
2. As an owner, I want the AI Assistant nav item hidden entirely when I'm not the owner (staff session), so that staff aren't shown a feature they can't use.
3. As a staff member, I want to be redirected away if I try to open the AquaFlow AI route directly, so that I can't bypass the UI gate by guessing the URL.
4. As an owner, I want to see a row of ready-made prompt cards with short titles (e.g. "Analyze my sales") when I open a new/empty conversation, so that I know what kinds of questions the assistant can help with.
5. As an owner, I want each ready-made prompt to represent a much more detailed, prompt-engineered question behind the scenes, so that the assistant (once real) gets enough context to give a genuinely useful answer, not a shallow one.
6. As an owner, I want clicking a ready-made prompt to immediately send it, so that I don't have to retype or edit anything for a common question.
7. As an owner, I want the chat bubble for a ready-made-prompt message to show the short title rather than the full underlying prompt text, so that my conversation stays readable.
8. As an owner, I want to type my own free-text question into a message composer and send it, so that I'm not limited to the ready-made prompts.
9. As an owner, I want the send control disabled while a response is pending, so that I don't accidentally fire duplicate requests.
10. As an owner, I want to see a typing/thinking indicator while waiting for a response, so that I know the assistant is working.
11. As an owner, I want the assistant's reply to render as a metric "insight" card (label, value, trend) when appropriate, so that numeric answers (revenue, orders) are scannable at a glance.
12. As an owner, I want the assistant's reply to render as a "flag" card (title, subtitle, colored badge) when appropriate, so that attention-needed items (low stock, overdue maintenance, quiet customers) stand out.
13. As an owner, I want the assistant's reply to render as a "ranked" list (rank, name, value, share) when appropriate, so that things like top expense categories are easy to compare.
14. As an owner, I want the assistant's reply to render as plain text when no structured shape applies, so that general answers aren't forced into a card they don't fit.
15. As an owner, I want to start a brand-new conversation, so that I can begin a fresh topic without old messages cluttering context.
16. As an owner, I want to see a list of my past conversations in a sidebar (title, preview, relative time), so that I can pick up where I left off.
17. As an owner, I want to switch between my past conversations and see their full message history, so that I don't lose earlier answers.
18. As an owner, I want only my own conversations to show up, not another owner/staff account's conversations, so that my AI usage stays private even within the same organization.
19. As an owner, I want to delete a conversation, so that I can clean up chats I no longer need.
20. As an owner, when a conversation has a long message history, I want only the most recent messages to be sent as context to the assistant, so that requests don't balloon in size/cost once real AI is wired up.
21. As an owner, I want to still be able to see my full message history in the UI even if only recent messages are used as AI context, so that scrolling back doesn't lose older messages.
22. As an owner, I want the AI Assistant page to respect my dark/light mode preference, so that it's visually consistent with the rest of the app.
23. As a developer, I want the mock endpoint's request/response contract to be the same shape a real Gemini-backed Supabase Edge Function would use, so that swapping the URL later requires no frontend code changes.
24. As a developer, I want conversations and messages to be rejected by RLS for any request from a non-owner or cross-org session, so that the database enforces the same boundary as the UI even if the UI is bypassed.
25. As a developer, I want `org_id` and `created_by` on every conversation/message row to be derived from the authenticated Clerk identity, never from client input, so that a forged payload can't spoof ownership.

## Implementation Decisions

### Scope boundary
- This spec ships UI, state management, persistence, and the request/response
  wiring. It does **not** implement real business-data querying or a real
  Gemini/LLM call — see Out of Scope.

### Access control (three layers — ADR 0008)
- **Nav:** `app-sidebar.tsx`'s nav item list gains an `"AI Assistant"` entry,
  new-badge styled per the design file, rendered only when the current
  session's `is_owner` claim is true.
- **Route:** the AquaFlow AI page independently checks `is_owner` server-side
  (mirroring how `registration.guards.ts` checks `isRegistered`) and redirects
  non-owners — this is the real security boundary, not the nav hide.
- **RLS:** every policy on `ai_conversations`/`ai_messages` requires the
  `is_owner` claim in addition to `org_id` and `created_by` matching.

### Conversation & message model (ADR 0007)
- Two new tables, following the project's standard tenant/audit shape:
  - `ai_conversations`: `id` (serial pk), `org_id` (fk → `organizations`),
    `created_by` (fk → `users.clerk_id`), `title` (text, defaults to
    `'New chat'`, updated from the first message), `created_at`, `updated_at`.
    No `deleted_at` — conversations are hard-deleted (cascade to messages).
  - `ai_messages`: `id` (serial pk), `conversation_id` (fk →
    `ai_conversations`, `on delete cascade`), `role` (enum `user` |
    `assistant`), `content` (text — the actual text sent to/received from the
    assistant), `display_text` (text, nullable — overrides what's shown in the
    bubble; used when a ready-made prompt's title differs from its full
    prompt body), `card_type` (enum `insight` | `flag` | `ranked`, nullable —
    null means plain text), `card_data` (jsonb, nullable — the structured
    payload matching `card_type`), `created_at`.
- RLS: SELECT/INSERT/UPDATE/DELETE scoped to `org_id = jwt.org` **and**
  `created_by = jwt.sub` **and** the `is_owner` claim (ADR 0007, ADR 0008).
  `org_id`/`created_by` are written from the resolved Clerk identity on
  insert, never from client input — same contract as every other module.
- History limit: no pruning/triggers. Fetching messages for display or for
  building assistant request context uses a query `LIMIT` (most recent N
  messages, oldest-first after fetch) rather than deleting old rows. The full
  history remains readable by scrolling/paginating; only the "context sent to
  the assistant" is bounded.
- A migration file is provided at
  `docs/specs/011-aquaflow-ai-feature/011-aquaflow-ai-schema.sql`, run
  manually in the Supabase dashboard (no `supabase/migrations` folder exists
  in this repo — same convention as features 004 and 008).

### Ready-made prompts
- A static, hardcoded list (5–10 entries) of `{ title, prompt, icon/category }`
  lives in the feature's constants module — no new table, this is static
  business content, not user data.
- Each entry has a short display **title** (e.g. "Analyze my sales") and a
  separate, long, prompt-engineered **prompt body** written for an LLM
  analyzing water-station business data (revenue, stock, deliveries,
  maintenance, expenses, customers).
- Clicking a prompt card creates a `role = user` message where `display_text`
  = the title and `content` = the full prompt body. The chat bubble renders
  `display_text` when present, else `content`.

### Mock assistant endpoint (new pattern for this repo)
- First `route.ts` handler in the codebase:
  `src/app/api/aquaflow-ai-mock/route.ts`. Accepts a POST body shaped like the
  eventual real edge function's request (conversation id, the bounded recent
  message history, the new message text). Returns, after an artificial delay,
  a JSON response in the same shape the real Gemini-backed edge function will
  use: `{ content: string, displayText?: string, cardType?: 'insight' |
  'flag' | 'ranked', cardData?: ... }`.
- The mock's reply logic ports the design file's `craftReply()` keyword
  matching (revenue/stock/deliveries/maintenance/expenses/customers →
  canned card payloads) so the UI is visually verifiable against the attached
  design during this spec.
- The frontend calls this endpoint through an env var (e.g.
  `NEXT_PUBLIC_SUPABASE_EDGE_AQUAFLOW_AI_URL`), matching the existing
  `NEXT_PUBLIC_SUPABASE_EDGE_REGISTRATION_URL` convention, so a future spec
  swaps the value to the real Supabase Edge Function URL with no code change.
- Single-shot response only (loading indicator → full response). No SSE/token
  streaming.

### UI / design
- Built exactly to `docs/specs/011-aquaflow-ai-feature/AquaFlow AI
  Assistant.html`, as React + Tailwind (no plain CSS beyond what can't be
  reproduced in Tailwind).
- Uses the existing `--app-*` design-token system, not a new token namespace —
  the design file's tokens (`--brand`, `--chip-bg`, etc.) map close to 1:1
  onto existing `--app-brand`, `--app-chip-bg`, etc.
- Supports dark mode via the existing `useThemeStore`, consistent with every
  other module built since feature 007/010.
- `docs/DESIGN.md` is updated with this module's patterns (chat layout,
  message bubble variants, prompt card, conversation sidebar item).

### Feature module structure
Following the existing feature-folder convention (see `src/features/documents`
for the closest analog):
- `aquaflow-ai.types.ts`, `aquaflow-ai.schema.ts`, `aquaflow-ai.mapper.ts`,
  `aquaflow-ai.keys.ts`, `aquaflow-ai.constants.ts` (ready-made prompts live
  here), `aquaflow-ai.guards.ts` (the `is_owner` access check).
- `services/aquaflow-ai.service.ts` — Supabase CRUD for
  conversations/messages, plus the fetch call to the mock endpoint.
- `hooks/` — `use-ai-conversations`, `use-ai-messages`, `use-send-ai-message`
  (mutation), `use-create-ai-conversation`, `use-delete-ai-conversation`,
  `use-aquaflow-ai-access` (route/nav guard hook).
- `components/` — page shell, conversation sidebar, message list, message
  bubble (with sub-renderers per `card_type`), ready-made-prompt card,
  message composer.

## Testing Decisions

Tests verify observable behavior, not implementation details, per
`docs/TESTING.md`. Placed under `src/features/aquaflow-ai/tests/` (and one
route-handler test outside the feature folder, alongside the new route).

- **`aquaflow-ai.guards.test.ts`** — pure function test of the `is_owner`
  access check against various session-claim shapes (owner, staff, missing
  claim). Prior art: `registration.guards.test.ts`, `products.guards.test.ts`.
- **`aquaflow-ai.schema.test.ts`** — Zod validation for the send-message input
  and the mock-endpoint response shape (valid/invalid `cardType`+`cardData`
  combinations). Prior art: `products.schema.test.ts`,
  `customer-form.schema.test.ts`.
- **`aquaflow-ai.mapper.test.ts`** — mapping a raw `ai_messages` row (and a raw
  mock-endpoint response) to the domain `Message` type, including the
  `display_text` vs `content` fallback and each `card_type` branch. Prior art:
  `documents.mapper.ts` / `products.mapper.test.ts`.
- **`aquaflow-ai.service.test.ts`** — Supabase service tests with a mocked
  client verifying: conversation/message queries are scoped to `org_id` and
  `created_by`; the message fetch applies the recent-N `LIMIT`; inserts write
  `org_id`/`created_by` from the trusted identity context, never from
  arguments; Supabase errors are surfaced. Prior art:
  `expenses.service.test.ts`, `products.service.test.ts`.
- **Mock route handler test** (new seam — first `route.ts` in the repo) — a
  focused test calling the route's exported handler function directly with
  known keywords (revenue/stock/deliveries/etc.) and asserting the expected
  `cardType`/`cardData` shape comes back, plus a fallback/plain-text case.
- **Manual verification** (per `docs/TESTING.md`, documented in
  `docs/DATABASE.md`): cross-org isolation on both tables; a staff session
  cannot read/write via RLS even with a direct Supabase call; nav item hidden
  and route redirect both confirmed for a staff session; dark/light mode
  visual check against the design file; loading/typing/error/empty states.

## Out of Scope

- Real business-data querying (no revenue/stock/delivery/maintenance/expense/
  customer data is read from the actual tables and fed to the assistant).
- Real LLM integration (no Gemini API call, no real Supabase Edge Function
  deployment).
- Token-by-token streaming.
- Staff access to any part of this module.
- Shared/handoff-able conversations between org members.
- Rate limiting or usage quotas on AI requests.
- Editing or regenerating a previously sent message.
- Exporting or searching chat history.
- A non-owner-restricted, "lite" prompt set for staff.

## Further Notes

- ADR 0007 (`docs/adr/0007-ai-chat-history-personal-not-shared.md`) and ADR
  0008 (`docs/adr/0008-owner-only-route-level-gating.md`) record the two
  deliberate deviations from existing module patterns this feature
  introduces — do not "fix" either to match the deliveries/maintenance
  shared-queue pattern.
- `CONTEXT.md` has a new "AquaFlow AI Domain" section defining Conversation,
  Message, and Ready-made prompt — use that vocabulary in the implementation
  plan and task breakdown.
- The attached design file (`AquaFlow AI Assistant.html`) is a Claude-exported
  interactive mockup; its embedded `craftReply()` logic is the reference for
  the mock endpoint's canned response behavior, and its `navOrder` array is
  the reference for nav item placement (last item, `"AI Assistant"` label).
