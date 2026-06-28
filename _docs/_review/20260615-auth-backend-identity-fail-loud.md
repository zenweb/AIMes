# 2026-06-15 Review - Auth Backend Identity Fail Loud

## Scope

- `src/frontend/src/stores/auth.ts`
- `src/frontend/tests/unit/auth.store.test.ts`

## Review Result

- Backend login now fails loud when identity fields are blank after normalization.
- Auth state is not written for invalid login responses.
- Existing demo login and router/refresh auth tests remain green.

## Residual Risk

- This is still a focused auth-state quality slice only. It does not claim strict release readiness or close the gray observation gate.

## Verification

- `npm run test:unit -- tests/unit/auth.store.test.ts --reporter=dot` -> PASS, 10/10.
- `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts --reporter=dot` -> PASS, 28/28.

