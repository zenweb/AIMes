# 2026-06-15 Auth Backend Identity Fail Loud

## Changed

- Rejected backend login responses with blank identity fields before persisting auth evidence.
- Kept auth state from silently accepting empty `username`, `displayName`, or `role`.

## Verification

- Red/green: `npm run test:unit -- tests/unit/auth.store.test.ts --reporter=dot` first failed on blank backend `username`, then passed 10/10 after the fix.
- Regression slice: `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts --reporter=dot` -> PASS, 28/28.

