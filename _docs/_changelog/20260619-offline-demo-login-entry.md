# 2026-06-19 Changelog: Offline demo login entry

## Changed
- Offline demo users no longer require forced password change after demo login.
- `offlineDemo=1` can now provide a directly usable local preview entry without requiring a live backend change-password API.

## Evidence
- RED: `npm run test:unit -- tests/unit/auth.store.test.ts` failed because demo users still persisted `mustChangePassword: true`.
- GREEN: `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/login-page.test.ts tests/unit/router-auth.test.ts` passed, 38 tests.
- Build: `npm run build` passed.
- Real browser: `http://127.0.0.1:4173/scheduling/login?offlineDemo=1` with `admin / admin123` redirected to `/scheduling/dashboard`.
- Screenshot: `output/playwright/20260619-offline-demo-login-dashboard.png`.

## Release Gate Note
- This fixes the local preview/demo entry. It does not prove live backend authentication, first gray release, or the two-week no P0/P1 observation window.
