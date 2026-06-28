# Employee live recovery base-path evidence - 2026-06-22

## Scope

Hardened the Employee offline-demo live-backend recovery link so it follows the configured Nuxt app base path instead of hardcoding `/scheduling`.

## Change

- `EmployeeBoard.vue` now builds `liveBackendRecoveryHref` with `appAssetPath('login?offlineDemo=0&redirect=/employee?offlineDemo=0')`.
- `employee-board.test.ts` now stubs `BASE_URL=/factory/scheduling/` and verifies the recovery link becomes `/factory/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0`.

## TDD Evidence

- RED:
  - `npm run test:unit -- tests/unit/employee-board.test.ts -t "configured app base path"`
  - Failed because the link still returned `/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0`.
- GREEN:
  - `npm run test:unit -- tests/unit/employee-board.test.ts -t "configured app base path"`: PASS, 1/1.
  - `npm run test:unit -- tests/unit/offline-demo-mode.test.ts`: PASS, 16/16.
  - `npm run test:unit -- tests/unit/employee-board.test.ts`: PASS, 21/21.
  - `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-employee-live-backend-evidence.ps1`: PASS after the base-path change; default `/scheduling/` live-backend recovery remains green.

## Boundary

This slice only changes the Employee live-backend recovery href generation. It does not change login, backend auth, offline-demo detection, or release gates.
