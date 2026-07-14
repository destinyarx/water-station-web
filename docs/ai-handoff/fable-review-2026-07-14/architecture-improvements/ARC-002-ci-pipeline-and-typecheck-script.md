# ARC-002 — Add a CI workflow (lint + typecheck + test) and a `typecheck` npm script

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P1 | Module: repo/devops | Effort: Low

## Problem

Nothing is enforced automatically: no `.github/workflows/*`, no `vercel.json`, no Dockerfile. Every quality gate (`CLAUDE.md`'s verification rules) relies on a human or agent remembering to run commands. There is also no `typecheck` script — agents must know to run `npx tsc --noEmit` ad hoc. (`docs/ai-handoff/11-quality-and-improvements.md` Q05 + Q16)

## Steps

1. Add to `package.json` scripts: `"typecheck": "tsc --noEmit"`.
2. Create `.github/workflows/ci.yml`:
   ```yaml
   name: CI
   on:
     pull_request:
     push:
       branches: [master, development]
   jobs:
     verify:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 22
             cache: npm
         - run: npm ci
         - run: npm run lint
         - run: npm run typecheck
         - run: npm run test
   ```
3. Do **not** add `npm run build` to CI yet — the build needs the `NEXT_PUBLIC_*` env vars, which would require adding repository secrets first. Add a build step as a follow-up once secrets are provisioned (note this in the PR).
4. Optionally enable branch protection on `master` requiring the `verify` job (owner action in GitHub settings — document as a manual step).

## Acceptance criteria

- When a PR targets `master` or `development`, the system shall run lint, typecheck, and the test suite and report status on the PR.
- `npm run typecheck` shall exist and pass locally (it passed with 0 errors at review time).

## Breakage check

Pure addition; cannot break the app. Known baseline at review time: 48 files / 208 tests green, lint 0 errors / 13 warnings, tsc clean — CI should go green on the first run. If it doesn't, the failure is real drift, which is exactly the point.
