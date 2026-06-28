# 2026-06-15 Router Auth Role Evidence Required

## Changed

- Required a normalized cached role before treating a session as authenticated for protected routes.
- Updated role-restricted route behavior so missing-role sessions go to login instead of dashboard.

## Verification

- Red/green: `npm run test:unit -- tests/unit/router-auth.test.ts --reporter=dot` first failed when a token plus cached user without role entered `/dashboard`, then passed 14/14 after the fix and test expectation update.
- Regression slice: `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts --reporter=dot` -> PASS, 31/31.

