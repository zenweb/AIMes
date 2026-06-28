# Plan - Employee E2E expansion split - 2026-06-22

## Purpose

Split the remaining `src/frontend/tests/e2e/employee.spec.ts` worktree-only employee E2E expansion candidate from the current staged multi-slice bundle.

Diff audit correction:

- The unstaged candidate is not personnel-only.
- It includes pagination live mock coverage, offline-demo entry expansion, a live-backend-gated recovery scenario, and personnel capability E2E coverage.

## Scope

If staging the whole employee E2E expansion package, include the unstaged hunks in `src/frontend/tests/e2e/employee.spec.ts` that harden:

- pagination behavior when search narrows a multi-page live mock result set;
- offline demo entry does not expose backend skip technical errors;
- live-backend-gated recovery from stale demo storage to authenticated employee API read;
- personnel capability routes use explicit `offlineDemo=1` for demo evidence flows;
- live-mock personnel capability routes use explicit `offlineDemo=0`;
- evidence write APIs are mocked for personnel E2E read/write paths;
- personnel capability flows cover replacement recommendation, no-candidate stop review, release after supervisor action, OTD evidence, Agent governance, and audit replay.

If staging a strict personnel-only package, first split out a narrower patch that excludes pagination, offline-demo entry expansion, and live-backend-gated recovery hunks.

## Exclusions

- Do not stage unrelated dirty worktree files.
- Do not include the already staged employee recovery-link hunk as new work.
- Do not treat this split as proof that the full CC plan or v1.0.0 release gate is complete.

## Validation

Before staging this split:

```powershell
cd src/frontend
npm run test:e2e -- tests/e2e/employee.spec.ts --grep "Employee 人员能力约束"
npm run test:e2e -- tests/e2e/employee.spec.ts
```

After staging this split:

```powershell
git diff --cached --check
```

## Current Evidence

- `npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/skill-matrix-panel.test.ts`: 29 tests passed.
- `npm run test:e2e -- tests/e2e/employee.spec.ts --grep "Employee 人员能力约束"`: 15 Chromium tests passed.
- `npm run test:e2e -- tests/e2e/employee.spec.ts`: 19 Chromium tests passed, 1 live-backend-gated test skipped.

## Stop Condition

This split is ready only when the staged diff matches the explicitly chosen package boundary and the validation commands above pass against the staged/current state.
