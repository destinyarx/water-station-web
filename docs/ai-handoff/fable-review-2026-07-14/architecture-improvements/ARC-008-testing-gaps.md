# ARC-008 — Testing gaps: three features with no `tests/` folder; misplaced test files; no component-rendering capability

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P2 (backfill) / P3 (component harness — needs a decision) | Modules: maintenance, documents, notifications, registration | Effort: Medium

## Problem

Baseline is strong (48 files / 208 tests, green, ~9s) but coverage is uneven (`docs/ai-handoff/11-quality-and-improvements.md` Q13, Q17):

1. `src/features/{documents,notifications}` have **no tests at all** despite non-trivial logic (approval flow; column-locked realtime `is_read` handling).
2. `maintenance` has one flat `maintenance.test.ts` at the feature root instead of the per-unit `tests/` convention in `docs/TESTING.md`.
3. `registration`'s three test files sit beside their sources, not in `registration/tests/`.
4. `vitest.config.ts` uses `environment: 'node'` with no Testing Library/jsdom — component tests are impossible today. This is a **scope decision**, not an oversight.

## Steps

**Part 1 — backfill (no decision needed):**
1. `documents`: schema, mapper, guards, and service tests (mocked client) covering the approval flow and soft delete. Follow the customers feature's test files as the template.
2. `notifications`: schema/mapper tests + service test for mark-read; when ISS-010's count query lands, test it here too.
3. Move `maintenance.test.ts` into `src/features/maintenance/tests/` (split per unit if it's covering multiple units); move registration's three test files into `registration/tests/`. Pure moves — imports adjust, content unchanged.

**Part 2 — component-test harness (needs owner decision, do NOT do unilaterally):**
- Question for the owner: is manual QA (required by `docs/TESTING.md` for UI states) sufficient, or do interaction flows (two-step confirm dialog, form validation surfacing) justify adding `jsdom` + `@testing-library/react`? Adding them is new dependencies — `docs/AI-GUARDRAILS.md` requires explicit justification. If approved: add `environment: 'jsdom'` per-file via `// @vitest-environment jsdom` comments rather than switching the global environment (keeps the 208 node tests untouched).

## Acceptance criteria

- Every feature module with non-trivial logic shall have a `tests/` folder following `docs/TESTING.md`'s layout.
- When tests are moved, the total pass count shall not decrease and `npm run test` shall stay green.
- Part 2 shall not proceed without a recorded owner decision (note it in this ticket or an ADR).

## Breakage check

Test-only changes; zero runtime risk. Watch one thing on the file moves: any relative-import depth changes (`../` counts) — typecheck catches them.
