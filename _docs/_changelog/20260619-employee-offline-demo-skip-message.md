# 2026-06-19 Employee Offline Demo Skip Message

## Changed
- Hardened `isOfflineDemoError` to classify wrapped offline demo backend skip errors when an HTTP layer prefixes the preserved skip message, for example `Request failed: Offline demo mode skipped backend request: /api/v1/employee`.
- Kept `EmployeeBoard` behavior unchanged for real backend failures while preventing the internal skip message from surfacing in the employee list alert.
- Added an employee board regression so wrapped offline demo skips keep local demo employees quiet instead of showing `员工列表加载失败`.

## Verification
- RED: `npm run test:unit -- tests/unit/offline-demo-mode.test.ts` failed on the new wrapped-message classifier case before implementation.
- GREEN: `npm run test:unit -- tests/unit/offline-demo-mode.test.ts` passed: 12 tests.
- GREEN: `npm run test:unit -- tests/unit/employee-board.test.ts` passed: 19 tests.
- GREEN: `npm run lint -- src/utils/offline-demo-mode.ts tests/unit/offline-demo-mode.test.ts tests/unit/employee-board.test.ts`.
- GREEN: `git diff --check -- src/frontend/src/utils/offline-demo-mode.ts src/frontend/tests/unit/offline-demo-mode.test.ts src/frontend/tests/unit/employee-board.test.ts` reported only CRLF normalization warnings.
- Browser evidence not completed: existing `4173` preview returned an empty Nuxt mount, and a clean dev server attempt failed with the known Nuxt/Vite error `No entry found in rollupOptions.input`.
