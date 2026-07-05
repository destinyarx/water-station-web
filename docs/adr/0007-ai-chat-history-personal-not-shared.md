# ADR 0007 — AI chat history is personal-per-user, not a shared org queue

- **Status:** Accepted
- **Date:** 2026-07-04
- **Feature:** `docs/specs/011-aquaflow-ai-feature`

## Context

Every existing org-scoped module (deliveries, maintenance) treats its records as
a **shared org queue**: RLS grants read/write to any member of the organization
regardless of `created_by`, because the records describe shared operational
work (a delivery, a maintenance task) that any staff member may act on.

AquaFlow AI conversations are different — they're one person's Q&A session with
an assistant, not an operational record other staff act on.

## Decision

`ai_conversations` and `ai_messages` scope SELECT/INSERT/UPDATE/DELETE to
`org_id = jwt.org` **and** `created_by = jwt.sub`. A user cannot see or continue
another org member's AI conversations, even though both are in the same
organization. This is a deliberate deviation from the deliveries/maintenance
shared-queue pattern — do not "fix" it to match those modules.

## Consequences

- If a future spec wants shared/handoff-able AI conversations (e.g. an owner
  reviewing a staff member's AI session), that's a new capability requiring an
  explicit RLS/UI change, not a bug fix.
- Access to the module itself is owner-only (see ADR 0008), so in practice this
  policy currently only matters for multiple owner accounts in one org, if that
  ever exists.
