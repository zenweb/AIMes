# 2026-06-15 Review - Router Auth Role Evidence Required

## Scope

- `src/frontend/src/router/index.ts`
- `src/frontend/tests/unit/router-auth.test.ts`

## Review Result

- Protected routes now require token, cached user, and normalized role evidence.
- Missing-role sessions are treated as unauthenticated, not merely unauthorized.
- Existing auth store and refresh-token tests remain green.

## Residual Risk

- This is a focused auth/router quality slice and does not claim full CC plan completion or final release readiness.

## Verification

- `npm run test:unit -- tests/unit/router-auth.test.ts --reporter=dot` -> PASS, 14/14.
- `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts --reporter=dot` -> PASS, 31/31.

