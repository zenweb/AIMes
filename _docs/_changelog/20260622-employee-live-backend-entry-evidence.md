# Changelog - Employee Live Backend Entry Evidence

## Changed

- Added a focused live-browser evidence report proving `http://127.0.0.1:4173/scheduling/employee` can enter live mode with `admin / admin123`.
- Captured the post-login storage state showing `aimes_offline_demo=false` and a live JWT token instead of `demo-token-*`.
- Re-ran focused employee/auth unit coverage for the offline-demo recovery and protected live-entry path.

## Validation

- `npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/router-auth.test.ts tests/unit/auth.store.test.ts`
  - PASS: 3 files, 51 tests.
- Real browser smoke:
  - PASS: employee page renders after live login.
  - PASS: no visible `Offline demo mode skipped backend request`.
  - PASS: no visible `员工列表加载失败`.

## Boundary

This entry documents the current live employee entry evidence only. It does not stage or broaden the existing Agent E2E package.
