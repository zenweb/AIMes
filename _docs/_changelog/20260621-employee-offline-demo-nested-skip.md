# 2026-06-21 Employee Offline Demo Nested Skip

## Change
- Hardened `isOfflineDemoError` so wrapped request failures can still classify an inner offline demo backend skip through `cause`, `error`, or `innerError`.
- Added regression coverage for nested offline demo skip errors.

## Why
- The Employee page must not show the raw technical message `Offline demo mode skipped backend request: /api/v1/employee` when it intentionally falls back to local demo employees.
- This keeps the existing Employee feature polished instead of exposing internal offline-demo plumbing to users.

## Evidence
- RED: `npm run test:unit -- --run tests/unit/offline-demo-mode.test.ts` failed on the new nested `cause` regression.
- GREEN: `npm run test:unit -- --run tests/unit/offline-demo-mode.test.ts tests/unit/employee-board.test.ts` passed, 35/35.
- Build: `NITRO_OUTPUT_DIR=../../tmp/employee-preview-output NUXT_BUILD_DIR=../../tmp/employee-preview-nuxt npm run build` passed.
- Real browser: `http://127.0.0.1:4174/scheduling/employee?offlineDemo=1` rendered EmployeeBoard, demo employees, guidance links, and no raw offline skip alert.

