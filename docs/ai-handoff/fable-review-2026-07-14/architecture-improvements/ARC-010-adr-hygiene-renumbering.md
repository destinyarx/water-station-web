# ARC-010 — ADR hygiene: duplicate number 0009, inconsistent 3-digit filename

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P3 | Module: docs/adr | Effort: Low

## Problem

- `docs/adr/0009-legal-consent-via-clerk.md` and `docs/adr/0009-org-id-is-organizations-uuid.md` share number 0009 — a bare "see ADR 0009" is ambiguous (and ADR 0009 is cited in the org_id work, ISS-001).
- `003-organizations-schema-structure.md` is 3-digit while every sibling is 4-digit.

(`docs/ai-handoff/11-quality-and-improvements.md` Q14)

## Steps

1. This review adds ADRs 0011–0013, so renumber `0009-legal-consent-via-clerk.md` → **`0014-legal-consent-via-clerk.md`** (org-id keeps 0009 because external references to "ADR 0009 = uuid migration" are the more load-bearing ones — ISS-001, DATABASE.md, the ai-handoff docs all cite it).
2. Rename `003-organizations-schema-structure.md` → `0003-organizations-schema-structure.md`.
3. `git mv` both, then grep the whole repo (`docs/`, `src/`, `CONTEXT.md`, `CLAUDE.md`) for `0009-legal-consent`, `ADR 0009`, and `003-organizations` — update every hit to the new filename/number. `CONTEXT.md` is known to cite `0009-legal-consent-via-clerk.md` by full filename.
4. Add a one-line note at the top of each renamed file: "Renumbered from 0009/003 (fable review, 2026-07-14)."

## Acceptance criteria

- Every ADR shall have a unique 4-digit number.
- `grep -r "0009-legal-consent" .` (excluding git history) shall return only the renamed file and intentional changelog notes.

## Breakage check

Docs-only. The only failure mode is a missed cross-reference — the grep in step 3 is the safeguard.
