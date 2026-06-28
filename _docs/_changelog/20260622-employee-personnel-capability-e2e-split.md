# 2026-06-22 - Employee E2E expansion split

## Changed

- Added a split plan for the remaining `src/frontend/tests/e2e/employee.spec.ts` personnel capability E2E candidate.
- Recorded focused E2E evidence: 15 Chromium tests passed for `Employee 人员能力约束`.
- Recorded full-file compatibility evidence: 19 Chromium tests passed and 1 live-backend-gated test skipped for `employee.spec.ts`.
- Refreshed the candidate evidence with a latest recheck: 15 focused Chromium tests passed and full-file Chromium passed with 19 passed / 1 skipped.
- Added current-turn unit evidence: `employee-board.test.ts` and `skill-matrix-panel.test.ts` passed 29 tests.
- Added current-turn lint evidence: `npx eslint tests/e2e/employee.spec.ts --max-warnings 0` passed.
- Added current-worktree full-file E2E evidence: `employee.spec.ts` passed with 19 Chromium tests and 1 live-backend-gated test skipped.
- Corrected the package boundary after diff audit: the unstaged `employee.spec.ts` candidate is broader than personnel capability and also includes pagination live mock, offline-demo entry expansion, and a live-backend-gated recovery scenario.
- Recorded that a concurrent E2E attempt can fail from shared `4174` port contention; sequential rerun passed.
- Preserved the current staged package boundary: this candidate remains unstaged until intentionally split.

## Evidence

- `_docs/_reports/employee-personnel-capability-e2e-split-20260622.md`
