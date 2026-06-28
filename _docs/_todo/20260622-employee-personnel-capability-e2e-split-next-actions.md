# Todo - Employee E2E expansion split next actions - 2026-06-22

- Keep current staged multi-slice package unchanged until review or intentional rebuild.
- When ready to split, decide package boundary first:
  - whole employee E2E expansion: include pagination live mock, offline-demo entry expansion, live-backend-gated scenario, and personnel capability tests;
  - strict personnel-only: create a narrower patch and exclude pagination/offline-demo/live-backend hunks.
- Latest candidate verification is fresh: `npm run test:e2e -- tests/e2e/employee.spec.ts --grep "Employee 人员能力约束"` passed 15 Chromium tests.
- Latest focused unit verification is fresh: `npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/skill-matrix-panel.test.ts` passed 29 tests.
- Latest lint verification is fresh: `npx eslint tests/e2e/employee.spec.ts --max-warnings 0` passed.
- Current-turn recovery verification is fresh: `npm run test:e2e -- tests/e2e/employee.spec.ts --grep "Employee offline demo entry"` passed 3 Chromium tests.
- Run these E2E commands sequentially; concurrent runs can contend for the shared `4174` test server port.
- Latest full-file compatibility verification is fresh: `npm run test:e2e -- tests/e2e/employee.spec.ts` passed 19 Chromium tests with 1 live-backend-gated test skipped.
- Re-run both commands after staging the split or after any additional `employee.spec.ts` edit.
- Re-run `git diff --cached --check`.
- Do not claim full CC plan completion from this E2E split.
