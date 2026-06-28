# 2026-06-15 Review - Local User Complete Identity Required

## Scope

- `src/frontend/src/utils/local-user.ts`
- `src/frontend/tests/unit/local-user.test.ts`

## Review Result

- `getLocalUser()` now represents only complete identity evidence.
- Router/auth callers can rely on `getLocalUser()` without accepting partial cached payloads.
- Existing fallback helper behavior for display/report actor remains covered.

## Residual Risk

- This is an auth identity quality slice only. It does not claim full CC plan completion or final release readiness.

## Verification

- `npm run test:unit -- tests/unit/local-user.test.ts --reporter=dot` -> PASS, 6/6.
- `npm run test:unit -- tests/unit/local-user.test.ts tests/unit/auth.store.test.ts tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts --reporter=dot` -> PASS, 37/37.

