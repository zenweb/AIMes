# 2026-06-19 Review - Offline Demo Auth Entry Query Preservation

## Scope
- Reviewed the protected-route to login transition for explicit offline demo entry.
- Covered both Nuxt middleware and SPA router guard because production preview uses Nuxt pages/middleware while legacy/unit coverage still exercises `src/router`.

## Findings
- No blocking findings in this slice.
- The change only forwards `offlineDemo` and `demoMode`; it does not forward arbitrary protected-page query parameters into login.
- Existing password-change and role-restriction behavior remains covered by router auth tests.

## Residual Risk
- Login still redirects successful users to `/dashboard`; returning to the originally requested protected page is not implemented in this slice.
- This is acceptable for the current leak fix because the explicit offline mode now survives and the user can navigate to the intended module without backend auth failure.

## Verification
- Nuxt auth middleware unit test passed.
- Router/auth/login unit tests passed.
- Offline demo regression package passed: 412 tests.
- Production build passed.
- Real browser verified the cleared-state offline demo employee entry, demo login, and employee list rendering without backend-skip leakage.
