# Changelog - Employee base login offline demo recovery - 2026-06-22

## Changed
- Fixed Nuxt auth middleware path handling so `/scheduling/login` is treated as the login route when clearing stale offline demo sessions.
- Added a focused unit regression test proving base-prefixed live login clears `demo-token-*` sessions and sets `aimes_offline_demo=false`.

## Verified
- `npm run test:unit -- tests/unit/nuxt-auth-middleware.test.ts`
- `npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/nuxt-auth-middleware.test.ts`
- `npm run test:e2e -- tests/e2e/employee.spec.ts`
- `npm run build`
- Live backend health/login/employee API checks on port 5003.
- Browser verification through `http://127.0.0.1:4173/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0`.
