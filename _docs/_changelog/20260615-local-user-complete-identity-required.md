# 2026-06-15 Local User Complete Identity Required

## Changed

- Made `getLocalUser()` return `null` for incomplete cached user payloads.
- Kept display-name and report-actor fallback helpers tolerant for read-only UI signatures.

## Verification

- Red/green: `npm run test:unit -- tests/unit/local-user.test.ts --reporter=dot` first failed because incomplete cached users were returned, then passed 6/6 after the fix.
- Regression slice: `npm run test:unit -- tests/unit/local-user.test.ts tests/unit/auth.store.test.ts tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts --reporter=dot` -> PASS, 37/37.

