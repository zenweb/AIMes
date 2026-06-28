# Employee E2E expansion split report - 2026-06-22

## Status

Candidate verified, not staged into the current multi-slice package.

Boundary correction:

- Earlier wording called this a personnel-capability-only split.
- Current diff audit shows the unstaged `employee.spec.ts` candidate is broader: it includes pagination live mock, offline-demo entry expansion, a live-backend-gated recovery scenario, and personnel capability coverage.
- Therefore the whole unstaged file diff must be treated as an employee E2E expansion candidate, not a narrow personnel-only package.
- If a strict personnel-only package is required, create a smaller patch that excludes the pagination/offline-demo/live-backend hunks.

## Current Worktree Finding

Within the checked narrow `MM` scope, the next reviewed unstaged source/test candidate is concentrated in:

- `src/frontend/tests/e2e/employee.spec.ts`

The staged hunk in that file belongs to employee offline-demo recovery. The unstaged hunk belongs to a broader employee E2E expansion candidate.

Unstaged candidate subgroups found by diff audit:

- `Employee pagination live mock`: 1 test.
- `Employee offline demo entry`: 3 additional tests plus 1 live-backend-gated test.
- `Employee 人员能力约束`: 15 tests.

This is not a full dirty-worktree inventory claim. A full worktree scan still reports 230 changed files under `src/frontend`, `src/backend`, `src/tests`, `scripts`, and `_docs`; this split only isolates the next small E2E package.

## Evidence

Focused personnel capability E2E:

```text
npm run test:e2e -- tests/e2e/employee.spec.ts --grep "Employee 人员能力约束"
15 passed
```

Latest recheck:

```text
npm run test:e2e -- tests/e2e/employee.spec.ts --grep "Employee 人员能力约束"
15 passed
```

2026-06-22 current-turn recheck:

```text
npx eslint tests/e2e/employee.spec.ts --max-warnings 0
passed

npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/skill-matrix-panel.test.ts
Test Files  2 passed
Tests       29 passed

npm run test:e2e -- tests/e2e/employee.spec.ts --grep "Employee offline demo entry"
3 passed

npm run test:e2e -- tests/e2e/employee.spec.ts --grep "Employee 人员能力约束"
15 passed
```

One attempted parallel E2E run reported `http://localhost:4174/scheduling/login is already used`; this was a test-server port collision from concurrent E2E commands. The same personnel capability command passed when rerun sequentially.

Full current-worktree employee E2E:

```text
npm run test:e2e -- tests/e2e/employee.spec.ts
19 passed, 1 skipped
```

Latest full-file recheck:

```text
npm run test:e2e -- tests/e2e/employee.spec.ts
19 passed, 1 skipped
```

2026-06-22 current worktree full-file recheck:

```text
npm run test:e2e -- tests/e2e/employee.spec.ts
19 passed, 1 skipped
```

Current unit coverage for this employee slice:

```text
npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/skill-matrix-panel.test.ts
Test Files  2 passed
Tests       29 passed
```

## Boundary Decision

Keep this candidate separate from the current staged multi-slice package unless the reviewer explicitly accepts expanding the package.

Preferred options:

1. Stage the whole unstaged `employee.spec.ts` E2E expansion as one employee browser-hardening package after review.
2. Or create a narrower personnel-only patch and leave pagination/offline-demo/live-backend hunks for separate packages.

## Non-Claims

- Does not claim full frontend E2E health.
- Does not claim full personnel feature completion beyond the covered browser flows.
- Does not claim the unstaged diff is personnel-only.
- Does not claim full CC plan completion.
