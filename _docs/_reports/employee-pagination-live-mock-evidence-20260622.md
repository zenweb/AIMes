# Employee Pagination Live Mock Evidence

Date: 2026-06-22

## Scope

Employee management pagination evidence for the existing `EmployeeBoard` workflow.

This slice verifies that a live-backend-style mocked employee list with 25 active employees:
- renders page 1 with `EMP-001`;
- keeps `EMP-013` off page 1;
- exposes pagination with `共 25 条`;
- moves to page 2 and renders `EMP-013`;
- resets to page 1 when search narrows to `EMP-025`;
- avoids global 401 redirects before pagination.

## Root Cause

The focused pagination E2E previously failed because the live mock employee route did not also mock global app requests.

Two global requests returned 401 during the employee page lifecycle:
- `/hubs/notifications/negotiate?negotiateVersion=1`
- `/api/v1/scheduling/anomaly-dispatch-records?take=12`

Those 401 responses triggered the shared HTTP auth recovery path, which cleared auth state and navigated between `/scheduling/login` and `/scheduling/dashboard`.

## Change

`src/frontend/tests/e2e/employee.spec.ts` now gives the employee live mock helper a complete page-level mock surface:
- authenticated local storage session via `page.addInitScript`;
- SignalR notification negotiation mock;
- generic `/api/v1/**` evidence write mock;
- specific employee list mock with 25 employees;
- diagnostic assertion that no 401 response occurs before pagination.

Production employee code was not changed in this slice.

## Verification

Passed:

```powershell
npm run test:e2e -- tests/e2e/employee.spec.ts -g "员工分页"
```

Result: 1 passed.

Passed:

```powershell
npm run test:unit -- tests/unit/employee-board.test.ts
```

Result: 1 file passed, 23 tests passed.

Passed:

```powershell
npm run build
```

Result: Nuxt production build completed.

Passed after widening the audit scope:

```powershell
npm run test:e2e -- tests/e2e/employee.spec.ts
```

Result: 19 passed, 1 skipped. The skipped case is `[employee-live-backend]` and remains gated by `AIMES_E2E_LIVE_BACKEND=true`.

Passed after fixing the offline recovery link assertion:

```powershell
npm run test:e2e -- tests/e2e/employee.spec.ts -g "离线员工页提供切换在线后端入口"
```

Result: 1 passed.

Passed after the widened E2E run:

```powershell
npm run test:unit -- tests/unit/employee-board.test.ts
```

Result: 1 file passed, 23 tests passed.

Checked:

```powershell
git diff --check -- src/frontend/tests/e2e/employee.spec.ts _docs/_reports/employee-pagination-live-mock-evidence-20260622.md _docs/_review/20260622-employee-pagination-live-mock-evidence.md _docs/_todo/20260622-employee-pagination-live-mock-next-actions.md _docs/_changelog/20260622-employee-pagination-live-mock.md
```

Result: no whitespace errors; existing LF/CRLF warning remains for `src/frontend/tests/e2e/employee.spec.ts`.

## Residual Risk

The employee E2E file has pre-existing staged and unstaged changes. This evidence now proves the current employee E2E file under the default offline-demo E2E environment, except for the explicitly skipped live backend case.
