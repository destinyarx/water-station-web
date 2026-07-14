# Client-state store and data-table standards (resolving doc/code drift)

Status: proposed (fable review, 2026-07-14) — awaiting two owner decisions; see options below. Flip to accepted and fill in the chosen options when decided.

## Context

Two documented standards contradict the shipped code (full analysis: `docs/ai-handoff/fable-review-2026-07-14/architecture-improvements/ARC-007-doc-code-drift-zustand-tanstack-table.md`):

1. `CLAUDE.md`/`AGENTS.md`/`docs/CODING_STANDARDS.md`/`docs/ARCHITECTURE.md` mandate **Zustand** for client/UI state, but `zustand` is not installed; the three stores (`sidebar`, `theme`, `toast`) are deliberate hand-rolled `useSyncExternalStore` pub/subs.
2. The same docs mandate **TanStack Table** for every data table; `@tanstack/react-table` is installed but unused — all list pages are hand-rolled grids.

Every agent that touches state or tables hits these conflicts and must guess. The drift, not either implementation, is the defect.

## Decision (pending)

**D1 — client state.** Recommended: keep the hand-rolled `useSyncExternalStore` pattern and amend the four docs to describe it (same scope rules as the old Zustand section: client/UI state only, never server state/forms). Rationale: three tiny working stores don't justify a new dependency (`docs/AI-GUARDRAILS.md`). Alternative: install Zustand and rewrite the three stores.

**D2 — data tables.** Genuinely open; no default recommendation. Either (a) retrofit list pages onto `@tanstack/react-table` feature-by-feature alongside planned UI work, or (b) amend the docs to bless the shipped hand-rolled grid pattern and remove the unused dependency.

## Consequences

- Whichever way each decision goes, all four standards docs are updated in the **same PR** as the ADR acceptance so they cannot re-drift.
- Until this ADR is accepted, agents encountering the conflict must follow the shipped code and flag the conflict — not silently install/rewrite.
