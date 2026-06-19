# Agent Task Instructions — Deliveries Module (004)

Handoff instructions for the implementation AI agent (Codex). Read this file
first, then follow it exactly. Do not start coding until the required reading and
the blocking prerequisite are satisfied.

---

## 0. Before you do anything

1. Read the project root `AGENTS.md` / `CLAUDE.md` (agent operating rules,
   TypeScript/style/Supabase/TanStack/Zod rules, verification checklist).
2. Read the required project docs referenced there:
   `docs/CONSTITUTION.md`, `docs/ARCHITECTURE.md`, `docs/CODING_STANDARDS.md`,
   `docs/SECURITY.md`, `docs/AI-GUARDRAILS.md`, `docs/DESIGN.md`,
   `docs/DATABASE.md`, `docs/TESTING.md`, and `CONTEXT.md`
   (→ "Deliveries Domain" glossary).
3. Read this module's spec set in this folder, in order:
   - `deliveries-prd.md` — the PRD (problem, user stories, decisions).
   - `REQUIREMENTS.md` — EARS requirements (R-01…R-37).
   - `ACCEPTANCE.md` — acceptance scenarios (A-01…A-29).
   - `research.md` — codebase conventions and constraints.
   - `004-deliveries-schema.md` — the database migration (source of truth for the
     schema, constraints, and RLS).
   - `../../adr/0002-deliveries-two-entity-rolling-materialization.md` — the
     architecture decision and rejected alternatives.
4. Study the existing reference modules and mirror their structure exactly:
   `src/features/products` and `src/features/expenses`
   (schema/types/mapper/keys/constants/guards, `services/`, `hooks/`,
   `components/`, `tests/`, `index.ts`).

Do not invent product behavior beyond what the spec states. If a requirement is
genuinely ambiguous, stop and ask before implementing.

---

## 1. Blocking prerequisite (do not skip)

**Issue `issues/002-provision-deliveries-schema.md` is HITL and owned by the
human.** The four tables, enums, constraints, indexes, and RLS policies in
`004-deliveries-schema.md` must be run in the Supabase dashboard before any code
can be tested.

- Do **not** attempt to run the migration yourself or fabricate the tables.
- Confirm with the human that Issue 002 is **done** before starting Issue 003.
- If the tables do not exist yet, stop and report that you are blocked on 002.

---

## 2. Order of work

Grab issues in this dependency order. Each issue file lists its own "Blocked by".
Do not start an issue until its blockers are merged.

```
002  Provision deliveries schema            (HITL — human runs migration)   [GATE]
 └─ 003  One-time delivery: create + list   (AFK — tracer bullet)           START HERE
     ├─ 004  Delivery status lifecycle      (AFK)
     │    └─ 007  Per-occurrence editing + snapshot integrity  (AFK)
     └─ 005  Weekly recurring + materialization  (AFK)
          ├─ 006  Monthly recurrence + anchor + end date       (AFK)
          └─ 008  Schedule management: pause/edit/archive       (AFK)
```

Strict sequence to follow (one issue at a time, fully complete before the next):

1. **003** — `issues/003-one-time-delivery-create-and-list.md`
   (the tracer bullet; establishes the whole `src/features/deliveries/` scaffold).
2. **004** — `issues/004-delivery-status-lifecycle.md`
3. **005** — `issues/005-weekly-recurring-schedules-and-materialization.md`
4. **006** — `issues/006-monthly-recurrence-anchor-and-end-date.md`
5. **007** — `issues/007-per-occurrence-editing-and-snapshot-integrity.md`
6. **008** — `issues/008-schedule-management-pause-edit-archive.md`

> 004 and 005 are both unblocked once 003 lands and may be done in either order
> (or in parallel by separate agents). 006 and 008 require 005; 007 requires 004.
> If working alone, follow the numbered sequence above.

---

## 3. How to execute each issue

For every issue, follow this loop:

1. **Read** the issue file in `issues/` — its "What to build" and "Acceptance
   criteria". Map each acceptance criterion to the relevant `REQUIREMENTS.md`
   (R-xx) and `ACCEPTANCE.md` (A-xx) entries.
2. **Plan** the thin vertical slice through schema → service → hooks → UI → tests.
   Prefer editing existing patterns over new abstractions. Keep changes small and
   focused to this issue's scope only.
3. **TDD** per `docs/TESTING.md`: write failing tests first, then implement.
   Highest-value seams, with prior art:
   - Pure materialization date-generation functions (no mocks).
   - Service layer with a **mocked Supabase client**
     (`customers.service.test.ts`, `products.service.test.ts`).
   - Zod schema refinements (`*.schema.test.ts`) and the status-transition guard
     (`customers.guards.test.ts`).
   - Mappers (`*.mapper.test.ts`).
   Test external behavior, not implementation details.
