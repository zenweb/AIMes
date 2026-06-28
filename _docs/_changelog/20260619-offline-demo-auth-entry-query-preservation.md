# 2026-06-19 Offline Demo Auth Entry Query Preservation

## Change
- Preserved `offlineDemo` / `demoMode` when unauthenticated visitors are redirected from protected pages to login.
- Applied the fix in both routing surfaces:
  - Nuxt runtime middleware: `src/frontend/middleware/auth.global.ts`
  - SPA router guard: `src/frontend/src/router/index.ts`
- Added unit coverage for the Nuxt middleware and SPA router guard so the production entry path and test router stay aligned.

## Why
- Directly opening a protected offline demo URL such as `/scheduling/employee?offlineDemo=1` redirected to `/scheduling/login` without the query.
- The login page then did not prefer demo auth, so `admin/admin123` could fail or fall through to live backend behavior.

## Evidence
- RED verified:
  - `npm run test:unit -- tests/unit/router-auth.test.ts -t "preserves explicit offline demo mode"` failed because query was `{}`.
  - `npm run test:unit -- tests/unit/nuxt-auth-middleware.test.ts` failed because middleware called `navigateTo('/login')`.
- GREEN verified:
  - `npm run test:unit -- tests/unit/nuxt-auth-middleware.test.ts`: 1 passed.
  - `npm run test:unit -- tests/unit/router-auth.test.ts tests/unit/login-page.test.ts tests/unit/auth.store.test.ts`: 40 passed.
  - Offline demo regression package with Nuxt middleware: 20 files passed, 412 tests passed.
  - `npm run build`: passed.
- Real browser evidence on `http://127.0.0.1:4173/scheduling/employee?offlineDemo=1` from a cleared browser state:
  - Redirect landed on `/scheduling/login?offlineDemo=1`.
  - Demo hints appeared with `admin/admin123`.
  - Login persisted `demo-token-admin` and `aimes_offline_demo=true`.
  - Employee page rendered 8 demo cards.
  - `hasBackendSkip: false`
  - `hasEmployeeFailure: false`
  - `alertCount: 0`
