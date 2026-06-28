# 2026-06-19 Issue - Offline Demo Auth Entry Query Preservation

## Fixed
- Unauthenticated direct entry to protected offline demo pages dropped `offlineDemo=1` during login redirect.
- This made demo credentials unreliable from real browser entry URLs even though component-level offline fallback logic was already quiet.

## Root Cause
- Production preview uses Nuxt pages and `middleware/auth.global.ts`.
- The middleware redirected unauthenticated users with `navigateTo('/login')`, discarding the explicit offline-demo query.
- The older SPA router guard had the same pattern with `next('/login')`.

## Resolution
- Both routing layers now preserve only the demo-entry query keys:
  - `offlineDemo`
  - `demoMode`

## Verification
- Cleared browser storage.
- Opened `/scheduling/employee?offlineDemo=1`.
- Confirmed redirect to `/scheduling/login?offlineDemo=1`.
- Logged in with `admin/admin123`.
- Confirmed Employee page rendered demo data with no `Offline demo mode skipped backend request` text.