4. **Implement** following the project conventions (see §4).
5. **Verify** (see §5) — all green before claiming done.
6. **Report** per AGENTS.md: files changed, summary, assumptions, commands run,
   test/lint/typecheck results, remaining manual steps.

Do not bundle multiple issues into one change set. One issue = one reviewable
slice.

---

## 4. Hard rules (from AGENTS.md — must hold)

- TypeScript strict. No `any`, no `@ts-ignore`. Use `unknown` + narrowing.
  Exported functions have explicit return types. Infer form types from Zod.
- Single quotes in TS/JS; double quotes in JSX props. kebab-case files,
  PascalCase components/types, camelCase vars.
- Supabase SDK only (no raw `fetch` for DB). Handle every `error` return.
  Never expose service-role/secret keys. Never bypass RLS.
- `org_id` and `created_by` are written from the resolved Clerk identity
  (an owner hook like `use-delivery-owner`), **never** from form input.
- TanStack Query for server state; **array** query keys via a key factory;
  mutations invalidate/update affected queries. Zustand only for UI state.
- React Hook Form + Zod (`zodResolver`); disable submit while pending; show
  validation messages; keep Supabase calls out of form components.
- shadcn/ui first; Tailwind with `cn()`; follow `docs/DESIGN.md` (Ocean Vitality,
  table-first operational dashboard). Every view handles loading/error/empty/
  populated states; tables stay readable on mobile.

### Module-specific invariants (do not violate)

- **Two entities**: `delivery_schedules` (plan/recurrence, status
  `active|paused|ended`) vs `deliveries` (dated occurrence, status
  `pending|for_delivery|completed|failed`). Keep them separate.
- **Recurrence**: frequency is derived from selected weekdays — never add a
  separate "times per week" input. Shapes must match the DB CHECK in
  `004-deliveries-schema.md`.
- **Materialization**: rolling 14-day horizon, client-triggered on deliveries-view
  load, idempotent via unique `(schedule_id, delivery_date)`. Schedule edits
  affect future occurrences only. A failed occurrence never pauses a schedule.
- **Items**: template (`delivery_schedule_items`) vs per-occurrence snapshot
  (`delivery_items`); snapshot `product_name` + `unit_price` at materialization.
  Totals computed in app, never persisted.
- **RLS**: shared org queue for operations; **owner-only** schedule soft-delete.
- **Failed** status requires `failure_remarks`; `completed`/`failed` are terminal.
- `delivered_by` is auto-stamped when moving to `for_delivery` (never a manual
  picker; no `assigned_to` in v1).
- Calendar fields are `date` (no timezone). Use the general `notes` field for
  timing hints (no `time_window` column).

---

## 5. Definition of done (per issue)

- [ ] All acceptance criteria in the issue file pass; mapped A-xx scenarios in
      `ACCEPTANCE.md` verified.
- [ ] `typecheck`, `lint`, and the test suite pass (run them; paste real output).
- [ ] No `any`, no `@ts-ignore`, no exposed secrets.
- [ ] Supabase errors handled; query keys are arrays; mutations invalidate
      affected caches.
- [ ] Loading/error/empty/populated states present on new views.
- [ ] If behavior or schema understanding changed, `docs/DATABASE.md` and the
      relevant spec doc are updated to match.
- [ ] Change set is scoped to a single issue and reviewable on its own.

---

## 6. What NOT to do

- Do not run or modify the Supabase migration (that is the human's HITL step in
  Issue 002).
- Do not implement out-of-scope items: driver assignment (`assigned_to`),
  calendar/kanban UI, structured time slots, persisted totals/reporting,
  background cron materialization, or reopening failed occurrences.
- Do not auto-sweep occurrences when a weekday is dropped — leave existing pending
  rows in place.
- Do not change architecture or introduce new abstractions unless an issue
  explicitly requires it.
- Do not close or modify the epic `001-foundation.md` or the parent spec files
  except to update documentation when behavior changes.

---

## 7. Quick reference — file map

- Epic / overview: `issues/001-foundation.md`
- Issues (grab in order): `issues/002-…` → `issues/008-…`
- Migration (human runs): `004-deliveries-schema.md`
- PRD: `deliveries-prd.md` · Requirements: `REQUIREMENTS.md` ·
  Acceptance: `ACCEPTANCE.md` · Research: `research.md`
- ADR: `../../adr/0002-deliveries-two-entity-rolling-materialization.md`
- Reference modules: `src/features/products`, `src/features/expenses`
