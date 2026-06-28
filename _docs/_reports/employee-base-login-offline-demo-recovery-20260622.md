# Employee base login offline demo recovery evidence - 2026-06-22

## Scope
- Fixed the employee live-backend recovery path when users enter the Nuxt app through the base-prefixed URL `/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0`.
- The goal is to prevent stale offline demo storage from skipping the live `/api/v1/employee` backend request.

## Root Cause
- The Nuxt auth middleware treated only `/login` as the public login route.
- In preview/runtime entry, users access `/scheduling/login`; stale `demo-token-*` sessions could remain long enough for employee reads to be skipped by offline demo mode.

## Evidence
- Unit: `npm run test:unit -- tests/unit/nuxt-auth-middleware.test.ts` passed, 7 tests.
- Unit: `npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/nuxt-auth-middleware.test.ts` passed, 27 tests across 2 files.
- E2E: `npm run test:e2e -- tests/e2e/employee.spec.ts` passed, 14 Chromium tests.
- Build: `npm run build` passed.
- Backend live chain:
  - `GET http://127.0.0.1:5003/health` returned 200.
  - `POST /api/v1/auth/login` with `admin / admin123` returned 200.
  - `GET /api/v1/employee?page=1&pageSize=20` with the live token returned `3/3`.
- Browser:
  - Seeded stale demo storage with `aimes_offline_demo=true` and `demo-token-admin`.
  - Opened `http://127.0.0.1:4173/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0`.
  - Middleware cleared token/user storage and set `aimes_offline_demo=false`.
  - Online login navigated to `http://127.0.0.1:4173/scheduling/employee?offlineDemo=0`.
  - Browser state showed a non-demo JWT token, `aimes_offline_demo=false`, 3 employee cards, and no `[data-employee-live-recovery]` banner.

## Result
- PASS. The employee list no longer remains trapped in offline demo skip mode through the base-prefixed live login entry.
- PASS. Employee offline demo entry, online backend recovery, capability constraints, report linkage, and audit replay E2E coverage all passed after the fix.
