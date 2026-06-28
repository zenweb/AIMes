# 2026-06-21 Employee Offline Demo Real Browser Evidence

## Change
- Added a focused Playwright e2e case in `src/frontend/tests/e2e/employee.spec.ts`.
- Added evidence report `_docs/_reports/frontend-real-browser-employee-offline-demo-20260621.md`.

## Why
- The Employee page previously had user-visible risk where offline-demo backend skips could appear as an employee-list load failure.
- Unit tests prove classifier behavior; this slice adds a real Chromium production-build entry check for the actual user path.

## Evidence
- `npm run test:e2e -- tests/e2e/employee.spec.ts -g "显式离线演示入口展示本地员工且不暴露 backend skip 技术错误"`
- Result: PASS, 1/1.

